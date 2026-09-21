"use client";

import { useState } from "react";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { DownloadIcon, EditIcon } from "@/components/common/SvgIcon";
import { formatCurrency } from "@/utils/helpers";
import { downloadReceipt, retryUserInstallment, skipUserInstallment, updateUserInstallmentAmount } from "@/services/donationService";
const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

// The API sends a derived `state` covering every payment outcome; the label the donor sees comes
// from here so all six stay distinguishable (scheduled / successful / failed / skipped / missed,
// with "retried" shown as a marker beside the outcome).
const STATE_LABELS = {
  scheduled: "Scheduled",
  successful: "Successful",
  failed: "Failed",
  missed: "Missed",
  skipped: "Skipped",
  superseded: "Replaced",
  refunded: "Refunded",
  requires_action: "Action Required",
  processing: "Processing",
  pending: "Pending",
};

function statusClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "successful" || s === "succeeded") return "text-[#047857]";
  if (s === "failed" || s === "missed") return "text-[#EA3335]";
  if (s === "pending" || s === "processing" || s === "requires_action") return "text-[#B45309]";
  if (s === "refunded" || s === "scheduled" || s === "skipped" || s === "superseded") return "text-[#6B7280]";
  return "text-[#047857]";
}
function statusDotClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "successful" || s === "succeeded") return "bg-[#047857]";
  if (s === "failed" || s === "missed") return "bg-[#EA3335]";
  if (s === "pending" || s === "processing" || s === "requires_action") return "bg-[#B45309]";
  if (s === "refunded" || s === "scheduled" || s === "skipped" || s === "superseded") return "bg-[#6B7280]";
  return "bg-[#047857]";
}
function formatShortDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

const HEADERS = ["Date", "Amount", "Cause", "Status", "Receipt"];

// Mirrors the API rules so we never offer an edit that would be rejected.
const EDITABLE_ROW_STATUSES = new Set(["pending", "failed"]);
const EDITABLE_SCHEDULE_STATUSES = new Set(["active", "paused"]);

function HistoryRow({ row, currency, donationId, onError, onSaved, scheduleStatusKey, installmentBaseAmount, skipEligible, onRequestSkip, onRequestRetry, canModifySchedule = true }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const date = formatShortDate(row?.date) || "—";
  const amount = Number(row?.amount ?? 0);
  const cur = String(row?.currency || currency);
  const causes = Array.isArray(row?.causes) ? row.causes : [];
  const causeLabel = String(causes?.[0]?.label || "").trim() || "—";
  const rowStatusKey = String(row?.status?.key || "").trim().toLowerCase();
  const rowStatusLabel = String(row?.status?.label || "").trim() || "—";
  const transactionId = String(row?.transactionId || "").trim();
  const targetDonationId = String(row?.donationId || donationId || "").trim();
  const isSkipped = Boolean(row?.skipped) || String(row?.planState || "").toLowerCase() === "skipped_by_donor";
  const isMissed = Boolean(row?.missed);
  const retryCount = Number(row?.retryCount) || 0;
  const receiptAvailable = rowStatusKey === "succeeded" && !isSkipped;

  // Prefer the API's derived state so Missed/Scheduled/etc. read correctly; fall back to the raw
  // status label for older payloads.
  const rowState = String(row?.state || "").trim().toLowerCase();
  const stateKey = rowState || rowStatusKey;
  const stateLabel = STATE_LABELS[rowState] || rowStatusLabel;

  // Mirrors the API rule so we never offer an edit that would be rejected. The form-level
  // "flexible recurring schedule" setting also locks the whole plan for the donor.
  const dueAt = row?.date ? new Date(row.date).getTime() : NaN;
  const canEdit = canModifySchedule !== false
    && !isSkipped
    && Boolean(transactionId)
    && EDITABLE_SCHEDULE_STATUSES.has(String(scheduleStatusKey || "").toLowerCase())
    && EDITABLE_ROW_STATUSES.has(rowStatusKey)
    && Number.isFinite(dueAt)
    && dueAt > Date.now();
  // Same eligibility as the amount edit, plus "not the last remaining payment" (the API refuses it).
  const canSkip = canEdit && Boolean(skipEligible);
  // Retrying is NOT a schedule change — it just attempts the payment the donor already committed
  // to — so it stays available even when flexible scheduling is off. The API decides eligibility.
  const canRetry = Boolean(row?.canRetry) && Boolean(transactionId);

  // The FIRST payment's stored amount includes the one-time tip + add-ons, so the donor
  // edits the base and the API keeps the extras on top.
  const rowBase = Number.isFinite(Number(row?.baseAmount)) ? Number(row.baseAmount) : amount;
  const extras = Number(row?.extrasAmount) || 0;

  const base = Number(installmentBaseAmount);
  const isCustomAmount = Number.isFinite(base) && base > 0 && Math.abs(rowBase - base) > 0.005;

  const startEditing = () => {
    setDraft(String(rowBase));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setDraft("");
  };

  const saveAmount = async () => {
    const next = Number(draft);
    if (!Number.isFinite(next) || next <= 0) {
      onError?.("Enter an amount greater than 0.");
      return;
    }
    if (Math.abs(next - rowBase) < 0.005) {
      cancelEditing();
      return;
    }

    setSaving(true);
    try {
      await updateUserInstallmentAmount({
        scheduleId: targetDonationId,
        installmentId: transactionId,
        amount: next,
      });
      setEditing(false);
      setDraft("");
      onSaved?.();
    } catch (e) {
      onError?.(e?.message || "Could not update this payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!targetDonationId || !transactionId || !receiptAvailable || busy) return;
    setBusy(true);
    try {
      await downloadReceipt({ donationId: targetDonationId, transactionId });
    } catch (e) {
      onError?.(e?.message || "Could not download receipt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className={isSkipped ? "opacity-60" : "hover:bg-[#F9FAFB] transition-colors"}>
      <td className="py-3.5 px-2 first:pl-0 text-[#111827] font-medium">
        <div className="flex items-center gap-2">
          <span>{date}</span>
          {isSkipped ? (
            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Skipped
            </span>
          ) : null}
          {isMissed && !isSkipped ? (
            <span className="rounded-full bg-[#FFF5F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#EA3335]">
              Missed
            </span>
          ) : null}
        </div>
      </td>
      <td className="py-3.5 px-2">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={draft}
              autoFocus
              disabled={saving}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAmount();
                if (e.key === "Escape") cancelEditing();
              }}
              className="w-24 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#EA3335] disabled:bg-[#F9FAFB]"
            />
            <button
              type="button"
              onClick={saveAmount}
              disabled={saving}
              className="cursor-pointer rounded-lg bg-[#EA3335] px-2.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="cursor-pointer rounded-lg px-2 py-1.5 text-[12px] font-medium text-[#6B7280] transition-colors hover:text-[#111827] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[#111827] font-semibold whitespace-nowrap">{formatCurrency(amount, cur)}</span>
            {extras > 0 ? (
              <span
                className="text-[11px] text-[#6B7280] whitespace-nowrap"
                title="One-time tip and add-ons, charged with the first payment"
              >
                incl. {formatCurrency(extras, cur)}
              </span>
            ) : null}
            {!isSkipped && isCustomAmount ? (
              <span
                className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8]"
                title="This payment's amount was changed"
              >
                Custom
              </span>
            ) : null}
            {canRetry ? (
              <button
                type="button"
                onClick={() => onRequestRetry?.(row)}
                title="Retry this payment"
                aria-label="Retry this payment"
                className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-[#EA3335] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-700"
              >
                Retry Payment
              </button>
            ) : null}
            {canEdit ? (
              <button
                type="button"
                onClick={startEditing}
                title="Change this payment's amount"
                aria-label="Change this payment's amount"
                className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#EA3335]"
              >
                {EditIcon}
              </button>
            ) : null}
            {canSkip ? (
              <button
                type="button"
                onClick={() => onRequestSkip?.(row)}
                title="Skip this payment"
                aria-label="Skip this payment"
                className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#EA3335]"
              >
                Skip
              </button>
            ) : null}
          </div>
        )}
      </td>
      <td className="py-3.5 px-2">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${causeBadgeStyles[causeLabel] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
          {causeLabel}
        </span>
      </td>
      <td className="py-3.5 px-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(stateKey)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(stateKey)}`} />
            {stateLabel}
          </span>
          {retryCount > 0 ? (
            <span
              className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]"
              title={`Retried ${retryCount} time${retryCount === 1 ? "" : "s"}`}
            >
              Retried ×{retryCount}
            </span>
          ) : null}
        </div>
      </td>
      <td className="py-3.5 px-2 last:pr-0">
        {receiptAvailable && transactionId ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy || !targetDonationId}
            title="Download receipt"
            aria-label="Download receipt"
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {busy ? <span className="animate-pulse">{DownloadIcon}</span> : DownloadIcon}
          </button>
        ) : (
          <span
            className="text-[#6B7280]"
            title={receiptAvailable ? undefined : "Receipt is available once the payment is confirmed."}
          >
            —
          </span>
        )}
      </td>
    </tr>
  );
}

export function DonationHistoryCard({
  loading,
  history,
  currency,
  donationId,
  onError,
  onSaved,
  scheduleStatusKey,
  installmentBaseAmount,
  canModifySchedule = true,
}) {
  const [pendingAction, setPendingAction] = useState(null);
  const [working, setWorking] = useState(false);

  // Skipped rows stay visible but no longer count toward the plan, so the confirm dialog quotes the
  // donor's real commitment before and after.
  const activeRows = history.filter((row) => !row?.skipped);
  const totalPlanned = activeRows.reduce((sum, row) => sum + (Number(row?.amount) || 0), 0);
  // The API refuses to skip the last remaining payment, so we never offer an action it would reject.
  const skipEligible = activeRows.length > 1;

  const confirmAction = async () => {
    const row = pendingAction?.row;
    const transactionId = String(row?.transactionId || "").trim();
    const scheduleId = String(row?.donationId || donationId || "").trim();
    if (!transactionId || !scheduleId || working) return;
    const isRetry = pendingAction?.type === "retry";
    setWorking(true);
    try {
      if (isRetry) await retryUserInstallment({ scheduleId, installmentId: transactionId });
      else await skipUserInstallment({ scheduleId, installmentId: transactionId });
      setPendingAction(null);
      onSaved?.();
    } catch (e) {
      onError?.(e?.message || `Could not ${isRetry ? "retry" : "skip"} this payment.`);
    } finally {
      setWorking(false);
    }
  };

  const newTotal = Math.max(0, totalPlanned - (Number(pendingAction?.row?.amount) || 0));
  const isRetryAction = pendingAction?.type === "retry";

  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-base font-semibold text-[#111827]">Donation History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-120">
          <thead>
            <tr className="text-left border-b border-[#E5E7EB]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="pb-3 px-2 first:pl-0 last:pr-0 text-[11px] font-semibold tracking-widest uppercase text-[#6B7280]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading ? (
              <SkeletonRows rows={4} cols={5} cellClass="px-2 py-2.5" />
            ) : history.length ? (
              history.map((row, i) => (
                <HistoryRow
                  key={String(row?.transactionId || i)}
                  row={row}
                  currency={currency}
                  donationId={donationId}
                  onError={onError}
                  onSaved={onSaved}
                  scheduleStatusKey={scheduleStatusKey}
                  installmentBaseAmount={installmentBaseAmount}
                  skipEligible={skipEligible}
                  onRequestSkip={(r) => setPendingAction({ type: "skip", row: r })}
                  onRequestRetry={(r) => setPendingAction({ type: "retry", row: r })}
                  canModifySchedule={canModifySchedule}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-[#6B7280]">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingAction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-action-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 id="history-action-title" className="text-base font-semibold text-[#111827]">
              {isRetryAction ? "Retry this payment?" : "Skip this payment?"}
            </h3>
            {isRetryAction ? (
              <p className="mt-2 text-sm text-[#4B5563]">
                We&apos;ll try to charge{" "}
                <span className="font-semibold text-[#111827]">
                  {formatCurrency(Number(pendingAction.row?.amount) || 0, currency)}
                </span>{" "}
                for the payment on {formatShortDate(pendingAction.row?.date) || "this date"} again, using your
                saved payment method.
              </p>
            ) : (
              <p className="mt-2 text-sm text-[#4B5563]">
                Skip the payment on {formatShortDate(pendingAction.row?.date) || "this date"}? Your schedule total
                drops from{" "}
                <span className="font-semibold text-[#111827]">{formatCurrency(totalPlanned, currency)}</span> to{" "}
                <span className="font-semibold text-[#111827]">{formatCurrency(newTotal, currency)}</span>. This
                can&apos;t be undone.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={working}
                className="cursor-pointer rounded-lg px-3 py-2 text-[13px] font-semibold text-[#6B7280] transition-colors hover:text-[#111827] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={working}
                className="cursor-pointer rounded-lg bg-[#EA3335] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {working
                  ? isRetryAction
                    ? "Retrying…"
                    : "Skipping…"
                  : isRetryAction
                    ? "Retry payment"
                    : "Skip payment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

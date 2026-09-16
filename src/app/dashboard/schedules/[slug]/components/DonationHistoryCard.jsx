"use client";

import { useState } from "react";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { DownloadIcon, EditIcon } from "@/components/common/SvgIcon";
import { formatCurrency } from "@/utils/helpers";
import { downloadReceipt, updateUserInstallmentAmount } from "@/services/donationService";
const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};
function statusClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "succeeded") return "text-[#047857]";
  if (s === "pending" || s === "processing" || s === "requires_action") return "text-[#B45309]";
  if (s === "failed") return "text-[#EA3335]";
  if (s === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}
function statusDotClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "succeeded") return "bg-[#047857]";
  if (s === "pending" || s === "processing" || s === "requires_action") return "bg-[#B45309]";
  if (s === "failed") return "bg-[#EA3335]";
  if (s === "refunded") return "bg-[#6B7280]";
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

function HistoryRow({ row, currency, donationId, onError, onSaved, scheduleStatusKey, installmentBaseAmount }) {
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
  const receiptAvailable = rowStatusKey === "succeeded";

  // Mirrors the API rule so we never offer an edit that would be rejected.
  const dueAt = row?.date ? new Date(row.date).getTime() : NaN;
  const canEdit = Boolean(transactionId)
    && EDITABLE_SCHEDULE_STATUSES.has(String(scheduleStatusKey || "").toLowerCase())
    && EDITABLE_ROW_STATUSES.has(rowStatusKey)
    && Number.isFinite(dueAt)
    && dueAt > Date.now();

  const base = Number(installmentBaseAmount);
  const isCustomAmount = Number.isFinite(base) && base > 0 && Math.abs(amount - base) > 0.005;

  const startEditing = () => {
    setDraft(String(amount));
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
    if (Math.abs(next - amount) < 0.005) {
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
    <tr className="hover:bg-[#F9FAFB] transition-colors">
      <td className="py-3.5 px-2 first:pl-0 text-[#111827] font-medium">{date}</td>
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
            {isCustomAmount ? (
              <span
                className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8]"
                title="This payment's amount was changed"
              >
                Custom
              </span>
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
          </div>
        )}
      </td>
      <td className="py-3.5 px-2">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${causeBadgeStyles[causeLabel] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
          {causeLabel}
        </span>
      </td>
      <td className="py-3.5 px-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(rowStatusKey)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(rowStatusKey)}`} />
          {rowStatusLabel}
        </span>
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
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-base font-semibold text-[#111827]">Donation History</h2>
        <span className="text-[12px] text-[#6B7280]">
          Use the pencil on an upcoming payment to change just that amount.
        </span>
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
    </div>
  );
}

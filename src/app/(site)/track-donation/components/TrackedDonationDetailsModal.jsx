"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/utils/helpers";
import { getTrackedDonation } from "@/services/trackDonationService";

const FREQUENCY_LABEL = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  interval: "Custom interval",
  custom: "Custom interval",
};

const PLAN_STATE_LABEL = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
  completed: "Completed",
};

const INSTALLMENT_STATUS = {
  succeeded: { label: "Paid", className: "text-[#047857]" },
  pending: { label: "Pending", className: "text-[#B45309]" },
  processing: { label: "Processing", className: "text-[#B45309]" },
  requires_action: { label: "Action needed", className: "text-[#B45309]" },
  failed: { label: "Failed", className: "text-[#EA3335]" },
  refunded: { label: "Refunded", className: "text-[#6B7280]" },
};

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function describeSchedule(item) {
  const config = item?.scheduleConfig || {};
  const frequency = FREQUENCY_LABEL[config.frequency] || (config.frequency ? String(config.frequency) : "");
  const interval = Number(config.customInterval) || 0;

  if (item?.scheduleType === "specific_dates") {
    const count = Array.isArray(config.dates) ? config.dates.length : 0;
    return count ? `${count} selected date${count === 1 ? "" : "s"}` : "Selected dates";
  }
  if (item?.scheduleType === "date_range") {
    const start = String(config.startDate || "").slice(0, 10);
    const end = String(config.endDate || "").slice(0, 10);
    const every = frequency === "Custom interval" && interval > 1 ? `${frequency} (every ${interval} days)` : frequency;
    return [every, start && end ? `${start} → ${end}` : ""].filter(Boolean).join(" · ") || "Date range";
  }
  return frequency || "—";
}

const TrackedDonationDetailsModal = ({
  item,
  token,
  onClose,
  canDownloadReceipt = false,
  receiptBusy = false,
  onDownloadReceipt,
  onManageRecurring,
}) => {
  const [installments, setInstallments] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const donationId = item?.donationId ? String(item.donationId) : "";

  useEffect(() => {
    if (!donationId || !token) {
      setInstallments([]);
      setScheduleError("");
      setScheduleLoading(false);
      return undefined;
    }

    let alive = true;
    setScheduleLoading(true);
    setScheduleError("");
    setInstallments([]);

    (async () => {
      try {
        const res = await getTrackedDonation({ token, donationId });
        if (!alive) return;
        const rows = res?.data?.item?.installments;
        setInstallments(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!alive) return;
        setScheduleError(e?.message || "Could not load the payment schedule.");
      } finally {
        if (alive) setScheduleLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [donationId, token]);

  useEffect(() => {
    if (!item) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  const currency = String(item.currency || "USD");
  const fmt = (v) => formatCurrency(Number(v || 0), currency);

  const recurring = String(item.paymentMode || "") === "split" || Boolean(item.scheduleType);
  const summary = item.scheduleSummary || {};
  const upcoming = Array.isArray(summary.upcoming) ? summary.upcoming : [];
  const next = upcoming[0] || null;
  const allocations = Array.isArray(item.causeAllocations) ? item.causeAllocations : [];
  const addons = Array.isArray(item.addons) ? item.addons : [];
  const allocationsTotal = allocations.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
  const tipAmount = Number(item.tipAmount || 0);

  const labelCell = "py-2 pr-4 text-[13px] text-[#6B7280] align-top";
  const valueCell = "py-2 text-[13px] text-[#111827] align-top";
  const sectionClass = "text-[13px] font-semibold text-[#111827]";

  const row = (label, value) => (
    <tr key={label}>
      <td className={labelCell}>{label}</td>
      <td className={valueCell}>{value}</td>
    </tr>
  );

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Donation details"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
          <div className="min-w-0">
            <h2 className="m-0 text-[16px] font-semibold text-[#111827]">Donation details</h2>
            <p className="mt-0.5 truncate text-[12px] text-[#6B7280]" title={item.campaign?.name || ""}>
              {String(item.campaign?.name || "Donation")} · {formatDate(item.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {recurring ? (
            <div className="mb-5">
              <div className={sectionClass}>Recurring schedule</div>
              <table className="mt-2 w-full border-collapse">
                <tbody>
                  {row("Plan", describeSchedule(item))}
                  {item.scheduleState ? row("Status", PLAN_STATE_LABEL[item.scheduleState] || item.scheduleState) : null}
                  {row(
                    "Payments",
                    `${Number(summary.paidCount || 0)} of ${Number(summary.total || 0)} paid` +
                      (Number(summary.remainingCount || 0) > 0 ? ` · ${summary.remainingCount} remaining` : ""),
                  )}
                  {next
                    ? row("Next payment", `${formatDate(next.dueDate)} — ${fmt(next.amount)}`)
                    : row("Next payment", "None scheduled")}
                </tbody>
              </table>
            </div>
          ) : null}

          {recurring ? (
            <div className="mb-5">
              <div className={sectionClass}>Payment schedule</div>
              {scheduleLoading ? (
                <p className="mt-2 text-[12px] text-[#6B7280]">Loading dates…</p>
              ) : scheduleError ? (
                <p className="mt-2 text-[12px] text-[#CC1F1F]">{scheduleError}</p>
              ) : installments.length ? (
                <div className="mt-2 max-h-[240px] overflow-y-auto rounded-xl border border-[#E5E7EB]">
                  <table className="w-full border-collapse">
                    <tbody>
                      {installments.map((inst, i) => {
                        const status = INSTALLMENT_STATUS[inst?.status] || {
                          label: inst?.status || "—",
                          className: "text-[#6B7280]",
                        };
                        return (
                          <tr key={`${inst?.dueDate || "inst"}-${i}`} className="border-b border-[#F3F4F6] last:border-b-0">
                            <td className="px-3 py-2 text-[12px] text-[#9CA3AF] tabular-nums">
                              {Number(inst?.installmentIndex) || i + 1}
                            </td>
                            <td className="py-2 pr-3 text-[13px] whitespace-nowrap text-[#111827]">
                              {formatDate(inst?.dueDate)}
                            </td>
                            <td className="py-2 pr-3 text-[13px] whitespace-nowrap tabular-nums text-[#111827]">
                              {fmt(inst?.amount)}
                            </td>
                            <td className={`px-3 py-2 text-right text-[12px] font-medium whitespace-nowrap ${status.className}`}>
                              {status.label}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-[12px] text-[#6B7280]">No payment dates scheduled.</p>
              )}
            </div>
          ) : null}

          <div className="mb-5">
            <div className={sectionClass}>Fund split</div>
            <table className="mt-2 w-full border-collapse">
              <tbody>
                {allocations.length ? (
                  allocations.map((a, i) => (
                    <tr key={`${a?.causeId || "alloc"}-${i}`}>
                      <td className="py-2 pr-4 text-[13px] text-[#111827]">
                        {a?.fundCode || a?.label || "—"}
                        {a?.fundCode && a?.label ? (
                          <span className="ml-2 text-[12px] text-[#6B7280]">{a.label}</span>
                        ) : null}
                      </td>
                      <td className="py-2 text-right text-[13px] tabular-nums text-[#111827]">
                        {fmt(a?.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 pr-4 text-[13px] text-[#111827]">{String(item.causeTag?.label || "—")}</td>
                    <td className="py-2 text-right text-[13px] tabular-nums text-[#111827]">{fmt(allocationsTotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {addons.length || tipAmount > 0 ? (
            <div className="mb-5">
              <div className={sectionClass}>Add-ons &amp; tip</div>
              {recurring ? (
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  Charged in full with the first payment, not on every instalment.
                </p>
              ) : null}
              <table className="mt-2 w-full border-collapse">
                <tbody>
                  {addons.map((a, i) => (
                    <tr key={`${a?.addOnId || "addon"}-${i}`}>
                      <td className="py-2 pr-4 text-[13px] text-[#111827]">{String(a?.name || "Add-on")}</td>
                      <td className="py-2 text-right text-[13px] tabular-nums text-[#111827]">{fmt(a?.amount)}</td>
                    </tr>
                  ))}
                  {tipAmount > 0 ? (
                    <tr>
                      <td className="py-2 pr-4 text-[13px] text-[#111827]">
                        Platform tip
                        {item.platformTipPercent != null ? (
                          <span className="ml-2 text-[12px] text-[#6B7280]">({item.platformTipPercent}%)</span>
                        ) : null}
                      </td>
                      <td className="py-2 text-right text-[13px] tabular-nums text-[#111827]">{fmt(tipAmount)}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="rounded-xl bg-[#F9FAFB] px-4 py-3">
            <table className="w-full border-collapse">
              <tbody>
                {row(recurring ? "Total commitment" : "Donation amount", fmt(item.amount))}
                {addons.length ? row("Add-ons", fmt(addonsTotal)) : null}
                {tipAmount > 0 ? row("Platform tip", fmt(tipAmount)) : null}
                {recurring ? row("Charged so far", fmt(summary.paidTotal)) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5E7EB] px-6 py-4">
          {canDownloadReceipt ? (
            <button
              type="button"
              onClick={onDownloadReceipt}
              disabled={receiptBusy}
              className="cursor-pointer rounded-full border border-[#DDDDDD] px-4 py-2 text-[12px] font-semibold text-[#111111] transition-colors hover:border-[#CC1F1F] hover:text-[#CC1F1F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {receiptBusy ? "Preparing…" : "Download receipt"}
            </button>
          ) : null}
          {recurring ? (
            <button
              type="button"
              onClick={onManageRecurring}
              className="cursor-pointer rounded-full bg-[#CC1F1F] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#A81A1A]"
            >
              Manage recurring
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold text-[#777777] transition-colors hover:text-[#111111]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default TrackedDonationDetailsModal;

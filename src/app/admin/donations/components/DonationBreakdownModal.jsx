"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

// Per-transaction payment breakdown shown in a modal: fund codes, add-ons and platform tip.
// Amount logic mirrors the backend receipt (receiptService.computeReceiptAmounts).
const DonationBreakdownModal = ({ donation, onClose, formatAmount }) => {
  useEffect(() => {
    if (!donation) return undefined;

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
  }, [donation, onClose]);

  if (!donation || typeof document === "undefined") return null;

  const fmt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

  const amount = Number(donation?.amount || 0);
  const tipAmount = Number(donation?.tipAmount || 0);
  const tipPercent = donation?.platformTipPercent != null ? Number(donation.platformTipPercent) : null;
  const installmentIndex = donation?.installmentIndex != null ? Number(donation.installmentIndex) : null;
  const installmentCount = donation?.installmentCount != null ? Number(donation.installmentCount) : null;

  // Add-ons are charged with the first payment only, but the API attaches the donation's
  // add-ons to every installment row (same rule the receipt applies).
  const isFirstPayment = !installmentIndex || installmentIndex === 1;
  const addons = isFirstPayment && Array.isArray(donation?.addons) ? donation.addons : [];
  // Add-on allocations carry `isAddOn`/`addOnId`. They are charged on top of the gift and are listed
  // in their own section below, so they must not count as gift allocations — the same rule the API
  // receipt applies (receiptService.computeReceiptAmounts). Counting them inflated the base amount
  // ($75 instead of $50) and repeated the row in the fund-codes table.
  const allocations = (Array.isArray(donation?.causeAllocations) ? donation.causeAllocations : [])
    .filter((a) => !(a && (a.isAddOn === true || a.addOnId)));

  const allocationsTotal = allocations.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
  const baseAmount = allocations.length
    ? allocationsTotal
    : Math.max(0, Number((amount - addonsTotal - tipAmount).toFixed(2)));

  const thClass = "pb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]";
  const thRightClass = `${thClass} text-right`;
  const tdClass = "border-t border-[#F3F4F6] py-2.5 pr-4 text-[13px] text-[#111827]";
  const tdRightClass = "border-t border-[#F3F4F6] py-2.5 text-right text-[13px] tabular-nums text-[#111827]";
  const sectionTitleClass = "text-[13px] font-semibold text-[#111827]";

  const summaryRow = (label, value, opts = {}) => (
    <div className={`flex items-center justify-between gap-6 py-1.5 ${opts.strong ? "text-[15px] font-bold" : "text-[13px]"}`}>
      <span className={opts.strong ? "text-[#111827]" : "text-[#6B7280]"}>{label}</span>
      <span className="tabular-nums text-[#111827]">{fmt(value)}</span>
    </div>
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
        aria-label="Payment breakdown"
        onClick={(e) => e.stopPropagation()}
        className="hc-animate-fade-up flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-[#111827]">Payment breakdown</h2>
            <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
              {String(donation?.donor?.name || "—")}
              {donation?.providerTransactionId ? ` · ${String(donation.providerTransactionId)}` : ""}
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-[#6B7280]">
            <span>Campaign: <span className="text-[#111827]">{String(donation?.campaignName || "—")}</span></span>
            {installmentIndex ? (
              <span>
                Payment:{" "}
                <span className="text-[#111827]">
                  {installmentIndex}{installmentCount ? ` of ${installmentCount}` : ""}
                </span>
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            <div className={sectionTitleClass}>Fund codes</div>
            <table className="mt-2 w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[28%]`}>Fund code</th>
                  <th className={thClass}>Cause</th>
                  <th className={`${thRightClass} w-[24%]`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length ? (
                  allocations.map((a, i) => (
                    <tr key={`${a?.causeId || "alloc"}-${i}`}>
                      <td className={`${tdClass} font-semibold`}>{a?.fundCode || "—"}</td>
                      <td className={`${tdClass} truncate`} title={a?.label || ""}>{a?.label || "—"}</td>
                      <td className={tdRightClass}>{fmt(Number(a?.amount || 0))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={`${tdClass} font-semibold`}>—</td>
                    <td className={`${tdClass} truncate`}>{String(donation?.causeLabel || "—")}</td>
                    <td className={tdRightClass}>{fmt(baseAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <div className={sectionTitleClass}>Add-ons</div>
            {addons.length ? (
              <table className="mt-2 w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className={thClass}>Add-on</th>
                    <th className={`${thRightClass} w-[24%]`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map((a, i) => (
                    <tr key={`${a?.addOnId || "addon"}-${i}`}>
                      <td className={`${tdClass} truncate`} title={String(a?.name || "")}>
                        {String(a?.name || "Add-on")}
                      </td>
                      <td className={tdRightClass}>{fmt(Number(a?.amount || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-2 text-[13px] text-[#9CA3AF]">
                {isFirstPayment ? "No add-ons on this payment." : "Add-ons were charged with the first payment."}
              </p>
            )}
          </div>

          <div className="mt-5">
            <div className={sectionTitleClass}>Platform fee / Tip</div>
            <div className="mt-2 flex items-center justify-between gap-6 rounded-xl border border-[#E5E7EB] px-4 py-3">
              <span className="text-[13px] text-[#111827]">
                Platform support{tipPercent != null ? ` (${tipPercent}%)` : ""}
              </span>
              <span className="text-[13px] tabular-nums text-[#111827]">{fmt(tipAmount)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#F9FAFB] px-4 py-3">
            {summaryRow("Base amount", baseAmount)}
            {addons.length ? summaryRow("Add-ons", addonsTotal) : null}
            {tipAmount > 0 ? summaryRow("Platform tip", tipAmount) : null}
            <div className="my-1 border-t border-[#E5E7EB]" />
            {summaryRow("Total charged", amount, { strong: true })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default DonationBreakdownModal;

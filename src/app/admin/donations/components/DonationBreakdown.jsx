"use client";

// Per-transaction payment breakdown: fund codes, add-ons and platform tip.
// Amount logic mirrors the backend receipt (receiptService.computeReceiptAmounts).
const DonationBreakdown = ({ donation, formatAmount }) => {
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
  const allocations = Array.isArray(donation?.causeAllocations) ? donation.causeAllocations : [];

  const allocationsTotal = allocations.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
  const baseAmount = allocations.length
    ? allocationsTotal
    : Math.max(0, Number((amount - addonsTotal - tipAmount).toFixed(2)));

  const sectionClass = "text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]";
  const rowClass = "flex items-center justify-between gap-4 py-1.5";
  const valueClass = "tabular-nums text-[#111827]";

  return (
    <div className="grid gap-5 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 md:grid-cols-3">
      <div>
        <div className={sectionClass}>Fund codes</div>
        <div className="mt-2">
          <div className="flex items-center justify-between gap-4 pb-1 text-[11px] text-[#9CA3AF]">
            <span>Fund code</span>
            <span>Amount</span>
          </div>
          {allocations.length ? (
            allocations.map((a, i) => (
              <div key={`${a?.causeId || "alloc"}-${i}`} className={rowClass}>
                <span className="truncate text-[#111827]" title={a?.label || a?.fundCode || ""}>
                  {a?.fundCode || a?.label || "—"}
                </span>
                <span className={valueClass}>{fmt(Number(a?.amount || 0))}</span>
              </div>
            ))
          ) : (
            <div className={rowClass}>
              <span className="truncate text-[#111827]">{String(donation?.causeLabel || "—")}</span>
              <span className={valueClass}>{fmt(baseAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-1.5 text-[12px] font-semibold">
            <span>Base amount</span>
            <span className="tabular-nums">{fmt(baseAmount)}</span>
          </div>
        </div>
      </div>

      <div>
        <div className={sectionClass}>Add-ons</div>
        <div className="mt-2">
          {addons.length ? (
            <>
              {addons.map((a, i) => (
                <div key={`${a?.addOnId || "addon"}-${i}`} className={rowClass}>
                  <span className="truncate text-[#111827]">{String(a?.name || "Add-on")}</span>
                  <span className={valueClass}>{fmt(Number(a?.amount || 0))}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-1.5 text-[12px] font-semibold">
                <span>Add-ons total</span>
                <span className="tabular-nums">{fmt(addonsTotal)}</span>
              </div>
            </>
          ) : (
            <div className="py-1.5 text-[13px] text-[#9CA3AF]">
              {isFirstPayment ? "None" : "Charged with the first payment"}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className={sectionClass}>Platform fee / Tip</div>
        <div className="mt-2">
          <div className={rowClass}>
            <span className="text-[#111827]">
              Platform support{tipPercent != null ? ` (${tipPercent}%)` : ""}
            </span>
            <span className={valueClass}>{fmt(tipAmount)}</span>
          </div>
          {installmentIndex ? (
            <div className="py-1.5 text-[12px] text-[#6B7280]">
              Payment {installmentIndex}{installmentCount ? ` of ${installmentCount}` : ""}
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-1.5 text-[12px] font-semibold">
            <span>Total charged</span>
            <span className="tabular-nums">{fmt(amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationBreakdown;

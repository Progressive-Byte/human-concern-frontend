"use client";

import { useDonation } from "@/context/DonationContext";
import { getCurrencySymbol } from "@/utils/money";

const Row = ({ label, value, strong = false, mono = false }) => (
  <div className="flex items-start justify-between gap-3 py-1">
    <span className={`text-[12px] shrink-0 ${strong ? "font-semibold text-[#383838]" : "text-[#737373]"}`}>{label}</span>
    <span className={`text-right min-w-0 ${strong ? "text-[16px] font-bold text-[#EA3335]" : "text-[12px] font-medium text-[#383838]"} ${mono ? "tabular-nums" : ""}`}>
      {value}
    </span>
  </div>
);

const DonationSummary = ({ tipAmount = 0, onEditGift, onEditDetails }) => {
  const { data } = useDonation();
  const sym = getCurrencySymbol(data.currency ?? "USD");
  const isRecurring = data.paymentType === "recurring";

  const amountTier = Number(data.amountTier ?? 0);
  const baseTotal = isRecurring
    ? Number(data.perDateTotal ?? amountTier * (data.installmentCount ?? 1))
    : amountTier;
  const addOnsTotal = Number(data.addOnsTotal ?? 0);
  const total = baseTotal + addOnsTotal + Number(tipAmount || 0);

  const frequency = isRecurring
    ? (data.frequency ? `${String(data.frequency).charAt(0).toUpperCase()}${String(data.frequency).slice(1)}` : "Monthly")
    : "One-time";

  const causes = Array.isArray(data.causes) ? data.causes : [];
  const addOns = Array.isArray(data.addOnBreakdown) ? data.addOnBreakdown : [];

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[13px] font-semibold text-[#383838]">Donation Summary</p>
        <div className="flex items-center gap-3">
          {onEditGift && (
            <button type="button" onClick={onEditGift} className="text-[11px] font-semibold text-[#EA3335] hover:underline cursor-pointer">
              Edit gift
            </button>
          )}
          {onEditDetails && (
            <button type="button" onClick={onEditDetails} className="text-[11px] font-semibold text-[#EA3335] hover:underline cursor-pointer">
              Edit details
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col divide-y divide-[#F0F0F0]">
        <div>
          <Row label={isRecurring ? "Gift per payment" : "Gift"} value={`${sym}${amountTier.toFixed(2)}`} mono />
          <Row label="Frequency" value={frequency} mono />
          {causes.length > 0 && <Row label="Fund" value={causes.join(", ")} />}
        </div>

        {addOns.length > 0 && (
          <div className="pt-2">
            {addOns.map((addon) => (
              <Row key={addon.id ?? addon.name} label={addon.name} value={`${sym}${Number(addon.total ?? 0).toFixed(2)}`} mono />
            ))}
            <Row label="Add-ons total" value={`${sym}${addOnsTotal.toFixed(2)}`} mono />
          </div>
        )}

        {tipAmount > 0 && (
          <div className="pt-2">
            <Row label="Tip" value={`${sym}${Number(tipAmount).toFixed(2)}`} mono />
          </div>
        )}

        <div className="pt-2">
          <Row label={isRecurring ? "Total commitment" : "Total"} value={`${sym}${total.toFixed(2)}`} strong mono />
        </div>
      </div>
    </div>
  );
};

export default DonationSummary;

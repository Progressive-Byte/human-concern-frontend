"use client";

import Section from "@/components/ui/Section";
import { useDonation } from "@/context/DonationContext";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const DonationPreview = ({ currentStep }) => {
  const { data } = useDonation();
  const sym = CURRENCY_SYMBOLS[data.currency] ?? "$";

  const showPayment = Boolean(data.amountTier);
  const showAddons  = data.addOnBreakdown?.length > 0 || data.tipPct > 0 || data.grandTotal > 0;

  const baseTotal = (data.amountTier ?? 0) * (data.installmentCount ?? 1);
  const tipAmount = data.tipPct ? (baseTotal * data.tipPct) / 100 : 0;

  return (
    <div className="lg:sticky lg:top-[172px] self-start w-full lg:w-[272px] shrink-0">
      <div className="bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-5">
        <p className="text-[13px] font-semibold text-[#383838] mb-3">Donation Summary</p>

        <div className="flex flex-col">

          {(data.firstName || data.email) && (
            <Section label="Donor">
              <p className="text-[14px] font-semibold text-[#383838] leading-snug">
                {[data.firstName, data.lastName].filter(Boolean).join(" ")}
              </p>
              {data.email && (
                <p className="text-[12px] text-[#8C8C8C] break-all">{data.email}</p>
              )}
              {data.city && (
                <p className="text-[12px] text-[#8C8C8C]">
                  {[data.city, data.country].filter(Boolean).join(", ")}
                </p>
              )}
            </Section>
          )}

          {data.causes?.length > 0 && (
            <Section label="Causes">
              <div className="flex flex-wrap gap-1.5">
                {data.causes.map((cause) => (
                  <span
                    key={cause}
                    className="text-[11px] font-medium text-[#383838] bg-[#F3F4F6] rounded-full px-2.5 py-1 leading-none"
                  >
                    {cause}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {data.objectiveLabel && (
            <Section label="Objective">
              <p className="text-[12px] text-[#383838]">{data.objectiveLabel}</p>
            </Section>
          )}

          {showPayment && (
            <Section label="Payment">
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-[#383838] leading-none">
                  {sym}{data.amountTier?.toLocaleString()}
                </span>
                <span className="text-[12px] text-[#8C8C8C]">{data.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  data.paymentType === "recurring"
                    ? "bg-[#FFF5F5] text-[#EA3335]"
                    : "bg-[#F3F4F6] text-[#737373]"
                }`}>
                  {data.paymentType === "recurring" ? "Split Payments" : "One-time"}
                </span>
                {data.paymentType === "recurring" && data.installmentCount > 1 && (
                  <span className="text-[12px] text-[#8C8C8C]">
                    × {data.installmentCount} payments
                  </span>
                )}
              </div>
            </Section>
          )}

          {showAddons && data.addOnBreakdown?.length > 0 && (
            <Section label="Add-ons">
              {data.addOnBreakdown.map((addon) => (
                <div key={addon.id ?? addon.name} className="flex items-center justify-between gap-2">
                  <p className="text-[12px] text-[#383838] truncate">{addon.name}</p>
                  <p className="text-[12px] font-medium text-[#383838] shrink-0">
                    {sym}{Number(addon.total ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </Section>
          )}

          {showAddons && data.tipPct > 0 && (
            <Section label="Tip">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[#8C8C8C]">{data.tipPct}% of donation</p>
                <p className="text-[12px] font-medium text-[#383838]">
                  {sym}{tipAmount.toFixed(2)}
                </p>
              </div>
            </Section>
          )}

          {showAddons && data.grandTotal > 0 && (
            <div className="flex items-center justify-between pt-3.5">
              <p className="text-[13px] font-semibold text-[#383838]">Total</p>
              <p className="text-[20px] font-bold text-[#EA3335] leading-none">
                {sym}{data.grandTotal?.toLocaleString()}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default DonationPreview;
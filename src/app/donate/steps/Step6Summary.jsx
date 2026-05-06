"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useMemo } from "react";
import { AddonAmountIcon, CustomTipsIcon } from "@/components/common/SvgIcon";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const FMT = { month: "short", day: "numeric", year: "numeric" };

function buildScheduleRows(scheduleType, scheduleConfig, amountTier) {
  if (scheduleType === "specific_dates") {
    const dates = scheduleConfig?.dates ?? [];
    return [...dates].sort().map((iso, i) => ({
      payment: i + 1,
      date:    new Date(iso).toLocaleDateString("en-US", FMT),
      amount:  amountTier,
    }));
  }

  // date_range
  const { startDate, endDate, frequency } = scheduleConfig ?? {};
  if (!startDate || !endDate) return [];

  const rows    = [];
  const end     = new Date(endDate);
  let   current = new Date(startDate);

  while (current <= end && rows.length < 500) {
    rows.push({
      payment: rows.length + 1,
      date:    new Date(current).toLocaleDateString("en-US", FMT),
      amount:  amountTier,
    });
    if (frequency === "weekly")       current.setDate(current.getDate() + 7);
    else if (frequency === "monthly") current.setMonth(current.getMonth() + 1);
    else                              current.setDate(current.getDate() + 1); // daily default
  }

  return rows;
}

function scheduleLabel(scheduleType, scheduleConfig) {
  if (scheduleType === "specific_dates") return "Selected Dates Payment Schedule";
  const freq = scheduleConfig?.frequency ?? "daily";
  return `${freq.charAt(0).toUpperCase() + freq.slice(1)} Payment Schedule`;
}

const Step6Summary = () => {
  const { data } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const currency        = data.currency        ?? "USD";
  const amountTier      = data.amountTier      ?? 0;
  const paymentType     = data.paymentType     ?? "one-time";
  const scheduleType    = data.scheduleType    ?? "date_range";
  const scheduleConfig  = data.scheduleConfig  ?? {};
  const installmentCount = data.installmentCount ?? data.numberOfDays ?? 1;
  const tipPct          = data.tipPct          ?? 0;
  const addOnBreakdown  = data.addOnBreakdown  ?? [];

  const isRecurring  = paymentType === "recurring";
  const sym          = CURRENCY_SYMBOLS[currency] ?? "$";
  const baseDonation = isRecurring ? amountTier * installmentCount : amountTier;
  const tipAmount    = Math.round((baseDonation * tipPct) / 100 * 100) / 100;

  const schedule = useMemo(
    () => isRecurring ? buildScheduleRows(scheduleType, scheduleConfig, amountTier) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRecurring, scheduleType, JSON.stringify(scheduleConfig), amountTier]
  );

  return (
    <StepLayout
      step={6}
      title="Your Donation Payment Breakdown Summary"
      subtitle="Update any amount as per your preference."
      onNext={() => handleNext(7)}
      onPrev={() => handlePrev(5)}
      prevLabel="Back"
      nextLabel="Payment Details"
    >
      <div className="flex flex-col gap-4">

        {isRecurring ? (
          <div>
            <p className="text-[13px] font-medium text-[#383838] mb-2">
              {scheduleLabel(scheduleType, scheduleConfig)}
              <span className="ml-2 text-[#737373] font-normal">
                ({schedule.length} payment{schedule.length !== 1 ? "s" : ""})
              </span>
            </p>
            <div className="border border-[#E6E6E6] rounded-3xl overflow-hidden">
              <div className="grid grid-cols-3 bg-[#F5F5F580] px-4 py-2.5 border-b border-[#E6E6E6] uppercase">
                <span className="text-[12px] font-semibold text-[#737373]">#</span>
                <span className="text-[12px] font-semibold text-[#737373]">Date</span>
                <span className="text-[12px] font-semibold text-[#737373] text-right">Amount</span>
              </div>

              {schedule.length > 0 ? (
                <div className="max-h-[260px] overflow-y-auto divide-y divide-[#F0F0F0]">
                  {schedule.map((row) => (
                    <div key={row.payment} className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-[13px] text-[#383838]">#{row.payment}</span>
                      <span className="text-[13px] text-[#737373]">{row.date}</span>
                      <span className="text-[13px] font-medium text-[#383838] text-right">
                        {sym}{row.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-[13px] text-[#AEAEAE]">
                  No dates selected — go back to Payment to configure your schedule.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-[13px] text-[#737373]">Total split donation</span>
              <span className="text-[16px] font-bold text-[#383838]">
                {sym}{baseDonation.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border border-[#E5E5E5] rounded-xl px-4 py-3.5 bg-white">
            <span className="text-[13px] text-[#737373]">Donation Amount</span>
            <span className="text-[20px] font-bold text-[#383838]">{sym}{baseDonation.toLocaleString()}</span>
          </div>
        )}

        {/* Add-ons */}
        {addOnBreakdown.length > 0 && (
          <div className="space-y-2">
            {addOnBreakdown.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center gap-2 rounded-2xl bg-[#F5F5F5] px-4 py-3"
              >
                <span className="shrink-0 text-[#8C8C8C]">{AddonAmountIcon}</span>
                <span className="text-[13px] text-[#737373]">{addon.name} =</span>
                <span className="text-[14px] font-semibold text-[#383838]">
                  {sym}{Number(addon.total).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {tipAmount > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#F5F5F5] px-4 py-3">
            <span className="shrink-0 text-[#8C8C8C]">{CustomTipsIcon}</span>
            <span className="text-[13px] text-[#737373]">Custom Platform tip =</span>
            <span className="text-[14px] font-semibold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
          </div>
        )}

      </div>
    </StepLayout>
  );
};

export default Step6Summary;

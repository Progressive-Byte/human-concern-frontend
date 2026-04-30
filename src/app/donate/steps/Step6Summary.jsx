"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useMemo } from "react";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const FREQUENCY_INTERVALS = { Daily: 1, Weekly: 7, Monthly: 30 };

function generateSchedule(frequency, numberOfDays, amountPerDay) {
  const interval = FREQUENCY_INTERVALS[frequency] ?? 1;
  const count    = Math.ceil(numberOfDays / interval);
  const start    = new Date();

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i * interval);
    const days   = Math.min(interval, numberOfDays - i * interval);
    return {
      payment: i + 1,
      date:    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount:  amountPerDay * days,
    };
  });
}

const Step6Summary = () => {
  const { data } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const currency       = data.currency       ?? "USD";
  const amountTier     = data.amountTier     ?? 0;
  const paymentType    = data.paymentType    ?? "one-time";
  const frequency      = data.frequency      ?? "Daily";
  const numberOfDays   = data.numberOfDays   ?? 30;
  const tipPct         = data.tipPct         ?? 0;
  const grandTotal     = data.grandTotal     ?? 0;
  const addOnBreakdown = data.addOnBreakdown ?? [];

  const isRecurring  = paymentType === "recurring";
  const sym          = CURRENCY_SYMBOLS[currency] ?? "$";
  const baseDonation = isRecurring ? amountTier * numberOfDays : amountTier;
  const tipAmount    = Math.round((baseDonation * tipPct) / 100 * 100) / 100;

  const schedule = useMemo(
    () => isRecurring ? generateSchedule(frequency, numberOfDays, amountTier) : [],
    [isRecurring, frequency, numberOfDays, amountTier]
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
          /* Recurring: */
          <div>
            <p className="text-[13px] font-medium text-[#383838] mb-2">{frequency} Payment Schedule</p>
            <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-[#F9F9F9] px-4 py-2.5 border-b border-[#E5E5E5]">
                <span className="text-[12px] font-semibold text-[#737373]">Payment</span>
                <span className="text-[12px] font-semibold text-[#737373]">Date</span>
                <span className="text-[12px] font-semibold text-[#737373] text-right">Amount</span>
              </div>
              {/* Rows */}
              <div className="max-h-[260px] overflow-y-auto divide-y divide-[#F0F0F0]">
                {schedule.map((row) => (
                  <div key={row.payment} className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-[13px] text-[#383838]">{row.payment}</span>
                    <span className="text-[13px] text-[#737373]">{row.date}</span>
                    <span className="text-[13px] font-medium text-[#383838] text-right">{sym}{row.amount}</span>
                  </div>
                ))}
              </div>
              {/* Footer total */}
              <div className="grid grid-cols-3 bg-[#F9F9F9] px-4 py-2.5 border-t border-[#E5E5E5]">
                <span className="text-[12px] font-semibold text-[#383838] col-span-2">Donation Total</span>
                <span className="text-[13px] font-bold text-[#383838] text-right">{sym}{baseDonation}</span>
              </div>
            </div>
          </div>
        ) : (
          /* One-time: */
          <div className="flex items-center justify-between border border-[#E5E5E5] rounded-xl px-4 py-3.5 bg-white">
            <span className="text-[13px] text-[#737373]">Donation Amount</span>
            <span className="text-[20px] font-bold text-[#383838]">{sym}{baseDonation.toLocaleString()}</span>
          </div>
        )}

        {/* Individual add-on amounts */}
        {addOnBreakdown.length > 0 && (
          <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
            <div className="bg-[#F9F9F9] px-4 py-2.5 border-b border-[#E5E5E5]">
              <span className="text-[12px] font-semibold text-[#737373]">Add-ons</span>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {addOnBreakdown.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] text-[#383838]">
                    {addon.iconEmoji && <span className="mr-1.5">{addon.iconEmoji}</span>}
                    {addon.name}
                  </span>
                  <span className="text-[13px] font-semibold text-[#383838]">{sym}{addon.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform tip */}
        {tipAmount > 0 && (
          <div className="flex items-center justify-between border border-[#E5E5E5] rounded-xl px-4 py-3.5 bg-white">
            <span className="text-[13px] text-[#737373]">Platform Tip ({tipPct}%)</span>
            <span className="text-[13px] font-semibold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Grand total */}
        {/* <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-4">
          <span className="text-[14px] font-semibold text-[#065F46]">Total</span>
          <span className="text-[24px] font-bold text-[#065F46]">{sym}{grandTotal.toFixed(2)}</span>
        </div> */}

      </div>
    </StepLayout>
  );
}
export default Step6Summary;
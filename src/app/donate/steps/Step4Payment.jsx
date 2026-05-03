"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useState, useMemo } from "react";
import Select from "@/components/ui/Select";

const PAYMENT_TYPES = [
  { value: "one-time",  label: "One-time Payment", desc: (amt, sym) => `Pay the full amount of ${sym}${amt} today` },
  { value: "recurring", label: "Split Payments",    desc: () => "Split your donation into scheduled payments" },
];

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly"];
const DAYS_OPTIONS      = [7, 14, 21, 30, 60, 90];

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

const Step4Payment = () => {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const suggestedAmounts = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return meta.suggestedAmounts?.length ? meta.suggestedAmounts : [25, 50, 100];
    } catch { return [25, 50, 100]; }
  }, []);

  const paymentType  = data.paymentType  ?? "one-time";
  const frequency    = data.frequency    ?? "Daily";
  const numberOfDays = data.numberOfDays ?? 30;
  const currency     = data.currency     ?? "USD";

  // Restore previous selection: if amountTier isn't a suggested amount, assume it's a custom amount
  const initAmount   = data.amountTier ?? Number(data.amount) ?? suggestedAmounts[0] ?? 25;
  const isCustomInit = initAmount && !suggestedAmounts.includes(initAmount);

  const [selectedTier, setSelectedTier] = useState(isCustomInit ? null : (initAmount || suggestedAmounts[0]));
  const [customAmount, setCustomAmount] = useState(isCustomInit ? String(initAmount) : "");

  const effectiveAmount = customAmount ? Number(customAmount) : (selectedTier ?? 0);
  const isRecurring     = paymentType === "recurring";
  const currencyData    = CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const sym             = currencyData.symbol;
  const totalAmount     = isRecurring ? effectiveAmount * numberOfDays : effectiveAmount;

  return (
    <StepLayout
      step={4}
      title="Payment"
      subtitle="Choose between a one-time or split donation, select an amount or enter a custom value"
      onNext={() => {
        update({ paymentType, frequency, numberOfDays, currency, amountTier: effectiveAmount });
        handleNext(5);
      }}
      onPrev={() => handlePrev(data.isRamadan ? 3 : 2)}
      prevLabel="Back"
      nextLabel="Add-ons"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          {PAYMENT_TYPES.map((type) => {
            const active = paymentType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => update({ paymentType: type.value })}
                className={`w-full flex items-center gap-3.5 rounded-2xl px-5 py-4 border text-left transition-all duration-200 ${
                  active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  active ? "border-[#EA3335]" : "border-[#CCCCCC]"
                }`}>
                  {active && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#383838] leading-snug">{type.label}</p>
                  <p className="text-[12px] text-[#737373] mt-0.5">{type.desc(effectiveAmount, sym)}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Recurring options ── */}
        {isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#383838] mb-2">Schedule Frequency</label>
              <Select value={frequency} onChange={(val) => update({ frequency: val })} options={FREQUENCY_OPTIONS} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#383838] mb-2">Number of Days</label>
              <Select
                value={String(numberOfDays)}
                onChange={(val) => update({ numberOfDays: Number(val) })}
                options={DAYS_OPTIONS.map((d) => ({ label: String(d), value: String(d) }))}
              />
            </div>
          </div>
        )}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Currency</label>
          <Select value={currency} onChange={(val) => update({ currency: val })} options={CURRENCY_OPTIONS} />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-3">
            {isRecurring ? `${frequency} Donation Amount` : "Donation Amount"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {suggestedAmounts.map((amt) => {
              const active = selectedTier === amt && !customAmount;
              return (
                <button
                  key={amt}
                  onClick={() => { setSelectedTier(amt); setCustomAmount(""); }}
                  className={`flex flex-col items-center justify-center rounded-2xl px-4 py-4 border transition-all duration-200 ${
                    active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                  }`}
                >
                  <span className={`text-[22px] font-bold leading-none ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                    {sym}{amt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Custom Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] font-medium text-[15px]">{sym}</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedTier(null); }}
              placeholder="Enter amount"
              min={1}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-[15px] outline-none transition-colors focus:border-[#EA3335] ${
                customAmount
                  ? "border-[#EA3335] bg-[#FFF5F5] text-[#383838]"
                  : "border-[#E5E5E5] bg-white text-[#383838]"
              }`}
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Total Amount</label>
          <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-[16px] text-[#737373] font-medium">{sym}</span>
            <span className="text-[28px] font-bold text-[#383838] leading-none">
              {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </StepLayout>
  );
}
export default Step4Payment;
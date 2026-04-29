"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";


const PAYMENT_TYPES = [
  {
    value: "one-time",
    label: "One-time Payment",
    desc: "Pay the full amount today",
  },
  {
    value: "recurring",
    label: "Recurring Payment",
    desc: "Split your donation into scheduled payments",
  },
];

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly"];

const DAYS_OPTIONS = [7, 14, 21, 30, 60, 90];

const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD" },
  { label: "GBP (£)", value: "GBP" },
  { label: "EUR (€)", value: "EUR" },
  { label: "CAD (CA$)", value: "CAD" },
];

const AMOUNT_TIERS = [
  { amount: 25,  desc: "Feed a fasting person for 1 meal." },
  { amount: 50,  desc: "Feed two fasting persons for 1 meal." },
  { amount: 100, desc: "Feed 4 fasting persons for 1 meal." },
];

function Select({ value, onChange, options, labelKey = "label", valueKey = "value" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#383838] outline-none focus:border-[#EA3335] transition-colors cursor-pointer pr-9"
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt[valueKey];
          const lab = typeof opt === "string" ? opt : opt[labelKey];
          return (
            <option key={val} value={val}>
              {lab}
            </option>
          );
        })}
      </select>
      {/* Chevron */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}

export default function Step5Payment() {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  // Defaults
  const paymentType  = data.paymentType  ?? "one-time";
  const frequency    = data.frequency    ?? "Daily";
  const numberOfDays = data.numberOfDays ?? 30;
  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 25;

  const isRecurring  = paymentType === "recurring";

  // Total = amount × days (only for recurring)
  const total = isRecurring ? amountTier * numberOfDays : amountTier;

  // Currency symbol
  const currencySymbol = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" }[currency] ?? "$";

  return (
    <StepLayout
      step={4}
      title="Your Payment"
      subtitle="Choose between a one-time or split donation, select an amount or enter a custom value"
      onNext={() => handleNext(5)}
      onPrev={() => handlePrev(data.isRamadan ? 3 : 2)}
      prevLabel="Payment Options"
      nextLabel="Addons"
    >
      <div className="flex flex-col gap-5">

        {/* ── Payment type toggle ── */}
        <div className="flex flex-col gap-2.5">
          {PAYMENT_TYPES.map((type) => {
            const active = paymentType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => update({ paymentType: type.value })}
                className={`w-full flex items-center gap-3.5 rounded-2xl px-5 py-4 border text-left transition-all duration-200 ${
                  active
                    ? "border-[#EA3335] bg-[#FFF5F5]"
                    : "border-[#E5E5E5] hover:border-[#EA3335]/40 bg-white"
                }`}
              >
                {/* Radio indicator */}
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-[#EA3335]" : "border-[#CCCCCC]"
                  }`}
                >
                  {active && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />
                  )}
                </span>
                <div>
                  <p className={`text-[15px] font-semibold leading-snug ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                    {type.label}
                  </p>
                  <p className="text-[12px] text-[#737373] mt-0.5">{type.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Recurring options (only shown when recurring) ── */}
        {isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#383838] mb-2">
                Schedule Frequency
              </label>
              <Select
                value={frequency}
                onChange={(val) => update({ frequency: val })}
                options={FREQUENCY_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#383838] mb-2">
                Number of Days
              </label>
              <Select
                value={String(numberOfDays)}
                onChange={(val) => update({ numberOfDays: Number(val) })}
                options={DAYS_OPTIONS.map((d) => ({ label: String(d), value: String(d) }))}
              />
            </div>
          </div>
        )}

        {/* ── Currency ── */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">
            Currency
          </label>
          <Select
            value={currency}
            onChange={(val) => update({ currency: val })}
            options={CURRENCY_OPTIONS}
          />
        </div>

        {/* ── Donation amount tiles ── */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-3">
            {isRecurring ? `${frequency} Donation Amount` : "Donation Amount"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {AMOUNT_TIERS.map((tier) => {
              const active = amountTier === tier.amount;
              return (
                <button
                  key={tier.amount}
                  onClick={() => update({ amountTier: tier.amount })}
                  className={`flex flex-col text-left rounded-2xl px-4 py-4 border transition-all duration-200 ${
                    active
                      ? "border-[#EA3335] bg-[#FFF5F5]"
                      : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                  }`}
                >
                  <span className={`text-[20px] font-bold leading-none ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                    {currencySymbol}{tier.amount}
                  </span>
                  <span className="text-[11px] text-[#737373] mt-2 leading-snug">
                    {tier.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Total amount ── */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">
            Total Amount
          </label>
          <div className="bg-white border border-[#E5E5E5] rounded-2xl px-5 py-4">
            <p className="text-[32px] font-bold text-[#383838] leading-none">
              {currencySymbol}{total.toLocaleString()}
            </p>
            {isRecurring && (
              <p className="text-[12px] text-[#737373] mt-1.5">
                {currencySymbol}{amountTier} × {numberOfDays} days ({frequency.toLowerCase()})
              </p>
            )}
          </div>
        </div>

        {/* ── Security badge ── */}
        <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-xl px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-[12px] text-[#737373]">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>

      </div>
    </StepLayout>
  );
}
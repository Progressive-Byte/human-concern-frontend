"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useState } from "react";
import Toggle from "../../../components/ui/Toggle";
import Select from "@/components/ui/Select";

const PAYMENT_TYPES = [
  { value: "one-time",   label: "One-time Payment",  desc: (amt, sym) => `Pay the full amount of ${sym}${amt} today` },
  { value: "recurring",  label: "Split Payments",     desc: () => "Split your donation into scheduled payments" },
];

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly"];
const DAYS_OPTIONS      = [7, 14, 21, 30, 60, 90];

const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD", symbol: "$"    },
  { label: "GBP (£)", value: "GBP", symbol: "£"    },
  { label: "EUR (€)", value: "EUR", symbol: "€"    },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

const AMOUNT_TIERS = [
  { amount: 25,  desc: "Feed a fasting person for 1 meal." },
  { amount: 50,  desc: "Feed two fasting person for 1 meal." },
  { amount: 100, desc: "Feed 4 fasting person for 1 meal." },
];

const TIP_PERCENTAGES = [0, 5, 10, 15];

function NumberInput({ value, onChange, min = 1, max = 99 }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
      className="w-16 border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-[14px] text-[#383838] outline-none focus:border-[#EA3335] text-center"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step5Payment() {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  // Payment type
  const paymentType  = data.paymentType  ?? "one-time";
  const frequency    = data.frequency    ?? "Daily";
  const numberOfDays = data.numberOfDays ?? 30;
  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 25;

  // Add-ons (from campaign.addOns)
  const [fitrana,        setFitrana]        = useState(true);
  const [fitranaPersons, setFitranaPersons] = useState(1);
  const [fidya,          setFidya]          = useState(true);
  const [fidyaPersons,   setFidyaPersons]   = useState(1);
  const [fidyaFasts,     setFidyaFasts]     = useState(2);

  // Platform tip
  const [tipPct, setTipPct] = useState(10); // default 10%

  const isRecurring   = paymentType === "recurring";
  const currencyData  = CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const sym           = currencyData.symbol;

  // ── Calculations ────────────────────────────────────────────────────────────

  // Base donation
  const baseDonation  = isRecurring ? amountTier * numberOfDays : amountTier;

  // Add-ons
  const fitranaTotal  = fitrana ? 12 * fitranaPersons : 0;
  const fidyaTotal    = fidya   ? 10 * fidyaPersons * fidyaFasts : 0;
  const addOnsTotal   = fitranaTotal + fidyaTotal;

  // Tip calculated on base donation only
  const tipAmount     = Math.round((baseDonation * tipPct) / 100 * 100) / 100;

  // Grand total
  const grandTotal    = baseDonation + addOnsTotal + tipAmount;

  // Tip slider: map tipPct (0–15) to slider percentage position
  const sliderMax     = 15;

  return (
    <StepLayout
      step={4}
      title="Payment"
      subtitle="Choose between a one-time or split donation, Select an amount or enter a custom value"
      onNext={() => {
        update({ paymentType, frequency, numberOfDays, currency, amountTier, tipPct, grandTotal });
        handleNext(5);
      }}
      onPrev={() => handlePrev(data.isRamadan ? 3 : 2)}
      prevLabel="Back"
      nextLabel="Continue"
    >
      <div className="flex flex-col gap-4">

        {/* ── Payment type ── */}
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
                    : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-[#EA3335]" : "border-[#CCCCCC]"
                  }`}
                >
                  {active && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#383838] leading-snug">
                    {type.label}
                  </p>
                  <p className="text-[12px] text-[#737373] mt-0.5">
                    {type.desc(amountTier, sym)}
                  </p>
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
              <Select
                value={frequency}
                onChange={(val) => update({ frequency: val })}
                options={FREQUENCY_OPTIONS}
              />
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

        {/* ── Currency ── */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Currency</label>
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
                  <span className={`text-[22px] font-bold leading-none ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                    {sym}{tier.amount}
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
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Total Amount</label>
          <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-[16px] text-[#737373] font-medium">{sym}</span>
            <span className="text-[28px] font-bold text-[#383838] leading-none">
              {baseDonation.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Add Fitrana ── */}
        <div className="border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Toggle enabled={fitrana} onChange={setFitrana} />
            <div>
              <p className="text-[14px] font-semibold text-[#383838]">Add Fitrana</p>
              <p className="text-[12px] text-[#737373]">$12 per person · Must be paid instantly.</p>
            </div>
          </div>
          {fitrana && (
            <div className="flex items-center gap-3 px-4 pb-3.5 border-t border-[#F0F0F0] pt-3">
              <span className="text-[13px] text-[#383838] font-medium">Number of persons:</span>
              <NumberInput value={fitranaPersons} onChange={setFitranaPersons} />
              <span className="text-[13px] text-[#737373]">
                = <span className="font-semibold text-[#383838]">${fitranaTotal}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Add Fidya ── */}
        <div className="border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Toggle enabled={fidya} onChange={setFidya} />
            <div>
              <p className="text-[14px] font-semibold text-[#383838]">Add Fidya</p>
              <p className="text-[12px] text-[#737373]">$10 per person per fast · Must be paid instantly.</p>
            </div>
          </div>
          {fidya && (
            <div className="flex items-center gap-3 flex-wrap px-4 pb-3.5 border-t border-[#F0F0F0] pt-3">
              <span className="text-[13px] text-[#383838] font-medium">Persons:</span>
              <NumberInput value={fidyaPersons} onChange={setFidyaPersons} />
              <span className="text-[13px] text-[#383838] font-medium">Fasts:</span>
              <NumberInput value={fidyaFasts} onChange={setFidyaFasts} />
              <span className="text-[13px] text-[#737373]">
                = <span className="font-semibold text-[#383838]">${fidyaTotal}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Platform Support Tip ── */}
        <div className="border border-[#E5E5E5] rounded-xl bg-[#F9F9F9] px-4 py-4">
          <p className="text-[14px] font-semibold text-[#383838]">Platform Support Tip</p>
          <p className="text-[12px] text-[#737373] mt-0.5 mb-4">
            Voluntary tip for platform maintenance and well being
          </p>

          {/* Tip display */}
          <div className="inline-flex items-center bg-white border border-[#E5E5E5] rounded-lg px-4 py-2 mb-4">
            <span className="text-[16px] font-bold text-[#383838]">
              {sym}{tipAmount.toFixed(2)}
            </span>
          </div>

          {/* Range slider */}
          <div className="relative">
            <input
              type="range"
              min={0}
              max={sliderMax}
              step={1}
              value={tipPct}
              onChange={(e) => setTipPct(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#EA3335]"
              style={{
                background: `linear-gradient(to right, #EA3335 ${(tipPct / sliderMax) * 100}%, #E5E5E5 ${(tipPct / sliderMax) * 100}%)`,
              }}
            />
            {/* Tick labels */}
            <div className="flex justify-between mt-1.5">
              {TIP_PERCENTAGES.map((pct) => (
                <span
                  key={pct}
                  className={`text-[11px] ${tipPct === pct ? "text-[#EA3335] font-semibold" : "text-[#AEAEAE]"}`}
                >
                  {pct}%
                </span>
              ))}
            </div>
          </div>

          {/* Tip calculation note */}
          <p className="text-[11px] text-[#AEAEAE] mt-2">
            {tipPct}% of base donation ({sym}{baseDonation})
          </p>
        </div>

        {/* ── Subtotal summary ── */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3">
          <p className="text-[13px] text-[#383838]">
            <span className="font-medium">Subtotal: </span>
            <span className="text-[#737373]">
              {sym}{baseDonation}
              {addOnsTotal > 0 && (
                <> + <span className="font-semibold text-[#383838]">{sym}{addOnsTotal}</span>(add-ons)</>
              )}
              {tipAmount > 0 && (
                <> + <span className="font-semibold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>(Tip)</>
              )}
              {" "}={" "}
              <span className="font-bold text-[#383838] text-[15px]">
                {sym}{grandTotal.toFixed(2)}
              </span>
            </span>
          </p>
        </div>

      </div>
    </StepLayout>
  );
}
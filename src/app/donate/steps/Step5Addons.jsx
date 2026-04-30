"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useState, useMemo } from "react";
import Stepper from "@/components/ui/Stepper";
import Toggle from "@/components/ui/Toggle";

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

const TIP_PERCENTAGES = [0, 5, 10, 15];

function calcAddOnTotal(addOn, inputValues) {
  const { pricing, amount } = addOn;
  if (!pricing || pricing.type === "fixed") return amount ?? 0;
  if (pricing.type === "formula") {
    const base = pricing.baseUnitAmount ?? amount ?? 0;
    return (pricing.inputs ?? []).reduce(
      (acc, inp) => acc * (inputValues[inp.key] ?? inp.defaultValue ?? 1),
      base
    );
  }
  return amount ?? 0;
}

/** Build a human-readable formula string e.g. "2 persons × $12.00" */
function buildFormulaLabel(addOn, inputValues, sym) {
  const { pricing } = addOn;
  if (!pricing?.formula || !pricing?.inputs) return null;
  const parts = (pricing.inputs ?? []).map((inp) => {
    const val = inputValues[inp.key] ?? inp.defaultValue ?? 1;
    return `${val} ${inp.label.toLowerCase()}`;
  });
  const base = pricing.baseUnitAmount ?? addOn.amount ?? 0;
  return `${parts.join(" × ")} × ${sym}${base}`;
}

const Step5Addons = () => {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignAddOns = campaignMeta.addOns            ?? [];
  const enableTipping  = campaignMeta.goalsDates?.enableTipping ?? true;

  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 0;
  const paymentType  = data.paymentType  ?? "one-time";
  const numberOfDays = data.numberOfDays ?? 30;
  const isRecurring  = paymentType === "recurring";

  const currencyData = CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const sym          = currencyData.symbol;
  const baseDonation = isRecurring ? amountTier * numberOfDays : amountTier;

  const [addOnEnabled, setAddOnEnabled] = useState(() =>
    Object.fromEntries(campaignAddOns.map((a) => [a.id, true]))
  );
  const [addOnInputs, setAddOnInputs] = useState(() =>
    Object.fromEntries(
      campaignAddOns.map((a) => [
        a.id,
        Object.fromEntries(
          (a.pricing?.inputs ?? []).map((inp) => [inp.key, inp.defaultValue ?? 1])
        ),
      ])
    )
  );
  const [tipPct, setTipPct] = useState(10);

  const addOnsTotal = campaignAddOns.reduce((sum, addOn) => {
    if (!addOnEnabled[addOn.id]) return sum;
    return sum + calcAddOnTotal(addOn, addOnInputs[addOn.id] ?? {});
  }, 0);

  const sliderMax  = 15;
  const tipAmount  = enableTipping ? Math.round((baseDonation * tipPct) / 100 * 100) / 100 : 0;
  const grandTotal = baseDonation + addOnsTotal + tipAmount;

  const updateAddOnInput = (addOnId, key, val) =>
    setAddOnInputs((prev) => ({ ...prev, [addOnId]: { ...prev[addOnId], [key]: val } }));

  return (
    <StepLayout
      step={5}
      title="Add-ons"
      subtitle="Enhance your donation with optional add-ons and support the platform"
      onNext={() => {
        update({ tipPct, grandTotal, addOnsTotal });
        handleNext(6);
      }}
      onPrev={() => handlePrev(4)}
      prevLabel="Back"
      nextLabel="Payment Details"
    >
      <div className="flex flex-col gap-4">
        <div className="border border-[#E5E5E5] rounded-xl px-4 py-3 bg-white">
          <p className="text-[13px] text-[#737373] mb-1.5">Donation Amount</p>
          <p className="text-[28px] font-bold text-[#383838]">
            {sym}{baseDonation.toLocaleString()}
          </p>
        </div>

        {campaignAddOns.map((addOn) => {
          const enabled     = addOnEnabled[addOn.id] ?? true;
          const inputs      = addOn.pricing?.inputs ?? [];
          const inputValues = addOnInputs[addOn.id] ?? {};
          const addOnTotal  = calcAddOnTotal(addOn, inputValues);
          const formulaLabel = buildFormulaLabel(addOn, inputValues, sym);

          return (
            <div key={addOn.id} className="border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">

              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[14px] font-semibold text-[#383838]">
                    {addOn.name}
                  </p>
                  <p className="text-[12px] text-[#737373] mt-0.5">
                    {addOn.labelUnderAmount ?? addOn.shortDescription}
                  </p>
                </div>
                <Toggle
                  enabled={enabled}
                  onChange={(val) => setAddOnEnabled((prev) => ({ ...prev, [addOn.id]: val }))}
                />
              </div>

              {/* Stepper inputs + total */}
              {enabled && inputs.length > 0 && (
                <div className="px-4 pb-4 border-t border-[#F0F0F0] pt-3">
                  <div className="flex gap-3">
                    {/* Stepper inputs */}
                    {inputs.map((inp) => (
                      <Stepper
                        key={inp.key}
                        label={inp.label}
                        hint="Add yourself & dependants"
                        value={inputValues[inp.key] ?? inp.defaultValue ?? 1}
                        onChange={(val) => updateAddOnInput(addOn.id, inp.key, val)}
                        min={inp.min ?? 1}
                        max={inp.max ?? 99}
                      />
                    ))}

                    {/* Green total box */}
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 flex flex-col items-center justify-center flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#065F46] text-center mb-1">Total</p>
                      <p className="text-[26px] font-bold text-[#065F46] leading-none">
                        {sym}{addOnTotal}
                      </p>
                      {formulaLabel && (
                        <p className="text-[10px] text-[#6B7280] mt-1.5 text-center leading-snug">
                          {formulaLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Platform Support Tip ── */}
        {enableTipping && (
          <div className="border border-[#E5E5E5] rounded-xl bg-[#F9F9F9] px-4 py-4">
            <p className="text-[14px] font-semibold text-[#383838]">Platform Support Fees</p>
            <p className="text-[12px] text-[#737373] mt-0.5 mb-4">
              Voluntary support for organization fees for platform maintenance and well being
            </p>

            {/* Tip amount display */}
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

              {/* Tick labels — active pct highlighted in red */}
              <div className="flex justify-between mt-2">
                {TIP_PERCENTAGES.map((pct) => (
                  <span
                    key={pct}
                    className={`text-[11px] font-medium transition-colors ${
                      tipPct === pct ? "text-[#EA3335]" : "text-[#AEAEAE]"
                    }`}
                  >
                    {pct}%
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#AEAEAE] mt-2">
              {tipPct}% of base donation ({sym}{baseDonation})
            </p>
          </div>
        )}

        {/* ── Subtotal ── */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3">
          <p className="text-[13px] text-[#383838]">
            <span className="font-bold">Subtotal: </span>
            <span className="text-[#737373]">
              {sym}{baseDonation}
              {addOnsTotal > 0 && (
                <>
                  {" + "}
                  <span className="font-semibold text-[#383838]">{sym}{addOnsTotal}</span>
                  {" (add-ons)"}
                </>
              )}
              {tipAmount > 0 && (
                <>
                  {" + "}
                  <span className="font-semibold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
                  {" (Tip)"}
                </>
              )}
              {" = "}
              <span className="font-bold text-[#383838] text-[15px]">
                {sym}{grandTotal.toFixed(2)}
              </span>
            </span>
          </p>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step5Addons;
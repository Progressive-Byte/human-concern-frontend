"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useState, useMemo } from "react";
import Toggle from "../../../components/ui/Toggle";
import NumberInput from "@/components/ui/NumberInput";

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

export default function Step5Addons() {
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
      nextLabel="Summary"
    >
      <div className="flex flex-col gap-4">

        {/* ── Payment amount summary ── */}
        <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-[13px] text-[#737373] font-medium">Donation Amount</span>
          <span className="text-[20px] font-bold text-[#383838]">{sym}{baseDonation.toLocaleString()}</span>
        </div>

        {/* ── Add-ons (dynamic from campaign) ── */}
        {campaignAddOns.map((addOn) => {
          const enabled     = addOnEnabled[addOn.id] ?? true;
          const inputs      = addOn.pricing?.inputs ?? [];
          const inputValues = addOnInputs[addOn.id] ?? {};
          const addOnTotal  = calcAddOnTotal(addOn, inputValues);

          return (
            <div key={addOn.id} className="border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Toggle
                  enabled={enabled}
                  onChange={(val) => setAddOnEnabled((prev) => ({ ...prev, [addOn.id]: val }))}
                />
                <div>
                  <p className="text-[14px] font-semibold text-[#383838]">
                    {addOn.iconEmoji && <span className="mr-1">{addOn.iconEmoji}</span>}
                    {addOn.name}
                  </p>
                  <p className="text-[12px] text-[#737373]">
                    {addOn.labelUnderAmount ?? addOn.shortDescription}
                  </p>
                </div>
              </div>
              {enabled && inputs.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap px-4 pb-3.5 border-t border-[#F0F0F0] pt-3">
                  {inputs.map((inp) => (
                    <div key={inp.key} className="flex items-center gap-2">
                      <span className="text-[13px] text-[#383838] font-medium">{inp.label}:</span>
                      <NumberInput
                        value={inputValues[inp.key] ?? inp.defaultValue ?? 1}
                        onChange={(val) => updateAddOnInput(addOn.id, inp.key, val)}
                        min={inp.min ?? 1}
                        max={inp.max ?? 99}
                      />
                    </div>
                  ))}
                  <span className="text-[13px] text-[#737373]">
                    = <span className="font-semibold text-[#383838]">{sym}{addOnTotal}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Platform Support Tip ── */}
        {enableTipping && (
          <div className="border border-[#E5E5E5] rounded-xl bg-[#F9F9F9] px-4 py-4">
            <p className="text-[14px] font-semibold text-[#383838]">Platform Support Tip</p>
            <p className="text-[12px] text-[#737373] mt-0.5 mb-4">
              Voluntary tip for platform maintenance and well being
            </p>

            <div className="inline-flex items-center bg-white border border-[#E5E5E5] rounded-lg px-4 py-2 mb-4">
              <span className="text-[16px] font-bold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
            </div>

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

            <p className="text-[11px] text-[#AEAEAE] mt-2">
              {tipPct}% of base donation ({sym}{baseDonation})
            </p>
          </div>
        )}

        {/* ── Subtotal ── */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3">
          <p className="text-[13px] text-[#383838]">
            <span className="font-medium">Subtotal: </span>
            <span className="text-[#737373]">
              {sym}{baseDonation}
              {addOnsTotal > 0 && (
                <> + <span className="font-semibold text-[#383838]">{sym}{addOnsTotal}</span> (add-ons)</>
              )}
              {tipAmount > 0 && (
                <> + <span className="font-semibold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span> (Tip)</>
              )}
              {" "}={" "}
              <span className="font-bold text-[#383838] text-[15px]">{sym}{grandTotal.toFixed(2)}</span>
            </span>
          </p>
        </div>

      </div>
    </StepLayout>
  );
}

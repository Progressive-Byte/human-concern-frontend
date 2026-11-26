"use client";

import confetti from "canvas-confetti";
import Stepper from "@/components/ui/Stepper";
import Toggle from "@/components/ui/Toggle";

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

/*
  Each add-on is one row that stays compact until it is switched on. The amount is always on
  the right so a donor can compare before enabling anything, and the count controls only appear
  once the add-on is actually part of the gift.
*/
const AddOnsList = ({ campaignAddOns, sym, addOnEnabled, setAddOnEnabled, addOnInputs, updateAddOnInput }) => {
  if (!campaignAddOns.length) return null;

  const handleToggle = (addOn, val) => {
    setAddOnEnabled((prev) => ({ ...prev, [addOn.id]: val }));
    if (val) {
      const colors = ["#EA3335", "#FF6B35", "#FFD700", "#00C853", "#2196F3", "#9C27B0"];
      confetti({ particleCount: 90, angle: 60, spread: 70, startVelocity: 50, origin: { x: 0, y: 0.65 }, colors });
      confetti({ particleCount: 90, angle: 120, spread: 70, startVelocity: 50, origin: { x: 1, y: 0.65 }, colors });
    }
  };

  return (
    <div className="flex flex-col divide-y divide-[#F0F0F0]">
      {campaignAddOns.map((addOn) => {
        const enabled      = addOnEnabled[addOn.id] ?? false;
        const inputs       = addOn.pricing?.inputs ?? [];
        const inputValues  = addOnInputs[addOn.id] ?? {};
        const addOnTotal   = calcAddOnTotal(addOn, inputValues);
        const formulaLabel = buildFormulaLabel(addOn, inputValues, sym);

        return (
          <div key={addOn.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                {addOn.iconEmoji ? (
                  <span className="shrink-0 text-[20px] leading-none">{addOn.iconEmoji}</span>
                ) : null}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug text-[#383838]">{addOn.name}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-[#737373]">
                    {addOn.labelUnderAmount ?? addOn.shortDescription}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {/* The figure sits here so the price is readable before anything is switched on. */}
                <span className={`text-[14px] font-semibold tabular-nums ${enabled ? "text-[#EA3335]" : "text-[#AEAEAE]"}`}>
                  {sym}{addOnTotal}
                </span>
                <Toggle enabled={enabled} onChange={(val) => handleToggle(addOn, val)} />
              </div>
            </div>

            {enabled && inputs.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl bg-[#FAFAFA] p-3 sm:flex-row">
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
                <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                  <p className="mb-1 text-center text-[11px] font-medium text-[#065F46]">Total</p>
                  <p className="text-[22px] font-bold leading-none text-[#065F46]">{sym}{addOnTotal}</p>
                  {formulaLabel && (
                    <p className="mt-1.5 text-center text-[10px] leading-snug text-[#6B7280]">{formulaLabel}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AddOnsList;

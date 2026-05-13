"use client";

import { useRef } from "react";
import confetti from "canvas-confetti";
import Stepper from "@/components/ui/Stepper";
import Toggle  from "@/components/ui/Toggle";

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

const AddOnsList = ({ campaignAddOns, sym, addOnEnabled, setAddOnEnabled, addOnInputs, updateAddOnInput }) => {
  if (!campaignAddOns.length) return null;

  return (
    <>
      {campaignAddOns.map((addOn) => {
        const enabled      = addOnEnabled[addOn.id] ?? true;
        const inputs       = addOn.pricing?.inputs ?? [];
        const inputValues  = addOnInputs[addOn.id] ?? {};
        const addOnTotal   = calcAddOnTotal(addOn, inputValues);
        const formulaLabel = buildFormulaLabel(addOn, inputValues, sym);

        return (
          <div key={addOn.id} className="border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[14px] font-semibold text-[#383838]">{addOn.name}</p>
                <p className="text-[12px] text-[#737373] mt-0.5">
                  {addOn.labelUnderAmount ?? addOn.shortDescription}
                </p>
              </div>
              <Toggle
                enabled={enabled}
                onChange={(val) => setAddOnEnabled((prev) => ({ ...prev, [addOn.id]: val }))}
              />
            </div>

            {enabled && inputs.length > 0 && (
              <div className="px-4 pb-4 border-t border-[#F0F0F0] pt-3">
                <div className="flex gap-3">
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
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 flex flex-col items-center justify-center flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[#065F46] text-center mb-1">Total</p>
                    <p className="text-[26px] font-bold text-[#065F46] leading-none">{sym}{addOnTotal}</p>
                    {formulaLabel && (
                      <p className="text-[10px] text-[#6B7280] mt-1.5 text-center leading-snug">{formulaLabel}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default AddOnsList;

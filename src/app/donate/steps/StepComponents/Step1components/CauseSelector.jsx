"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { distributeAmount } from "@/utils/causeSplit";

const CauseAmountInput = ({ amount, sym, onChange }) => {
  const [text, setText] = useState(() => amount.toFixed(2));
  const lastAmount = useRef(amount);

  useEffect(() => {
    if (amount === lastAmount.current) return;
    lastAmount.current = amount;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the auto-balanced amount computed by a sibling edit, not deriving local state
    setText(amount.toFixed(2));
  }, [amount]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    const num = Number(val);
    if (val !== "" && Number.isFinite(num)) {
      lastAmount.current = num;
      onChange(num);
    }
  };

  const handleBlur = () => setText(amount.toFixed(2));

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-2 flex items-center rounded-lg border border-[#E5E5E5] bg-white overflow-hidden focus-within:border-[#EA3335]"
    >
      <span className="pl-2.5 pr-1 text-[12px] text-[#8C8C8C]">{sym}</span>
      <input
        type="number"
        min={0}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => e.target.select()}
        className="w-full min-w-0 py-1.5 pr-2.5 text-[13px] font-semibold text-[#383838] outline-none bg-transparent"
      />
    </div>
  );
};

const CauseSelector = ({ causes, selectedCauseIds, toggleCause, causeSplit, totalAmount, sym, onSplitChange }) => {
  const allocations = useMemo(
    () => Object.fromEntries(distributeAmount(totalAmount, causeSplit).map((a) => [a.causeId, a.amount])),
    [totalAmount, causeSplit]
  );

  if (!causes.length) return null;

  const showSplit = selectedCauseIds.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#383838]">Select Cause</p>
        <span className="text-[13px] text-[#8C8C8C]">
          <span className="text-[#000000] font-normal">{selectedCauseIds.length} selected</span>
          {" "}of {causes.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {causes.map((cause) => {
          const active = selectedCauseIds.includes(cause.id);
          return (
            <div
              key={cause.id}
              className={`rounded-xl p-4 border transition-all ${
                active
                  ? "border-[#EA3335] bg-[#FFF5F5]"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCause(cause)}
                className="w-full flex flex-col items-start gap-2 text-left cursor-pointer"
              >
                {cause.emoji && (
                  <span className="text-[28px] leading-none">{cause.emoji}</span>
                )}
                <div>
                  <p className="text-[14px] font-semibold text-[#383838]">{cause.label}</p>
                  {cause.desc && (
                    <p className="text-[12px] text-[#8C8C8C] mt-0.5">{cause.desc}</p>
                  )}
                  {cause.zakatEligible && (
                    <span className="inline-block mt-2 text-[11px] font-medium text-[#8C8C8C] bg-white rounded-full px-1.5 py-0.5">
                      Zakat Eligible
                    </span>
                  )}
                </div>
              </button>

              {active && showSplit && (
                <CauseAmountInput
                  amount={allocations[cause.id] ?? 0}
                  sym={sym}
                  onChange={(amount) => onSplitChange(cause.id, amount)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CauseSelector;

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { distributeAmount } from "@/utils/causeSplit";

const CauseAmountInput = ({ amount, sym, onChange }) => {
  const [text, setText] = useState(() => amount.toFixed(2));
  const lastAmount = useRef(amount);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // While the donor is typing, don't overwrite their text with the rounded value.
    if (focused) return;
    if (amount === lastAmount.current) return;
    lastAmount.current = amount;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the auto-balanced amount computed by a sibling edit, not deriving local state
    setText(amount.toFixed(2));
  }, [amount, focused]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    const num = Number(val);
    if (val !== "" && Number.isFinite(num) && num >= 0) {
      const rounded = Math.round(num * 100) / 100;
      lastAmount.current = rounded;
      onChange(rounded);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const num = Number(text);

    if (text === "" || !Number.isFinite(num) || num < 0) {
      lastAmount.current = amount;
      setText(amount.toFixed(2));
      return;
    }

    const rounded = Math.round(num * 100) / 100;
    lastAmount.current = rounded;
    setText(rounded.toFixed(2));
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-2 flex items-center rounded-lg border border-[#E5E5E5] bg-white overflow-hidden focus-within:border-[#EA3335]"
    >
      <span className="pl-2.5 pr-1 text-[13px] text-[#8C8C8C]">{sym}</span>
      <input
        type="number"
        min={0}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        className="w-full min-w-0 py-1 pr-2.5 text-[13px] sm:text-[16px] font-medium text-[#383838] outline-none bg-transparent"
      />
    </div>
  );
};

const CauseSelector = ({ causes, selectedCauseIds, toggleCause, causeSplit, totalAmount, sym, onSplitChange, onResetSplit }) => {
  const allocations = useMemo(
    () => Object.fromEntries(distributeAmount(totalAmount, causeSplit).map((a) => [a.causeId, a.amount])),
    [totalAmount, causeSplit]
  );

  if (!causes.length) return null;

  const showSplit = selectedCauseIds.length > 1;
  const total = Number(totalAmount);
  const splitDisabled = !Number.isFinite(total) || total <= 0;
  const allocated = selectedCauseIds.reduce(
    (sum, id) => sum + total * Math.max(0, Number(causeSplit[id]) || 0),
    0
  );
  const difference = Math.round((allocated - total) * 100) / 100;
  const over = difference > 0.005;
  const under = difference < -0.005;
  const money = (value) => `${sym}${Math.abs(Number(value) || 0).toFixed(2)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#383838]">Select Cause</p>
        <div className="flex items-center gap-3">
          {showSplit ? (
            <button
              type="button"
              onClick={onResetSplit}
              className="text-[12px] font-medium text-[#EA3335] hover:underline cursor-pointer"
            >
              Reset to equal
            </button>
          ) : null}
          <span className="text-[13px] text-[#8C8C8C]">
            <span className="text-[#000000] font-normal">{selectedCauseIds.length} selected</span>
            {" "}of {causes.length}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {causes.map((cause) => {
          const active = selectedCauseIds.includes(cause.id);
          return (
            <div
              key={cause.id}
              className={`rounded-xl p-3 sm:p-4 border transition-all ${
                active
                  ? "border-[#EA3335] bg-white"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCause(cause)}
                className="w-full flex items-start gap-2.5 text-left cursor-pointer"
              >
                {cause.emoji && (
                  <span className="shrink-0 text-[22px] leading-none">{cause.emoji}</span>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#383838]">{cause.label}</p>
                  {cause.desc && (
                    <p className="text-[12px] text-[#8C8C8C] mt-0.5">{cause.desc}</p>
                  )}
                  {cause.zakatEligible && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-[#8C8C8C] bg-[#F5F5F5] rounded-full px-1.5 py-0.5">
                      Zakat Eligible
                    </span>
                  )}
                </div>
              </button>

              {active && showSplit && (
                splitDisabled ? (
                  <div className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-[11px] text-[#737373]">
                    Enter a donation amount first to split causes.
                  </div>
                ) : (
                  <CauseAmountInput
                    amount={allocations[cause.id] ?? 0}
                    sym={sym}
                    onChange={(amount) => onSplitChange(cause.id, amount)}
                  />
                )
              )}
            </div>
          );
        })}
      </div>

      {showSplit && !splitDisabled ? (
        <p className="text-[11px] leading-snug text-[#8C8C8C]">
          Editing one cause adjusts the causes you have not edited. All amounts must add up to {money(total)}.
        </p>
      ) : null}

      {showSplit && !splitDisabled && (over || under) ? (
        <div
          role="alert"
          className={`rounded-xl border px-3.5 py-2.5 text-[12px] font-medium ${
            over
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-amber-300 bg-amber-50 text-amber-800"
          }`}
        >
          {over
            ? `Cause amounts add up to ${money(allocated)} — ${money(difference)} more than your ${money(total)} donation. Lower a cause or increase the donation.`
            : `You still need to assign ${money(difference)} of your ${money(total)} donation.`}
        </div>
      ) : null}
    </div>
  );
};

export default CauseSelector;

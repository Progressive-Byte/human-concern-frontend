"use client";

import DateAmountRow from "./DateAmountRow";

export default function PerDateAmountTable({ activeDates, dateAmounts, effectiveAmount, sym, onChange }) {
  const total = activeDates.reduce((sum, d) => {
    const ov  = dateAmounts[d] ?? "";
    const amt = ov !== "" ? Number(ov) : effectiveAmount;
    return sum + (isNaN(amt) ? effectiveAmount : amt);
  }, 0);

  return (
    <div className="flex flex-col gap-2 border border-[#EBEBEB] rounded-xl overflow-hidden bg-[#FAFAFA]">

      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-[#383838]">Amount Per Date</p>
          <span className="text-[11px] text-[#737373] bg-[#F0F0F0] rounded-full px-2 py-0.5 tabular-nums">
            {activeDates.length} date{activeDates.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-[11px] text-[#737373]">Default: {sym}{effectiveAmount}</p>
      </div>

      <div
        className="flex flex-col gap-1.5 max-h-[230px] overflow-y-scroll px-3 pb-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB #F3F4F6" }}
      >
        {activeDates.map((d) => (
          <DateAmountRow
            key={d}
            d={d}
            override={dateAmounts[d] ?? ""}
            effectiveAmount={effectiveAmount}
            sym={sym}
            onChange={onChange}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#E5E5E5] bg-white">
        <span className="text-[12px] font-semibold text-[#383838]">
          Total ({activeDates.length} payment{activeDates.length !== 1 ? "s" : ""})
        </span>
        <span className="text-[14px] font-bold text-[#EA3335] tabular-nums">
          {sym}{total.toLocaleString()}
        </span>
      </div>

    </div>
  );
}

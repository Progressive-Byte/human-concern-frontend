const DateAmountRow = ({ d, override, effectiveAmount, sym, onChange }) => {
  const isOverridden  = override !== "";
  const displayAmount = isOverridden ? Number(override) : effectiveAmount;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#737373] w-[88px] shrink-0 font-medium tabular-nums">{d}</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] text-[13px] font-medium select-none">
          {sym}
        </span>
        <input
          type="number"
          value={override}
          placeholder={String(effectiveAmount)}
          min={0}
          onChange={(e) => onChange(d, e.target.value)}
          className={`w-full pl-7 pr-3 py-2 text-[13px] border rounded-xl outline-none transition-colors bg-white ${
            isOverridden
              ? "border-[#EA3335] text-[#383838]"
              : "border-[#E5E5E5] text-[#383838] focus:border-[#EA3335]"
          }`}
        />
      </div>
      <span className={`text-[12px] font-semibold w-14 text-right shrink-0 tabular-nums ${
        isOverridden ? "text-[#EA3335]" : "text-[#383838]"
      }`}>
        {sym}{displayAmount.toLocaleString()}
      </span>
    </div>
  );
};

export default DateAmountRow;

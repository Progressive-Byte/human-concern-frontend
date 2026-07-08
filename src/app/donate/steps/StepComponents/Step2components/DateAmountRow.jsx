import { distributeAmount } from "@/utils/causeSplit";

const DateAmountRow = ({ d, override, effectiveAmount, sym, onChange, disabled = false, causeSplit, causeLabelById }) => {
  const isOverridden  = override !== "";
  const displayAmount = isOverridden ? Number(override) : effectiveAmount;
  const showCauseSplit = causeSplit && Object.keys(causeSplit).length > 1;
  const causeBreakdown = showCauseSplit ? distributeAmount(displayAmount, causeSplit) : [];

  if (disabled) {
    return (
      <div className="flex items-center gap-2 opacity-40">
        <span className="text-[11px] text-[#737373] w-[88px] shrink-0 font-medium tabular-nums">{d}</span>
        <div className="flex-1 flex items-center px-3 py-2 text-[11px] text-[#AEAEAE] bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl">
          Past date
        </div>
        <span className="text-[12px] font-semibold w-14 text-right shrink-0 tabular-nums text-[#AEAEAE]">—</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
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

      {showCauseSplit && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-[96px] pr-14">
          {causeBreakdown.map(({ causeId, amount }) => (
            <span key={causeId} className="text-[10px] text-[#8C8C8C] tabular-nums">
              {causeLabelById?.[causeId] ?? causeId}: <span className="font-medium text-[#737373]">{sym}{amount.toFixed(2)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateAmountRow;

"use client";

import { useDonation } from "@/context/DonationContext";

const TIP_PERCENTAGES = [0, 5, 10, 15];
const SLIDER_MAX      = 15;

const TippingSection = ({
  sym,
  baseDonation,
  tipPct,
  setTipPct,
  customTipAmount,
  setCustomTipAmount,
}) => {
  const { update } = useDonation();

  const customTipParsed = customTipAmount !== "" ? Math.max(0, Number(customTipAmount) || 0) : null;
  const tipAmount       = customTipParsed !== null
    ? customTipParsed
    : Math.round((baseDonation * tipPct) / 100 * 100) / 100;

  const clearCustom = () => {
    setCustomTipAmount("");
    update({ customTipAmount: "" });
  };

  const handleSliderChange = (e) => {
    setTipPct(Number(e.target.value));
    clearCustom();
  };

  const handleCustomChange = (e) => {
    setCustomTipAmount(e.target.value);
    update({ customTipAmount: e.target.value });
  };

  const handleCustomBlur = () => {
    if (customTipAmount !== "" && Number(customTipAmount) < 0) setCustomTipAmount("0");
  };

  return (
    <div className="border border-[#E5E5E5] rounded-xl bg-[#F9F9F9] px-4 py-4">
      <p className="text-[14px] font-semibold text-[#383838]">Platform Support Fees</p>
      <p className="text-[12px] text-[#737373] mt-0.5 mb-4">
        Voluntary support for organization fees for platform maintenance and well being
      </p>

      <div className="inline-flex items-center bg-white border border-[#E5E5E5] rounded-lg px-4 py-2 mb-4">
        <span className="text-[16px] font-bold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
      </div>

      <div className={`transition-opacity ${customTipParsed !== null ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={1}
          value={tipPct}
          onChange={handleSliderChange}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#EA3335]"
          style={{
            background: `linear-gradient(to right, #EA3335 ${(tipPct / SLIDER_MAX) * 100}%, #E5E5E5 ${(tipPct / SLIDER_MAX) * 100}%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          {TIP_PERCENTAGES.map((pct) => (
            <span
              key={pct}
              className={`text-[11px] font-medium transition-colors ${tipPct === pct ? "text-[#EA3335]" : "text-[#AEAEAE]"}`}
            >
              {pct}%
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#AEAEAE] mt-2">
          {tipPct}% of base donation ({sym}{baseDonation})
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-px bg-[#E5E5E5]" />
        <span className="text-[11px] text-[#AEAEAE] shrink-0">or custom amount</span>
        <div className="flex-1 h-px bg-[#E5E5E5]" />
      </div>

      <div className="mt-3 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] font-medium text-[14px]">{sym}</span>
        <input
          type="number"
          value={customTipAmount}
          min={0}
          placeholder="Enter custom amount"
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
          className={`w-full pl-8 pr-10 py-2.5 rounded-xl border text-[14px] outline-none transition-colors ${
            customTipParsed !== null
              ? "border-[#EA3335] bg-[#FFF5F5] text-[#383838]"
              : "border-[#E5E5E5] bg-white text-[#383838] focus:border-[#EA3335]"
          }`}
        />
        {customTipAmount !== "" && (
          <button
            type="button"
            onClick={clearCustom}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEAEAE] hover:text-[#383838] text-[20px] leading-none cursor-pointer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default TippingSection;

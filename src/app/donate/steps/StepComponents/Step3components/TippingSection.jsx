"use client";

import { useState } from "react";
import { useDonation } from "@/context/DonationContext";
import { useBranding } from "@/context/BrandingContext";

// Fallbacks so a failed settings fetch looks exactly like the admin defaults.
const DEFAULT_TIP_LABEL       = "Platform Support Fees";
const DEFAULT_TIP_DESCRIPTION = "Voluntary support for organization fees for platform maintenance and well being";

const TippingSection = ({
  sym,
  baseDonation,
  tipPct,
  setTipPct,
  customTipAmount,
  setCustomTipAmount,
  label,
  description,
  minPercent = 0,
  maxPercent = 15,
  embedded = false,
}) => {
  const { update } = useDonation();
  const { primaryColor } = useBranding();
  const [isSliding, setIsSliding] = useState(false);

  /* The admin sets the slider's range; the donor can never move outside it. */
  const minPct = Math.max(0, Math.min(100, Number(minPercent) || 0));
  const maxPct = Math.max(minPct + 1, Math.min(100, Number(maxPercent) || 15));
  const sliderValue = Math.min(maxPct, Math.max(minPct, Number(tipPct) || 0));
  const ratio = Math.min(1, Math.max(0, (sliderValue - minPct) / (maxPct - minPct)));
  const filled = `${ratio * 100}%`;
  /* The bar stays the same colour, but it starts faint and becomes solid as the figure rises. */
  const fillOpacity = 0.2 + ratio * 0.8;

  const tickValues = [0, 5, 10, 15, 20].filter((tick) => tick >= minPct && tick <= maxPct);
  if (!tickValues.includes(minPct)) tickValues.unshift(minPct);
  if (!tickValues.includes(maxPct)) tickValues.push(maxPct);
  const scaleTicks = Array.from(new Set(tickValues)).sort((a, b) => a - b);

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
    <div className={embedded ? "border-t border-[#E5E5E5] pt-4" : "border border-[#E5E5E5] rounded-xl bg-[#F9F9F9] px-4 py-4"}>
      <p className="text-[14px] font-semibold text-[#383838]">{label || DEFAULT_TIP_LABEL}</p>
      <p className="text-[12px] text-[#737373] mt-0.5 mb-4">
        {description || DEFAULT_TIP_DESCRIPTION}
      </p>

      <div className="inline-flex items-center bg-white border border-[#E5E5E5] rounded-lg px-4 py-2 mb-4">
        <span className="text-[16px] font-bold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
      </div>

      <div className={`transition-opacity ${customTipParsed !== null ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <div className="relative flex h-5 items-center">
          {/* The figure above the thumb. It shows while dragging or focused, and the clamp keeps it inside the track ends. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-full mb-1 origin-bottom -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white transition-all duration-150 ease-out ${
              isSliding ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-90 opacity-0"
            }`}
            style={{
              left: `clamp(1.25rem, ${filled}, calc(100% - 1.25rem))`,
              backgroundColor: primaryColor,
            }}
          >
            {sliderValue}%
          </span>

          {/* The groove. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 h-2 rounded-full bg-[#EFEFEF] shadow-[inset_0_1px_2px_rgb(10_10_10_/_0.15)]"
          />

          {/* The glow behind the filled part, then the filled part itself. */}
          <div
            aria-hidden="true"
            className="absolute h-2 rounded-full blur-[6px] transition-[width,opacity] duration-200"
            style={{ width: filled, opacity: fillOpacity * 0.4, backgroundColor: primaryColor }}
          />
          <div
            aria-hidden="true"
            className="absolute h-2 rounded-full transition-[width,opacity] duration-200"
            style={{ width: filled, opacity: fillOpacity, backgroundColor: primaryColor }}
          />

          <label htmlFor="hc-fee-percent" className="sr-only">
            Extra percentage to help cover costs
          </label>
          <input
            id="hc-fee-percent"
            type="range"
            min={minPct}
            max={maxPct}
            step={1}
            value={sliderValue}
            onChange={handleSliderChange}
            onPointerDown={() => setIsSliding(true)}
            onPointerUp={() => setIsSliding(false)}
            onPointerCancel={() => setIsSliding(false)}
            onFocus={() => setIsSliding(true)}
            onBlur={() => setIsSliding(false)}
            className="hc-fee-slider relative z-10 h-5 w-full"
            style={{ "--hc-fee-color": primaryColor }}
          />
        </div>

        {/* The scale under the track. A dot turns brand colour once the figure has reached it. */}
        <div aria-hidden="true" className="mt-2 flex justify-between px-[11px]">
          {scaleTicks.map((pct) => (
            <span
              key={pct}
              className="size-1 rounded-full transition-colors"
              style={{ backgroundColor: pct <= sliderValue ? primaryColor : "#E5E5E5" }}
            />
          ))}
        </div>

        <p className="text-[11px] text-[#AEAEAE] mt-2">
          {sliderValue}% of base donation ({sym}{Number(baseDonation.toFixed(2))})
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

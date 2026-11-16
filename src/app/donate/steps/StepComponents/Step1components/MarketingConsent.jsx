"use client";

import { useEffect, useMemo } from "react";
import { useDonation } from "@/context/DonationContext";

const MODES = ["checked", "unchecked", "hidden"];
const DEFAULT_MODE = "checked";

// The admin sets this in Public Display; the value travels with campaignData.
function readMarketingMode() {
  try {
    const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
    const mode = String(meta?.display?.marketingConsentMode || "").trim().toLowerCase();
    return MODES.includes(mode) ? mode : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

const MarketingConsent = () => {
  const { data, update } = useDonation();
  const mode = useMemo(() => readMarketingMode(), []);
  const hidden = mode === "hidden";
  const touched = data.marketingConsentTouched === true;

  // Apply the form's default once, unless the donor already made a choice on this form.
  useEffect(() => {
    if (touched) return;
    const next = mode === "unchecked" || hidden ? false : true;
    if (data.marketingConsent !== next) update({ marketingConsent: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={data.marketingConsent !== false}
        onChange={(e) => update({ marketingConsent: e.target.checked, marketingConsentTouched: true })}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CCCCCC] accent-[#EA3335] focus:ring-[#EA3335]"
      />
      <span className="text-[12px] text-[#737373] leading-snug">
        Yes, send me updates about this campaign and future appeals.
      </span>
    </label>
  );
};

export default MarketingConsent;

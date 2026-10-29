"use client";

import { useDonation } from "@/context/DonationContext";

const MarketingConsent = () => {
  const { data, update } = useDonation();
  const checked = Boolean(data.marketingConsent);

  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => update({ marketingConsent: e.target.checked })}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CCCCCC] accent-[#EA3335] focus:ring-[#EA3335]"
      />
      <span className="text-[12px] text-[#737373] leading-snug">
        Yes, send me updates about this campaign and future appeals.
      </span>
    </label>
  );
};

export default MarketingConsent;

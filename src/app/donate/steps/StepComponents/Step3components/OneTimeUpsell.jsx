"use client";

import { getCurrencySymbol } from "@/utils/money";

const OneTimeUpsell = ({ amount = 0, currency = "USD", onSwitch, onDismiss }) => {
  const sym = getCurrencySymbol(currency);

  return (
    <div className="rounded-2xl border border-[#FFE0E0] bg-[#FFF5F5] px-4 py-4">
      <p className="text-[13px] font-semibold text-[#383838]">Make your impact ongoing</p>
      <p className="text-[12px] text-[#737373] mt-1">
        Consider giving {sym}{Number(amount || 0).toFixed(2)}/month to provide continued support.
      </p>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onSwitch}
          className="flex-1 rounded-full bg-[#EA3335] hover:bg-red-700 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors active:scale-95 cursor-pointer"
        >
          Switch to monthly
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 rounded-full border border-[#E5E5E5] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#383838] hover:border-[#AEAEAE] transition-colors active:scale-95 cursor-pointer"
        >
          Keep one-time
        </button>
      </div>
    </div>
  );
};

export default OneTimeUpsell;

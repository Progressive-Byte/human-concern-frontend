"use client";

import { useState } from "react";
import { getCurrencySymbol } from "@/utils/money";

const OneTimeUpsell = ({ amount = 0, currency = "USD", onSwitch }) => {
  const sym = getCurrencySymbol(currency);
  const [keptOneTime, setKeptOneTime] = useState(false);

  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition-colors ${
        keptOneTime ? "border-[#E5E5E5] bg-[#FAFAFA]" : "border-[#FFE0E0] bg-[#FFF5F5]"
      }`}
    >
      <p className={`text-[13px] font-semibold ${keptOneTime ? "text-[#737373]" : "text-[#383838]"}`}>
        Make your impact ongoing
      </p>
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
          onClick={() => setKeptOneTime(true)}
          disabled={keptOneTime}
          aria-pressed={keptOneTime}
          className={`flex-1 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
            keptOneTime
              ? "border border-[#EA3335] bg-white text-[#383838] cursor-default"
              : "border border-[#E5E5E5] bg-white text-[#383838] hover:border-[#AEAEAE] active:scale-95 cursor-pointer"
          }`}
        >
          {keptOneTime ? (
            <>
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EA3335] text-white">
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                >
                  <path
                    d="M5 10.5l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              One-time selected
            </>
          ) : (
            "Keep one-time"
          )}
        </button>
      </div>
    </div>
  );
};

export default OneTimeUpsell;

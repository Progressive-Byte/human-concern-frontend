"use client";

import Link from "next/link";
import { useDonation } from "@/context/DonationContext";

const STEPS = ["Amount", "Frequency", "Personal", "Contact", "Payment", "Card", "Review"];

export default function StepProgress({ current }) {
  const { data } = useDonation();
  const maxStep = data.maxStep ?? 1;

  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        const reachable = step <= maxStep;

        const dot = (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all
            ${done
              ? "bg-[#055A46] text-white"
              : active
              ? "bg-[#EA3335] text-white"
              : reachable
              ? "bg-[#E5E5E5] text-[#737373] hover:bg-[#D0D0D0]"
              : "bg-[#E5E5E5] text-[#AEAEAE] cursor-not-allowed"
            }`}
          >
            {done ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : step}
          </div>
        );

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1 group">
              {reachable ? (
                <Link href={`/donate/${step}`} className="flex flex-col items-center gap-1">
                  {dot}
                  <span className={`text-[10px] font-medium hidden sm:block transition-colors
                    ${active ? "text-[#EA3335]" : done ? "text-[#055A46]" : "text-[#737373]"}`}>
                    {label}
                  </span>
                </Link>
              ) : (
                <>
                  {dot}
                  <span className="text-[10px] font-medium hidden sm:block text-[#AEAEAE]">
                    {label}
                  </span>
                </>
              )}
            </div>

            {i < STEPS.length - 1 && (
              <div className={`h-[2px] w-8 sm:w-12 mx-1 mb-4 rounded-full transition-colors ${done ? "bg-[#055A46]" : "bg-[#E5E5E5]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

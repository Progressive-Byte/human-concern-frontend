"use client";

import Link from "next/link";
import { useDonation } from "@/context/DonationContext";
import { ProgressCheckIcon } from "@/components/common/SvgIcon";


const STEPS = [
  "Info",
  "Payment",
  "Add-ons & Pay",
  "Confirmation",
];

export default function StepProgress({ current }) {
  const { data } = useDonation();
  const maxStep   = data.maxStep   ?? 1;
  const submitted = data.submitted ?? false;
  const base = data.campaign ? `/${data.campaign}` : "/donate";

  const visibleSteps = STEPS.map((label, i) => ({ label, step: i + 1 }));

  return (
    <div className="flex items-center justify-center mb-8">
      {visibleSteps.map(({ label, step }, i) => {
        const done = step < current;
        const active = step === current;
        const reachable = step <= maxStep;

        const dot = (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all select-none
              ${done
                ? "bg-[#1A1A1A] text-white"
                : active
                ? "bg-[#EA3335] text-white"
                : reachable
                ? "bg-[#E5E5E5] text-[#737373] hover:bg-[#D5D5D5] cursor-pointer"
                : "bg-white border border-[#D5D5D5] text-[#CCCCCC] cursor-not-allowed"
              }`}
          >
            {done ? ProgressCheckIcon : i + 1}
          </div>
        );

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              {reachable && !submitted ? (
                <Link href={`${base}/${step}`} className="flex flex-col items-center gap-1">
                  {dot}
                  <span
                    className={`text-[10px] font-medium hidden sm:block transition-colors whitespace-nowrap
                      ${active ? "text-[#EA3335]" : done ? "text-[#1A1A1A]" : "text-[#AEAEAE]"}`}
                  >
                    {label}
                  </span>
                </Link>
              ) : (
                <>
                  {dot}
                  <span className="text-[10px] font-medium hidden sm:block text-[#CCCCCC] whitespace-nowrap">
                    {label}
                  </span>
                </>
              )}
            </div>
            {i < visibleSteps.length - 1 && (
              <div
                className={`h-[1.5px] w-6 sm:w-10 mx-1 mb-4 rounded-full transition-colors
                  ${done ? "bg-[#1A1A1A]" : "bg-[#E5E5E5]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
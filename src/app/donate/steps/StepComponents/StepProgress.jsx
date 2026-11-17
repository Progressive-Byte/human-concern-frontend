"use client";

import Link from "next/link";
import { useDonation } from "@/context/DonationContext";
import { ProgressCheckIcon } from "@/components/common/SvgIcon";


const STEPS = [
  "Your gift",
  "Your details",
  "Payment",
];

const StepProgress = ({ current }) => {
  const { data } = useDonation();
  const maxStep = data.maxStep ?? 1;
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
                ? "bg-[#F1F1F1] text-[#8C8C8C]"
                : active
                ? "bg-white text-[#B85C5C] border border-[#E6C7C7]"
                : reachable
                ? "bg-[#F7F7F7] text-[#B3B3B3] hover:bg-[#EFEFEF] cursor-pointer"
                : "bg-white border border-[#ECECEC] text-[#D0D0D0] cursor-not-allowed"
              }`}
          >
            {done ? ProgressCheckIcon : i + 1}
          </div>
        );

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              {reachable ? (
                <Link href={`${base}/${step}`} className="flex flex-col items-center gap-1">
                  {dot}
                  <span
                    className={`text-[10px] font-medium ${active ? "visible" : "invisible"} sm:visible transition-colors whitespace-nowrap
                      ${active ? "text-[#B85C5C]" : done ? "text-[#9A9A9A]" : "text-[#B3B3B3]"}`}
                  >
                    {label}
                  </span>
                </Link>
              ) : (
                <>
                  {dot}
                  <span
                    className={`text-[10px] font-medium ${active ? "visible" : "invisible"} sm:visible text-[#CCCCCC] whitespace-nowrap`}
                  >
                    {label}
                  </span>
                </>
              )}
            </div>
            {i < visibleSteps.length - 1 && (
              <div
                className={`h-[1.5px] w-6 sm:w-10 mx-1 mb-4 rounded-full transition-colors
                  ${done ? "bg-[#E5E5E5]" : "bg-[#F0F0F0]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepProgress;
"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";

const OBJECTIVES = [
  {
    value: "all-30",
    label: "All 30 Nights Donation",
    desc: "Choose between one time payment or split payment into 30 days",
  },
  {
    value: "odd-nights",
    label: "Odd Nights Donation",
    desc: "Choose between one time payment or split payment into 15 odd number of nights",
  },
  {
    value: "27th-night",
    label: "27th Night Donation",
    desc: "One-time payment only",
  },
  {
    value: "last-10",
    label: "Last 10 Nights",
    desc: "Choose between one time payment or split payment into 10 days",
  },
];

export default function Step3Objectives() {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();

  return (
    <StepLayout
      step={3}
      title="Your Donation Payment Options"
      subtitle="Select a payment plan for your donation (optional)"
      onNext={() => handleNext(4)}
      prevLabel="Donation Type"
      nextLabel="Payment"
    >
      <div className="flex flex-col gap-3">
        {OBJECTIVES.map((obj) => {
          const active = data.objective === obj.value;
          return (
            <button
              key={obj.value}
              onClick={() => update({ objective: obj.value })}
              className={`w-full flex flex-col items-start rounded-xl px-5 py-4 border text-left transition-all
                ${active
                  ? "border-[#EA3335] bg-white"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] bg-white"}`}
            >
              <p className={`text-[14px] font-semibold ${active ? "text-[#383838]" : "text-[#383838]"}`}>
                {obj.label}
              </p>
              <p className="text-[12px] text-[#8C8C8C] mt-0.5">{obj.desc}</p>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}
"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { ActiveDonerIcon, donationIcon } from "@/components/common/SvgIcon";

const CAUSES = [
  { value: "general", label: "General Donation", desc: "Contribute to the general fund", icon: donationIcon },
  { value: "zakat",   label: "Zakat",            desc: "Obligatory charity for eligible Muslims", icon: "💰", tag: "Zakat Eligible" },
  { value: "sadaqah", label: "Sadaqah",           desc: "Voluntary charity for any cause", icon: "🤲" },
  { value: "global",  label: "Global Emergency",  desc: "Urgent humanitarian aid", icon: "🚨" },
];

export default function Step2Cause() {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();

  const selected = CAUSES.filter((c) => data.causes?.includes(c.value));

  const toggle = (value) => {
    const current = data.causes ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ causes: next });
  };

  return (
    <StepLayout
      step={2}
      title="Select Donation Type"
      subtitle="Choose the type of donation you'd like to make"
      onNext={() => handleNext(3)}
      prevLabel="Personal Info"
      nextLabel="Objectives"
    >
      <div className="flex justify-end mb-3">
        <span className="text-[14px] text-[#8C8C8C]">
          <span className="text-[#000000] font-normal">{selected.length} Selected</span>
          {" "}Out of {CAUSES.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CAUSES.map((cause) => {
          const active = (data.causes ?? []).includes(cause.value);
          return (
            <button
              key={cause.value}
              onClick={() => toggle(cause.value)}
              className={`flex flex-col items-start gap-2 rounded-xl p-4 border text-left transition-all
                ${active
                  ? "border-[#EA3335] bg-[#FFF5F5]"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"}`}
            >
              <span className="text-[22px]">{cause.icon}</span>
              <div>
                <p className="text-[14px] font-semibold text-[#383838]">{cause.label}</p>
                <p className="text-[12px] text-[#8C8C8C] mt-0.5">{cause.desc}</p>
                {cause.tag && (
                  <span className="inline-block mt-2 text-[11px] font-medium text-[#EA3335] border border-[#EA3335] rounded px-1.5 py-0.5">
                    {cause.tag}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}
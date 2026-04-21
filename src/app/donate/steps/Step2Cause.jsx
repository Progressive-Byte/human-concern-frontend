"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";

const CAUSES = [
  { value: "general", label: "General Donation", desc: "Contribute to the general fund", emoji: "🖤" },
  { value: "zakat",   label: "Zakat",            desc: "Obligatory charity for eligible Muslims", emoji: "💰", tag: "Zakat Eligible" },
  { value: "sadaqah", label: "Sadaqah",           desc: "Voluntary charity for any cause", emoji: "🤲" },
  { value: "global",  label: "Global Emergency",  desc: "Urgent humanitarian aid", emoji: "🚨" },
];

export default function Step2Cause() {
  const router = useRouter();
  const { data, update } = useDonation();

  const selected = CAUSES.filter((c) => data.causes?.includes(c.value));

  const toggle = (value) => {
    const current = data.causes ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ causes: next });
  };

  const handleNext = () => {
    update({ maxStep: Math.max(data.maxStep ?? 1, 3) });
    router.push("/donate/3");
  };

  return (
    <StepLayout
      step={2}
      title="Select Donation Type"
      subtitle="Choose the type of donation you'd like to make"
      onNext={handleNext}
      prevLabel="Personal Info"
      nextLabel="Objectives"
    >
      {/* Selected count */}
      <div className="flex justify-end mb-3">
        <span className="text-[12px] text-[#AEAEAE]">
          <span className="text-[#383838] font-semibold">{selected.length} Selected</span>
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
              <span className="text-[22px]">{cause.emoji}</span>
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
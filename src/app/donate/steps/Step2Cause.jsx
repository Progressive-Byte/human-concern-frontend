"use client";

import { useMemo } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";

const Step2Cause = () => {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();

  const causes = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      const campaignCauses = meta.causes ?? [];
      if (campaignCauses.length > 0) {
        return campaignCauses.map((c) => ({
          id:            c.id,
          label:         c.name,
          desc:          c.description  ?? "",
          emoji:         c.iconEmoji    ?? "",
          zakatEligible: c.zakatEligible ?? false,
        }));
      }
    } catch {}
    return [];
  }, []);

  const selectedIds = data.causeIds ?? [];

  const toggle = (cause) => {
    const isSelected = selectedIds.includes(cause.id);
    const nextIds = isSelected
      ? selectedIds.filter((id) => id !== cause.id)
      : [...selectedIds, cause.id];

    const currentLabels = data.causes ?? [];
    const nextLabels = isSelected
      ? currentLabels.filter((l) => l !== cause.label)
      : [...currentLabels, cause.label];

    update({ causeIds: nextIds, causes: nextLabels });
  };

  return (
    <StepLayout
      step={2}
      title="Select Donation Type"
      subtitle="Choose the type of donation you'd like to make"
      onNext={() => handleNext(data.isRamadan ? 3 : 4)}
      prevLabel="Personal Info"
      nextLabel={data.isRamadan ? "Objectives" : "Payment"}
    >
      <div className="flex justify-end mb-3">
        <span className="text-[14px] text-[#8C8C8C]">
          <span className="text-[#000000] font-normal">{selectedIds.length} Selected</span>
          {" "}Out of {causes.length}
        </span>
      </div>

      {causes.length === 0 ? (
        <p className="text-[14px] text-[#8C8C8C] text-center py-8">
          No causes available for this campaign.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {causes.map((cause) => {
            const active = selectedIds.includes(cause.id);
            return (
              <button
                key={cause.id}
                onClick={() => toggle(cause)}
                className={`flex flex-col items-start gap-2 rounded-xl p-4 border text-left transition-all cursor-pointer ${
                  active
                    ? "border-[#EA3335] bg-[#FFF5F5]"
                    : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"
                }`}
              >
                {cause.emoji && (
                  <span className="text-[32px] leading-none">{cause.emoji}</span>
                )}
                <div>
                  <p className="text-[14px] font-semibold text-[#383838]">{cause.label}</p>
                  {cause.desc && (
                    <p className="text-[12px] text-[#8C8C8C] mt-0.5">{cause.desc}</p>
                  )}
                  {cause.zakatEligible && (
                    <span className="inline-block mt-2 text-[11px] font-medium text-[#8C8C8C] bg-white rounded-full px-1.5 py-0.5">
                      Zakat Eligible
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </StepLayout>
  );
};

export default Step2Cause;

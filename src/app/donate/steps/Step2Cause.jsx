"use client";

import { useMemo } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import Image from "next/image";

// Icon and description keyed by cause name (case-insensitive lookup below)
const CAUSE_META_BY_NAME = {
  "general donation": { icon: "/images/general-donation.png", desc: "Contribute to the general fund" },
  "zakat":            { icon: "/images/zakat.png",            desc: "Obligatory charity for eligible Muslims" },
  "sadaqah":          { icon: "/images/sadaqah.png",          desc: "Voluntary charity for any cause" },
  "global emergency": { icon: "/images/emergency-fund.png",   desc: "Urgent humanitarian aid" },
};

// Hardcoded fallback (no IDs — used only when the campaign has no cause data)
const FALLBACK_CAUSES = [
  { id: null, label: "General Donation", desc: "Contribute to the general fund",            icon: "/images/general-donation.png" },
  { id: null, label: "Zakat",            desc: "Obligatory charity for eligible Muslims",   icon: "/images/zakat.png",            zakatEligible: true },
  { id: null, label: "Sadaqah",          desc: "Voluntary charity for any cause",           icon: "/images/sadaqah.png" },
  { id: null, label: "Global Emergency", desc: "Urgent humanitarian aid",                   icon: "/images/emergency-fund.png" },
];

const Step2Cause = () => {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();

  const causes = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      const campaignCauses = meta.causes ?? [];
      if (campaignCauses.length > 0) {
        return campaignCauses.map((c) => {
          const extra = CAUSE_META_BY_NAME[c.name?.toLowerCase()] ?? {};
          return {
            id:           c.id,
            label:        c.name,
            desc:         extra.desc ?? "",
            icon:         extra.icon ?? null,
            zakatEligible: c.zakatEligible ?? false,
          };
        });
      }
    } catch {}
    return FALLBACK_CAUSES;
  }, []);

  const selectedIds = data.causeIds ?? [];

  const toggle = (cause) => {
    const isSelected = selectedIds.includes(cause.id);
    const nextIds = isSelected
      ? selectedIds.filter((id) => id !== cause.id)
      : [...selectedIds, cause.id];

    // Keep a parallel display-only list for the summary step
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

      <div className="grid grid-cols-2 gap-3">
        {causes.map((cause) => {
          const active = selectedIds.includes(cause.id);
          return (
            <button
              key={cause.id ?? cause.label}
              onClick={() => toggle(cause)}
              className={`flex flex-col items-start gap-2 rounded-xl p-4 border text-left transition-all cursor-pointer
                ${active
                  ? "border-[#EA3335] bg-[#FFF5F5]"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"}`}
            >
              {cause.icon && (
                <div className="w-10 h-10 relative">
                  <Image src={cause.icon} alt={cause.label} fill className="object-contain" />
                </div>
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
    </StepLayout>
  );
};

export default Step2Cause;

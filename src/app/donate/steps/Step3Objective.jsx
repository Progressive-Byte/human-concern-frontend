"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";

const Step3Objectives = () => {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();
  const router = useRouter();

  useEffect(() => {
    if (!data.isRamadan) router.replace("/donate/4");
  }, [data.isRamadan, router]);

  const objectives = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      const apiObjectives = meta.donationObjectives ?? [];
      if (apiObjectives.length > 0) {
        return apiObjectives.map((obj) => ({
          id:    obj.id,
          label: obj.name ?? obj.label ?? "",
          desc:  obj.description ?? obj.desc ?? "",
        }));
      }
    } catch {}
    return [];
  }, []);

  if (!data.isRamadan) return null;

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
        {objectives.map((obj) => {
          const active = data.objective === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => update({ objective: obj.id, objectiveLabel: obj.label })}
              className={`w-full flex flex-col items-start rounded-3xl px-5 py-4 border text-left transition-all cursor-pointer
                ${active
                  ? "border-[#EA3335] bg-white"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] bg-white"}`}
            >
              <p className="text-[14px] font-semibold text-[#383838]">{obj.label}</p>
              <p className="text-[12px] text-[#8C8C8C] mt-0.5">{obj.desc}</p>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}

export default Step3Objectives;

"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";

const OPTIONS = [
  { value: "one-time", label: "One-Time", desc: "Single donation, no recurring charge" },
  { value: "monthly", label: "Monthly", desc: "Automatically renewed every month" },
  { value: "annually", label: "Annually", desc: "Automatically renewed every year" },
];

export default function Step2Frequency() {
  const router = useRouter();
  const { data, update } = useDonation();

  return (
    <StepLayout step={2} title="Donation Frequency" onNext={() => { update({ maxStep: Math.max(data.maxStep ?? 1, 3) }); router.push("/donate/3"); }}>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const active = data.frequency === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => update({ frequency: opt.value })}
              className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 border text-left transition-all
                ${active ? "bg-[#F0FDF4] border-[#055A46]" : "border-[#E5E5E5] hover:border-[#055A46] hover:bg-[#F7FFED]"}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                ${active ? "border-[#055A46]" : "border-[#CCCCCC]"}`}>
                {active && <div className="w-2.5 h-2.5 rounded-full bg-[#055A46]" />}
              </div>
              <div>
                <p className={`font-semibold text-[15px] ${active ? "text-[#055A46]" : "text-[#383838]"}`}>
                  {opt.label}
                </p>
                <p className="text-[13px] text-[#737373] mt-0.5">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}

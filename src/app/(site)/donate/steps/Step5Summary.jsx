"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";

export default function Step4Contact() {
  const router = useRouter();
  const { data, update } = useDonation();
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!data.phone.trim() || !data.country.trim()) {
      setError("All fields are required.");
      return;
    }
    update({ maxStep: Math.max(data.maxStep ?? 1, 5) });
    router.push("/donate/5");
  };

  return (
    <StepLayout step={5} title="Contact Details" onNext={handleNext}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">Phone Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => { update({ phone: e.target.value }); setError(""); }}
            placeholder="+1 234 567 8900"
            className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46] transition-colors"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">Country</label>
          <input
            value={data.country}
            onChange={(e) => { update({ country: e.target.value }); setError(""); }}
            placeholder="United States"
            className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46] transition-colors"
          />
        </div>
        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}
      </div>
    </StepLayout>
  );
}

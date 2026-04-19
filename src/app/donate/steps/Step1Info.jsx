"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";

export default function Step3PersonalInfo() {
  const router = useRouter();
  const { data, update } = useDonation();
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setError("Enter a valid email address.");
      return;
    }
    update({ maxStep: Math.max(data.maxStep ?? 1, 2) });
    router.push("/donate/2");
  };

  const field = (label, key, props = {}) => (
    <div>
      <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">{label}</label>
      <input
        value={data[key]}
        onChange={(e) => { update({ [key]: e.target.value }); setError(""); }}
        className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46] transition-colors"
        {...props}
      />
    </div>
  );

  return (
    <StepLayout step={1} title="Personal Information" onNext={handleNext}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {field("First Name", "firstName", { placeholder: "John" })}
          {field("Last Name", "lastName", { placeholder: "Doe" })}
        </div>
        {field("Email Address", "email", { placeholder: "john@example.com", type: "email" })}
        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}
      </div>
    </StepLayout>
  );
}

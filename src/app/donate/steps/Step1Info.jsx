"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";
import Field from "@/components/ui/Field";

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

  return (
    <StepLayout step={1} title="Personal Information" onNext={handleNext}>
      <div className="flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First Name"
            value={data.firstName}
            onChange={(e) => {
              update({ firstName: e.target.value });
              setError("");
            }}
            placeholder="John"
          />

          <Field
            label="Last Name"
            value={data.lastName}
            onChange={(e) => {
              update({ lastName: e.target.value });
              setError("");
            }}
            placeholder="Doe"
          />
        </div>

        <Field
          label="Email Address"
          type="email"
          value={data.email}
          onChange={(e) => {
            update({ email: e.target.value });
            setError("");
          }}
          placeholder="john@example.com"
        />

        {error && (
          <p className="text-[#EA3335] text-[13px]">{error}</p>
        )}

      </div>
    </StepLayout>
  );
}
"use client";

import { useState } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";

function formatCardNumber(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function Step6CardDetails() {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();
  const [error, setError] = useState("");

  const onNext = () => {
    if (!data.cardName.trim() || !data.cardNumber.trim() || !data.cardExpiry.trim() || !data.cardCvv.trim()) {
      setError("All fields are required.");
      return;
    }
    handleNext(8);
  };

  return (
    <StepLayout step={7} title="Card Details" onNext={onNext}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">Cardholder Name</label>
          <input
            value={data.cardName}
            onChange={(e) => { update({ cardName: e.target.value }); setError(""); }}
            placeholder="John Doe"
            className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46] transition-colors"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">Card Number</label>
          <input
            value={data.cardNumber}
            onChange={(e) => { update({ cardNumber: formatCardNumber(e.target.value) }); setError(""); }}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] font-mono tracking-wider focus:outline-none focus:border-[#055A46] transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">Expiry</label>
            <input
              value={data.cardExpiry}
              onChange={(e) => { update({ cardExpiry: formatExpiry(e.target.value) }); setError(""); }}
              placeholder="MM/YY"
              inputMode="numeric"
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46] transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#383838] mb-1.5 block">CVV</label>
            <input
              type="password"
              value={data.cardCvv}
              onChange={(e) => { update({ cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) }); setError(""); }}
              placeholder="•••"
              inputMode="numeric"
              className="w-full border border-[#CCCCCC] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46] transition-colors"
            />
          </div>
        </div>
        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}
      </div>
    </StepLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";
import CustomDropdown from "@/components/common/CustomDropdown";

const CURRENCY_OPTIONS = [
  { label: "$ USD", value: "USD" },
  { label: "£ GBP", value: "GBP" },
  { label: "€ EUR", value: "EUR" },
  { label: "CA$ CAD", value: "CAD" },
];

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };
const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export default function Step1Amount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, update } = useDonation();
  const [customActive, setCustomActive] = useState(false);

  useEffect(() => {
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const campaignId = searchParams.get("campaignId");
    if (amount || currency || campaignId) {
      update({
        ...(amount && { amount: Number(amount) }),
        ...(currency && { currency }),
        ...(campaignId && { campaignId: Number(campaignId) }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [customValue, setCustomValue] = useState("");
  const [error, setError] = useState("");

  const sym = CURRENCY_SYMBOLS[data.currency] || "$";

  const handlePreset = (amt) => {
    setCustomActive(false);
    setCustomValue("");
    update({ amount: amt });
    setError("");
  };

  const handleNext = () => {
    const finalAmount = customActive ? Number(customValue) : data.amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setError("Please select or enter a valid amount.");
      return;
    }
    update({ amount: finalAmount, maxStep: Math.max(data.maxStep ?? 1, 2) });
    router.push("/donate/2");
  };

  return (
    <StepLayout step={3} title="Select Donation Amount" onNext={handleNext}>
      <div className="mb-5">
        <label className="text-[13px] font-medium text-[#383838] mb-2 block">Currency</label>
        <CustomDropdown
          options={CURRENCY_OPTIONS}
          value={data.currency}
          onChange={(v) => update({ currency: v })}
          width="w-full"
          className="w-full rounded-xl border border-[#CCCCCC] bg-white px-3 py-2.5 justify-between"
        />
      </div>

      <label className="text-[13px] font-medium text-[#383838] mb-3 block">Select Amount</label>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {PRESET_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => handlePreset(amt)}
            className={`py-3 rounded-xl border font-semibold text-[15px] transition-all
              ${data.amount === amt && !customActive
                ? "bg-[#F0FDF4] border-[#055A46] text-[#055A46]"
                : "border-[#E5E5E5] text-[#383838] hover:border-[#055A46] hover:bg-[#F7FFED]"}`}
          >
            {sym}{amt}
          </button>
        ))}
        <button
          onClick={() => { setCustomActive(true); update({ amount: "" }); setError(""); }}
          className={`py-3 rounded-xl border font-semibold text-[15px] transition-all
            ${customActive
              ? "bg-[#F0FDF4] border-[#055A46] text-[#055A46]"
              : "border-[#E5E5E5] text-[#383838] hover:border-[#055A46] hover:bg-[#F7FFED]"}`}
        >
          Other
        </button>
      </div>

      {customActive && (
        <div className="mb-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] font-medium">{sym}</span>
            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={customValue}
              onChange={(e) => { setCustomValue(e.target.value); setError(""); }}
              className="w-full border border-[#CCCCCC] rounded-xl pl-8 pr-4 py-3 text-[15px] focus:outline-none focus:border-[#055A46]"
              autoFocus
            />
          </div>
        </div>
      )}

      {error && <p className="text-[#EA3335] text-[13px] mt-1">{error}</p>}

      {(data.amount || (customActive && customValue)) && (
        <div className="mt-5 bg-[#F0FDF4] rounded-xl px-4 py-3">
          <p className="text-[13px] text-[#055A46] font-medium text-center">
            Donating {sym}{customActive ? customValue : data.amount}
          </p>
        </div>
      )}
    </StepLayout>
  );
}

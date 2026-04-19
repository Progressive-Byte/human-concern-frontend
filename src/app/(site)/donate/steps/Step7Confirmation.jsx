"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../DonateComponents/StepLayout";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const FREQUENCY_LABELS = {
  "one-time": "One-Time",
  monthly: "Monthly",
  annually: "Annually",
};

export default function Step7Review() {
  const router = useRouter();
  const { data } = useDonation();
  const sym = CURRENCY_SYMBOLS[data.currency] || "$";

  const rows = [
    { label: "Amount", value: `${sym}${data.amount} (${FREQUENCY_LABELS[data.frequency]})` },
    { label: "Name", value: `${data.firstName} ${data.lastName}` },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    { label: "Country", value: data.country },
    {
      label: "Payment",
      value:
        data.paymentMethod === "card"
          ? `Card ending ···· ${data.cardNumber?.replace(/\s/g, "").slice(-4) || "—"}`
          : data.paymentMethod === "bank"
          ? "Bank Transfer"
          : "PayPal",
    },
  ];

  const handleConfirm = () => {
    // API call goes here in the future
    router.push("/donate/thank-you");
  };

  return (
    <StepLayout step={7} title="Review & Confirm" onNext={handleConfirm} nextLabel="Complete Donation">
      <div className="divide-y divide-[#F0F0F0]">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between items-center py-3.5">
            <span className="text-[13px] text-[#737373]">{r.label}</span>
            <span className="text-[14px] font-medium text-[#383838] text-right max-w-[60%] truncate">
              {r.value || "—"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-[#F0FDF4] border border-[#D1FAE5] rounded-xl px-4 py-3 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#055A46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-[12px] text-[#055A46] font-medium">Secure & encrypted payment</p>
      </div>
    </StepLayout>
  );
}

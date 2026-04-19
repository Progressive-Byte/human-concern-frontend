"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepLayout from "../components/StepLayout";

const METHODS = [
  {
    value: "card",
    label: "Credit / Debit Card",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    value: "bank",
    label: "Bank Transfer",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    ),
  },
  {
    value: "paypal",
    label: "PayPal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11l1-8h6a4 4 0 0 1 4 4c0 3-2 5-5 5H9" />
        <path d="M6 16l-1 6h5a4 4 0 0 0 4-4c0-2-1-3-3-3H7" />
      </svg>
    ),
  },
];

export default function Step5Payment() {
  const router = useRouter();
  const { data, update } = useDonation();

  return (
    <StepLayout step={5} title="Payment Method" onNext={() => { update({ maxStep: Math.max(data.maxStep ?? 1, 6) }); router.push("/donate/6"); }}>
      <div className="flex flex-col gap-3">
        {METHODS.map((m) => {
          const active = data.paymentMethod === m.value;
          return (
            <button
              key={m.value}
              onClick={() => update({ paymentMethod: m.value })}
              className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 border text-left transition-all
                ${active ? "bg-[#F0FDF4] border-[#055A46]" : "border-[#E5E5E5] hover:border-[#055A46] hover:bg-[#F7FFED]"}`}
            >
              <span className={active ? "text-[#055A46]" : "text-[#737373]"}>{m.icon}</span>
              <span className={`font-semibold text-[15px] ${active ? "text-[#055A46]" : "text-[#383838]"}`}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}

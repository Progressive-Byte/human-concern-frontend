"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

export default function ThankYouPage() {
  const router = useRouter();
  const { data } = useDonation();
  const sym = CURRENCY_SYMBOLS[data.currency] || "$";

  return (
    <main className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4 py-20">
      <div className="max-w-[480px] w-full bg-white rounded-2xl border border-[#EBEBEB] p-8 text-center">
        <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#055A46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-[28px] font-bold text-[#383838] mb-2">Thank You!</h1>
        <p className="text-[#737373] text-[15px] leading-relaxed mb-6">
          Your{" "}
          {data.amount ? (
            <span className="font-bold text-[#055A46]">{sym}{data.amount}</span>
          ) : "donation"}{" "}
          donation has been received. You are making a real difference.
        </p>

        {data.email && (
          <div className="bg-[#F9F9F9] rounded-xl px-4 py-3 mb-8 text-left">
            <p className="text-[12px] text-[#AEAEAE] mb-0.5">Confirmation sent to</p>
            <p className="text-[14px] font-medium text-[#383838]">{data.email}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white font-semibold transition-colors active:scale-95"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/campaigns")}
            className="w-full py-3 rounded-xl border border-[#E5E5E5] text-[#383838] font-medium hover:border-gray-400 transition-colors"
          >
            Explore More Campaigns
          </button>
        </div>
      </div>
    </main>
  );
}

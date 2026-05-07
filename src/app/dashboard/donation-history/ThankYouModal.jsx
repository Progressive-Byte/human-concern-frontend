"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThankyouIcon, ShareCampaignIcon, CircleCheckIcon } from "@/components/common/SvgIcon";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

export default function ThankYouModal({ thankyouData, onClose }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const sym            = CURRENCY_SYMBOLS[thankyouData?.currency] || "$";
  const donationAmount = thankyouData?.donationAmount;
  const isRecurring    = thankyouData?.isRecurring;

  const handleShare = async () => {
    const url   = window.location.origin + "/campaigns";
    const title = thankyouData?.campaignTitle || "Human Concern";
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[460px] bg-white rounded-[24px] px-6 sm:px-10 py-8 flex flex-col items-center text-center shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[#737373] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mt-2">{ThankyouIcon}</div>

        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#383838] mt-5">Thank You!</h1>

        <p className="text-[13px] text-[#737373] mt-2 mb-5">
          Your donation of{" "}
          {donationAmount ? (
            <span className="font-bold text-[#383838]">
              {sym}{Number(donationAmount).toFixed(2)}
            </span>
          ) : "your generous amount"}{" "}
          has been processed successfully.
        </p>

        {/* Donation details */}
        <div className="w-full bg-[#F6F6F6] rounded-xl px-4 py-4 mb-5 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-3">
            Donation Details
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#737373]">Project</span>
              <span className="text-[13px] font-semibold text-[#383838]">
                {thankyouData.isRamadan ? "Ramadan Project" : (thankyouData.campaignTitle || "—")}
              </span>
            </div>

            {(thankyouData.causes ?? []).length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#737373]">Cause</span>
                <span className="text-[13px] font-semibold text-[#383838]">
                  {thankyouData.causes.join(", ")}
                </span>
              </div>
            )}

            {isRecurring && thankyouData.frequency && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#737373]">Frequency</span>
                <span className="text-[13px] font-semibold text-[#383838]">{thankyouData.frequency}</span>
              </div>
            )}

            {isRecurring && thankyouData.numberOfDays > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#737373]">Duration</span>
                <span className="text-[13px] font-semibold text-[#383838]">{thankyouData.numberOfDays} days</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] mt-1">
              <span className="text-[12px] text-[#737373]">Total</span>
              <span className="text-[14px] font-bold text-[#055A46]">
                {sym}{donationAmount ? Number(donationAmount).toFixed(2) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            View Dashboard
          </button>

          <button
            onClick={() => { onClose(); router.push("/campaigns"); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Browse Campaigns
          </button>

          <button
            onClick={handleShare}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[14px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
              copied
                ? "bg-[#055A46] border-[#055A46] text-white"
                : "border-[#E5E5E5] hover:border-[#AEAEAE] text-[#383838]"
            }`}
          >
            {copied ? (
              <>{CircleCheckIcon} Link Copied!</>
            ) : (
              <>{ShareCampaignIcon} Share Campaign</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

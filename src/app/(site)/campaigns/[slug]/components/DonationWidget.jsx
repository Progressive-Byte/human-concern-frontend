"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/components/common/CustomDropdown";
import { CircleCheckIcon, ShareCampaignIcon } from "@/components/common/SvgIcon";

const CURRENCY_OPTIONS = [
  { label: "$ USD", value: "USD" },
  { label: "£ GBP", value: "GBP" },
  { label: "€ EUR", value: "EUR" },
  { label: "CA$ CAD", value: "CAD" },
];

const DonationWidget = ({ campaign }) => {
  const router = useRouter();

  const suggestedAmounts = campaign.suggestedAmounts ?? [];
  const limits           = campaign.goalsDates        ?? {};

  const raised      = campaign.raised ?? 0;
  const goal        = campaign.goal   ?? 0;
  const pct         = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const hasProgress = campaign.raised != null && goal > 0;

  const [selectedAmount, setSelectedAmount] = useState(suggestedAmounts[1] ?? suggestedAmounts[0] ?? 50);
  const [customAmount,   setCustomAmount]   = useState("");
  const [currency,       setCurrency]       = useState(campaign.currency ?? "USD");

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleDonate = () => {
    const isRamadan = Array.isArray(campaign.categories) &&
      campaign.categories.some((c) => c.toLowerCase() === "ramadan");
    // const isRamadan = true; // For testing purposes.
    sessionStorage.setItem("donationIsRamadan", isRamadan ? "1" : "0");
    sessionStorage.setItem("campaignData", JSON.stringify({
      id:               campaign.id,
      name:             campaign.name             ?? "",
      description:      campaign.description      ?? "",
      suggestedAmounts: campaign.suggestedAmounts ?? [],
      addOns:           campaign.addOns           ?? [],
      goalsDates:       campaign.goalsDates        ?? {},
      causes:           campaign.causes           ?? [],
    }));

    const params = new URLSearchParams({
      campaign: campaign.slug,
      amount:       String(finalAmount),
      currency,
    });
    router.push(`/donate/1?${params}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: campaign.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col gap-[25px]">

      {/* ── Card 1: Progress + CTA ── */}
      <div className="rounded-2xl border border-dashed border-[#BFBFBF]">
        <div className="px-5 pt-5">

          {/* Raised / Goal */}
          {hasProgress ? (
            <>
              <p className="text-[36px] font-bold text-[#383838] leading-none">
                ${raised.toLocaleString()}
              </p>
              <p className="text-[16px] text-[#383838] mt-4">
                raised of ${goal.toLocaleString()}
              </p>
              <div className="flex justify-end mt-1">
                <span className="text-[12px] font-semibold text-[#AEAEAE]">{pct}%</span>
              </div>
              <div className="relative h-[15px] bg-[#DDFFB4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#055A46] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-[22px] font-bold text-[#383838]">
                Goal: ${goal.toLocaleString()}
              </p>
              <p className="text-[13px] text-[#737373] mt-1">Fundraising in progress</p>
              <div className="relative h-[15px] bg-[#DDFFB4] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[#055A46] rounded-full" style={{ width: "0%" }} />
              </div>
            </>
          )}

          {/* Donors + Days Left */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
              <p className="text-[24px] font-bold text-[#383838]">
                {campaign.donors ?? 0}
              </p>
              <p className="text-[14px] font-normal text-[#383838] mt-0.5">Donors</p>
            </div>
            <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
              <p className="text-[24px] font-bold text-[#383838]">
                {campaign.daysLeft ?? 0}
              </p>
              <p className="text-[14px] font-normal text-[#383838] mt-0.5">Days Left</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 pt-5 pb-5 flex flex-col gap-2.5">
          <button
            onClick={handleDonate}
            className="w-full cursor-pointer bg-[#EA3335] hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[15px] transition-colors active:scale-95"
          >
            Donate Now
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-[#383838] font-medium py-3 rounded-xl text-[14px] transition-colors cursor-pointer"
          >
            {ShareCampaignIcon}
            Share Campaign
          </button>
        </div>

        {/* Zakat badge */}
        {campaign.zakatEligible && (
          <div className="mx-5 mb-5 flex items-start gap-2.5 bg-[#F7FFED] border border-[#38383833] rounded-2xl px-4 py-4">
            {CircleCheckIcon}
            <div>
              <p className="text-[14px] font-medium text-[#383838]">Zakat Eligible</p>
              <p className="text-[12px] text-[#383838] mt-0.5">
                This campaign is verified for Zakat contributions
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Choose Amount */}
      {suggestedAmounts.length > 0 && (
        <div className="bg-[#F9F9F9] rounded-2xl border border-dashed border-[#BFBFBF]">
          <div className="px-5 py-5">
            <p className="text-[20px] font-bold text-[#383838]">How Your Donation Helps</p>
            <div className="mt-5">
              <CustomDropdown
                options={CURRENCY_OPTIONS}
                value={currency}
                onChange={setCurrency}
                width="w-full"
                className="w-full rounded-2xl border border-[#CCCCCC] bg-white px-3 py-2.5 justify-between"
              />
            </div>

            {/* Suggested amount tiles */}
            <div className="flex flex-col gap-3 mt-4">
              {suggestedAmounts.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                    className={`w-full flex flex-col items-center justify-center text-center rounded-2xl px-4 py-6 border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[#F0FDF4] border-[#055A46] shadow-[0px_0px_8px_0px_#B3FF57]"
                        : "bg-white border-[#38383833] hover:border-[#055A4666] hover:bg-[#F7FFED]"
                    }`}
                  >
                    <span className={`text-[28px] font-bold leading-tight ${isSelected ? "text-[#055A46]" : "text-[#383838]"}`}>
                      ${amt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom amount input */}
            {/* <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#383838] font-semibold">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Other amount${limits.minimumDonation ? ` (min $${limits.minimumDonation})` : ""}`}
                min={limits.minimumDonation ?? 1}
                max={limits.maximumDonation ?? undefined}
                className={`w-full pl-8 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-colors ${
                  customAmount
                    ? "border-[#055A46] bg-[#F0FDF4] text-[#055A46]"
                    : "border-[#CCCCCC] bg-white text-[#383838]"
                } focus:border-[#055A46]`}
              />
            </div>

            {limits.allowRecurringDonations && (
              <p className="text-[12px] text-[#737373] mt-3 text-center">
                Recurring donations available at checkout
              </p>
            )} */}
          </div>
        </div>
      )}

    </div>
  );
}

export default DonationWidget;
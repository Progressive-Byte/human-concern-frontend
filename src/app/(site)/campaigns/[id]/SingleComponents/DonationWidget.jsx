"use client";

import { useState } from "react";
import { ArrowDownIcon, CircleCheckIcon, ShareCampaignIcon } from "@/components/common/SvgIcon";
import CustomDropdown from "@/components/common/CustomDropdown";

const CURRENCY_OPTIONS = [
  { label: "$ USD", value: "USD" },
  { label: "£ GBP", value: "GBP" },
  { label: "€ EUR", value: "EUR" },
  { label: "CA$ CAD", value: "CAD" },
];

const DonationWidget = ({ campaign }) => {
  const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
  const isZakat = campaign.tag.toLowerCase().includes("zakat");

  // Track selected tier and currency
  const [selectedTier, setSelectedTier] = useState(1); // default middle tier
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="flex flex-col gap-[25px]">

      {/* ── Top card — raised + donate ── */}
      <div className="rounded-2xl border border-dashed border-[#BFBFBF]">
        <div className="px-5 pt-5">
          <p className="text-[36px] font-bold text-[#383838] leading-none">
            ${campaign.raised.toLocaleString()}
          </p>
          <p className="text-[16px] text-[#383838] mt-4">
            raised of ${campaign.goal.toLocaleString()}
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

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
              <p className="text-[24px] font-bold text-[#383838]">{campaign.donors}</p>
              <p className="text-[14px] font-normal text-[#383838] mt-0.5">Donors</p>
            </div>
            <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
              <p className="text-[24px] font-bold text-[#383838]">{campaign.daysLeft}</p>
              <p className="text-[14px] font-normal text-[#383838] mt-0.5">Days Left</p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 flex flex-col gap-2.5">
          <button className="w-full bg-[#EA3335] hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[15px] transition-colors active:scale-95">
            Donate Now
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-[#383838] font-medium mt-6 py-3 rounded-xl text-[14px] transition-colors">
            {ShareCampaignIcon}
            Share Campaign
          </button>

          {isZakat && (
            <div className="flex items-start gap-2.5 bg-[#F7FFED] border border-[#38383833] rounded-2xl px-4 py-5 my-6">
              {CircleCheckIcon}
              <div>
                <p className="text-[14px] font-medium text-[#383838]">{campaign.tag}</p>
                <p className="text-[12px] font-normal text-[#383838] mt-0.5">
                  This campaign is verified for Zakat contributions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom card — how your donation helps ── */}
      <div className="bg-[#F9F9F9] rounded-2xl border border-dashed border-[#BFBFBF]">
        <div className="px-5 py-5">
          <p className="text-[20px] font-bold text-[#383838]">How Your Donation Helps</p>

          {/* Currency dropdown using CustomDropdown */}
          <div className="mt-5">
            <CustomDropdown
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={setCurrency}
              width="w-full"
              className="w-full rounded-2xl border border-[#CCCCCC] bg-white px-3 py-2.5 justify-between"
            />
          </div>

          {/* Tier cards */}
          <div className="flex flex-col gap-3 mt-4">
            {campaign.donationTiers.map((tier, i) => {
              const isSelected = selectedTier === i;
              return (
                <button
                  key={tier.amount}
                  onClick={() => setSelectedTier(i)}
                  className={`
                    w-full flex flex-col items-center justify-center text-center
                    rounded-2xl px-4 py-6 border transition-all duration-200
                    ${isSelected
                      ? "bg-[#F0FDF4] border-[#055A46]"
                      : "bg-white border-[#38383833] hover:border-[#055A4666] hover:bg-[#F7FFED]"
                    }
                  `}
                  style={isSelected ? {
                    boxShadow: "0px 0px 8px 0px #B3FF57",
                  } : {}}
                >
                  <span className={`text-[28px] font-bold leading-tight ${
                    isSelected ? "text-[#055A46]" : "text-[#383838]"
                  }`}>
                    ${tier.amount}
                  </span>
                  <span className={`text-[13px] mt-1 ${
                    isSelected ? "text-[#055A46]" : "text-[#737373]"
                  }`}>
                    {tier.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationWidget;
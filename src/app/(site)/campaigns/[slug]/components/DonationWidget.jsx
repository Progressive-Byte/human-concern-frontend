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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressCard({ raised, goal, donors }) {
  const hasProgress = raised != null && goal != null && goal > 0;
  const pct         = hasProgress ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="px-5 pt-5 pb-4">
      {hasProgress ? (
        <>
          <p className="text-[36px] font-bold text-[#383838] leading-none">
            ${raised.toLocaleString()}
          </p>
          <p className="text-[16px] text-[#383838] mt-3">
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
            Goal: ${goal?.toLocaleString() ?? "—"}
          </p>
          <p className="text-[13px] text-[#737373] mt-1">Fundraising in progress</p>
        </>
      )}

      {donors != null && (
        <div className="grid grid-cols-1 mt-4">
          <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
            <p className="text-[24px] font-bold text-[#383838]">{donors.toLocaleString()}</p>
            <p className="text-[14px] text-[#383838] mt-0.5">Donors</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AmountSelector({ amounts, selected, custom, onSelect, onCustomChange, min, max, currency }) {
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="grid grid-cols-3 gap-2">
        {amounts.map((amt) => {
          const isSelected = selected === amt && !custom;
          return (
            <button
              key={amt}
              onClick={() => onSelect(amt)}
              className={`rounded-2xl px-4 py-4 border text-center transition-all duration-200 ${
                isSelected
                  ? "bg-[#F0FDF4] border-[#055A46] shadow-[0px_0px_8px_0px_#B3FF57]"
                  : "bg-white border-[#38383833] hover:border-[#055A4666] hover:bg-[#F7FFED]"
              }`}
            >
              <span className={`text-[22px] font-bold ${isSelected ? "text-[#055A46]" : "text-[#383838]"}`}>
                ${amt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom amount */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#383838] font-semibold">$</span>
        <input
          type="number"
          value={custom}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={`Other amount${min ? ` (min $${min})` : ""}`}
          min={min ?? 1}
          max={max ?? undefined}
          className={`w-full pl-8 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-colors ${
            custom
              ? "border-[#055A46] bg-[#F0FDF4] text-[#055A46]"
              : "border-[#CCCCCC] bg-white text-[#383838]"
          } focus:border-[#055A46]`}
        />
      </div>
    </div>
  );
}

// ─── AddOn card ───────────────────────────────────────────────────────────────

function AddOnCard({ addOn, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 rounded-2xl px-4 py-4 border text-left transition-all duration-200 ${
        selected
          ? "bg-[#F0FDF4] border-[#055A46] shadow-[0px_0px_8px_0px_#B3FF57]"
          : "bg-white border-[#38383833] hover:border-[#055A4666] hover:bg-[#F7FFED]"
      }`}
    >
      {addOn.iconEmoji && (
        <span className="text-2xl flex-shrink-0">{addOn.iconEmoji}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold ${selected ? "text-[#055A46]" : "text-[#383838]"}`}>
          {addOn.name}
        </p>
        {addOn.shortDescription && (
          <p className="text-[12px] text-[#737373] mt-0.5">{addOn.shortDescription}</p>
        )}
        <p className={`text-[13px] font-medium mt-1 ${selected ? "text-[#055A46]" : "text-[#383838]"}`}>
          ${addOn.amount} {addOn.amountFieldLabel && `· ${addOn.amountFieldLabel}`}
        </p>
      </div>
    </button>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function DonationWidget({ campaign }) {
  const router = useRouter();

  const suggestedAmounts = campaign.suggestedAmounts ?? [];
  const addOns           = campaign.addOns           ?? [];
  const limits           = campaign.goalsDates        ?? {};

  const [selectedAmount, setSelectedAmount] = useState(suggestedAmounts[1] ?? suggestedAmounts[0] ?? 50);
  const [customAmount,   setCustomAmount]   = useState("");
  const [currency,       setCurrency]       = useState(campaign.currency ?? "USD");
  const [selectedAddOn,  setSelectedAddOn]  = useState(null);

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleSelectPreset = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleDonate = () => {
    const params = new URLSearchParams({
      campaignId: campaign.id,
      amount:     String(finalAmount),
      currency,
    });
    if (selectedAddOn) params.set("addOnId", selectedAddOn);
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
    <div className="flex flex-col gap-5">

      {/* ── Progress + stats card ── */}
      <div className="rounded-2xl border border-dashed border-[#BFBFBF]">
        <ProgressCard raised={campaign.raised} goal={campaign.goal} donors={campaign.donors} />

        <div className="px-5 pb-5 flex flex-col gap-3">
          <button
            onClick={handleDonate}
            className="w-full cursor-pointer bg-[#EA3335] hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[15px] transition-colors active:scale-95"
          >
            Donate Now
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-[#383838] font-medium py-3 rounded-xl text-[14px] transition-colors"
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

      {/* ── Donation amount card ── */}
      {suggestedAmounts.length > 0 && (
        <div className="bg-[#F9F9F9] rounded-2xl border border-dashed border-[#BFBFBF] px-5 py-5">
          <p className="text-[20px] font-bold text-[#383838]">Choose an Amount</p>

          {/* Currency selector */}
          <div className="mt-4">
            <CustomDropdown
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={setCurrency}
              width="w-full"
              className="w-full rounded-2xl border border-[#CCCCCC] bg-white px-3 py-2.5 justify-between"
            />
          </div>

          <AmountSelector
            amounts={suggestedAmounts}
            selected={selectedAmount}
            custom={customAmount}
            onSelect={handleSelectPreset}
            onCustomChange={setCustomAmount}
            min={limits.minimumDonation}
            max={limits.maximumDonation}
            currency={currency}
          />

          {limits.allowRecurringDonations && (
            <p className="text-[12px] text-[#737373] mt-3 text-center">
              Recurring donations available at checkout
            </p>
          )}
        </div>
      )}

      {/* ── Add-ons card ── */}
      {addOns.length > 0 && (
        <div className="bg-[#F9F9F9] rounded-2xl border border-dashed border-[#BFBFBF] px-5 py-5">
          <p className="text-[20px] font-bold text-[#383838] mb-1">Add-ons</p>
          <p className="text-[13px] text-[#737373] mb-4">Select an optional add-on with your donation</p>
          <div className="flex flex-col gap-3">
            {addOns.map((addOn) => (
              <AddOnCard
                key={addOn.id}
                addOn={addOn}
                selected={selectedAddOn === addOn.id}
                onClick={() => setSelectedAddOn(selectedAddOn === addOn.id ? null : addOn.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

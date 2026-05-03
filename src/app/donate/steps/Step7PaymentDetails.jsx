"use client";

import { useState, useMemo } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const CAUSE_LABELS = {
  general: "General Donation",
  zakat:   "Zakat",
  sadaqah: "Sadaqah",
  global:  "Global Emergency",
};

const OBJECTIVE_LABELS = {
  "all-30":     "All 30 Nights Donation",
  "odd-nights": "Odd Nights Donation",
  "27th-night": "27th Night Donation",
  "last-10":    "Last 10 Nights",
};


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Step7PaymentDetails() {
  const { data, update }  = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();
  const [anonymous, setAnonymous] = useState(data.anonymous ?? false);

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignName   = campaignMeta.name ?? "";
  const currency       = data.currency       ?? "USD";
  const amountTier     = data.amountTier     ?? 0;
  const paymentType    = data.paymentType    ?? "one-time";
  const frequency      = data.frequency      ?? "Daily";
  const numberOfDays   = data.numberOfDays   ?? 30;
  const tipPct         = data.tipPct         ?? 0;
  const addOnBreakdown = data.addOnBreakdown ?? [];
  const isRecurring    = paymentType === "recurring";

  const sym          = CURRENCY_SYMBOLS[currency] ?? "$";
  const baseDonation = isRecurring ? amountTier * numberOfDays : amountTier;
  const tipAmount    = Math.round((baseDonation * tipPct) / 100 * 100) / 100;
  const grandTotal   = data.grandTotal ?? (baseDonation + tipAmount);

  const causeLabels = (data.causes ?? [])
    .map((c) => CAUSE_LABELS[c] ?? c)
    .join(", ");

  const onNext = () => {
    update({ anonymous });
    handleNext(8);
  };

  return (
    <StepLayout
      step={7}
      title="Confirm Your Donation"
      subtitle="Review your donation details"
      onNext={onNext}
      onPrev={() => handlePrev(6)}
      prevLabel="Payment Details"
      nextLabel="Complete Donation"
      nextIcon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      }
    >
      <div className="flex flex-col gap-5">

        {/* ── Summary table ── */}
        <div className="border border-[#E5E5E5] rounded-2xl bg-white overflow-hidden px-4">

          {/* Campaign name */}
          {campaignName && (
            <Row label="Campaign" value={campaignName} />
          )}

          {/* Cause */}
          {causeLabels && (
            <Row label="Cause" value={causeLabels} />
          )}

          {/* Objective */}
          {data.isRamadan && data.objective && (
            <Row label="Objective" value={OBJECTIVE_LABELS[data.objective] ?? data.objective} />
          )}

          {/* Currency */}
          <Row label="Currency" value={currency} />

          {/* Donation amount */}
          <Row
            label={isRecurring ? `Donation Amount (per ${frequency.toLowerCase()})` : "Donation Amount"}
            value={`${sym}${amountTier.toLocaleString()}`}
          />

          {/* Recurring rows */}
          {isRecurring && (
            <>
              <Row label="Frequency" value={frequency} />
              <Row
                label={`Split Amount (${numberOfDays} Days)`}
                value={`${sym}${baseDonation.toLocaleString()}.00`}
              />
            </>
          )}

          {/* Add-ons */}
          {addOnBreakdown.map((addon) => (
            <Row
              key={addon.id}
              label={`Addons (${addon.name})`}
              value={`${sym}${Number(addon.total).toFixed(0)}`}
            />
          ))}

          {/* Platform tip */}
          {tipAmount > 0 && (
            <Row
              label="Platform Tip (Custom)"
              value={`${sym}${tipAmount.toFixed(2)}`}
            />
          )}

          {/* Total — bold */}
          <Row
            label="Total"
            value={`${sym}${grandTotal.toFixed(2)}`}
            bold
          />
        </div>

        {/* Recurring warning */}
        {isRecurring && (
          <div className="flex items-start gap-2.5 px-1">
            <span className="text-[15px] shrink-0 mt-px">🚨</span>
            <p className="text-[13px] text-[#383838] leading-relaxed">
              For subscriptions or recurring donations, a temporary{" "}
              <span className="font-semibold">$1 authorization charge</span> will be placed on your
              card to verify it. This charge will be reversed within{" "}
              <span className="font-semibold">3-5 business days</span>.
            </p>
          </div>
        )}

        {/* Anonymous */}
        <button
          type="button"
          onClick={() => setAnonymous((v) => !v)}
          className="flex items-center gap-3 w-full text-left group"
        >
          <span
            className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
              anonymous ? "border-[#EA3335]" : "border-[#CCCCCC]"
            }`}
          >
            {anonymous && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />
            )}
          </span>
          <span className="text-[14px] text-[#383838]">Make my donation anonymous</span>
        </button>

      </div>
    </StepLayout>
  );
}
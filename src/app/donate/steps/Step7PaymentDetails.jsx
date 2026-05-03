"use client";

import { useState, useMemo } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { AnonymusCheckerIcon } from "@/components/common/SvgIcon";

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

function formatCardNumber(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function SummaryRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#F0F0F0] last:border-0">
      <span className="text-[13px] text-[#737373] shrink-0">{label}</span>
      <span className={`text-[13px] font-medium text-[#383838] text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function Step7PaymentDetails() {
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();
  const [error, setError]         = useState("");
  const [anonymous, setAnonymous] = useState(data.anonymous ?? false);

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignName        = campaignMeta.name        ?? "";
  const campaignDescription = campaignMeta.description ?? "";

  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 0;
  const paymentType  = data.paymentType  ?? "one-time";
  const frequency    = data.frequency    ?? "Daily";
  const numberOfDays = data.numberOfDays ?? 30;
  const tipPct       = data.tipPct       ?? 0;
  const addOnBreakdown = data.addOnBreakdown ?? [];
  const isRecurring  = paymentType === "recurring";

  const sym          = CURRENCY_SYMBOLS[currency] ?? "$";
  const baseDonation = isRecurring ? amountTier * numberOfDays : amountTier;
  const tipAmount    = Math.round((baseDonation * tipPct) / 100 * 100) / 100;
  const grandTotal   = data.grandTotal ?? (baseDonation + tipAmount);

  const causeLabels = (data.causes ?? [])
    .map((c) => CAUSE_LABELS[c] ?? c)
    .join(", ");

  const onNext = () => {
    if (!data.cardName.trim() || !data.cardNumber.trim() || !data.cardExpiry.trim() || !data.cardCvv.trim()) {
      setError("All fields are required.");
      return;
    }
    update({ anonymous });
    handleNext(8);
  };

  return (
    <StepLayout step={7} title="Payment Details" onNext={onNext}>
      <div className="flex flex-col gap-5">

        {/* ── Donation Summary ── */}
        <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white">
          <div className="px-4 py-3 bg-[#F9F9F9] border-b border-[#E5E5E5]">
            <p className="text-[13px] font-semibold text-[#383838]">Donation Summary</p>
          </div>
          {campaignName && (
            <div className="px-4 py-3 border-b border-[#F0F0F0]">
              <p className="text-[13px] font-semibold text-[#383838]">{campaignName}</p>
              {campaignDescription && (
                <p className="text-[12px] text-[#737373] mt-0.5 leading-relaxed">{campaignDescription}</p>
              )}
            </div>
          )}
          <div className="px-4 pt-1 pb-2">
            {causeLabels && (
              <SummaryRow label="Cause" value={causeLabels} />
            )}
            {data.isRamadan && data.objective && (
              <SummaryRow label="Objective" value={OBJECTIVE_LABELS[data.objective] ?? data.objective} />
            )}
            <SummaryRow label="Currency" value={currency} />
            <SummaryRow
              label={isRecurring ? `Donation Amount (per ${frequency.toLowerCase()})` : "Donation Amount"}
              value={`${sym}${amountTier.toLocaleString()}`}
            />
            {isRecurring && (
              <>
                <SummaryRow label="Frequency" value={frequency} />
                <SummaryRow
                  label={`Split Amount (${numberOfDays} Days)`}
                  value={`${sym}${baseDonation.toLocaleString()}`}
                />
              </>
            )}
            {addOnBreakdown.map((addon) => (
              <SummaryRow
                key={addon.id}
                label={addon.name}
                value={`${sym}${Number(addon.total).toFixed(2)}`}
              />
            ))}
            {tipAmount > 0 && (
              <SummaryRow
                label={`Platform Tip (${tipPct}%)`}
                value={`${sym}${tipAmount.toFixed(2)}`}
              />
            )}
          </div>
          <div className="px-4 py-3 bg-[#F9F9F9] border-t border-[#E5E5E5] flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#383838]">Grand Total</span>
            <span className="text-[20px] font-bold text-[#383838]">{sym}{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* ── Recurring warning ── */}
        {isRecurring && (
          <div className="flex items-start gap-3 rounded-2xl bg-[#FFF8E1] border border-[#FFD600]/40 px-4 py-3.5">
            <span className="text-[18px] leading-none mt-0.5">🚨</span>
            <p className="text-[12px] text-[#8C6F00] leading-relaxed">
              For subscriptions or recurring donations, a temporary{" "}
              <span className="font-semibold">$1 authorization charge</span> will be placed on your card
              to verify it. This charge will be reversed within{" "}
              <span className="font-semibold">3–5 business days</span>.
            </p>
          </div>
        )}

        {/* ── Anonymous checkbox ── */}
        <button
          type="button"
          onClick={() => setAnonymous((v) => !v)}
          className="flex items-center gap-3 w-full text-left"
        >
          <span className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
            anonymous ? "bg-[#055A46] border-[#055A46]" : "border-[#CCCCCC] bg-white"
          }`}>
            {anonymous && (
              AnonymusCheckerIcon
            )}
          </span>
          <span className="text-[14px] font-medium text-[#383838]">Make my donation anonymous</span>
        </button>

      </div>
    </StepLayout>
  );
}

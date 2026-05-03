"use client";

import { useState, useMemo, useEffect } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { apiRequest } from "@/services/api";
import StepLayout from "../DonateComponents/StepLayout";
import Row from "@/components/ui/Row";

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

const GATEWAY_LABELS = {
  stripe:       "Credit / Debit Card",
  paypal:       "PayPal",
  bank_transfer: "Bank Transfer",
};

const StripeIcon = () => (
  <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="22" rx="4" fill="#F0F0F0"/>
    <rect x="2" y="6" width="28" height="3" fill="#635BFF"/>
    <rect x="2" y="13" width="8" height="3" rx="1" fill="#CCCCCC"/>
    <rect x="12" y="13" width="6" height="3" rx="1" fill="#CCCCCC"/>
  </svg>
);

const PayPalIcon = () => (
  <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="22" rx="4" fill="#F0F0F0"/>
    <text x="6" y="15" fontSize="9" fontWeight="bold" fill="#003087">Pay</text>
    <text x="16" y="15" fontSize="9" fontWeight="bold" fill="#009CDE">Pal</text>
  </svg>
);

const BankIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 9h18M2 9l9-6 9 6M4 9v8M8 9v8M11 9v8M14 9v8M18 9v8M2 17h18" stroke="#737373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GATEWAY_ICONS = {
  stripe:        <StripeIcon />,
  paypal:        <PayPalIcon />,
  bank_transfer: <BankIcon />,
};

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Step7PaymentDetails = () => {
  const { data, update }  = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();
  const [anonymous, setAnonymous] = useState(data.anonymous ?? false);
  const [gateways, setGateways] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(data.paymentMethod ?? null);

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  useEffect(() => {
    apiRequest("payment/settings")
      .then((res) => {
        const raw = res?.data?.gateways ?? {};
        const available = Object.values(raw).filter((g) => g.enabled && g.configured);
        setGateways(available);
        if (!selectedGateway && available.length > 0) {
          setSelectedGateway(available[0].provider);
        }
      })
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    update({ anonymous, paymentMethod: selectedGateway });
    handleNext(8);
  };

  return (
    <StepLayout
      step={7}
      title="Confirm Your Donation"
      subtitle="Review your donation details"
      onNext={onNext}
      onPrev={() => handlePrev(6)}
      prevLabel="Summary"
      nextLabel="Complete Donation"
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-[#F5F5F580] overflow-hidden px-4">
          {campaignName && (
            <Row label="Campaign" value={campaignName} />
          )}
          {causeLabels && (
            <Row label="Cause" value={causeLabels} />
          )}
          {data.isRamadan && data.objective && (
            <Row label="Objective" value={OBJECTIVE_LABELS[data.objective] ?? data.objective} />
          )}
          <Row label="Currency" value={currency} />
          <Row
            label={isRecurring ? `Donation Amount (per ${frequency.toLowerCase()})` : "Donation Amount"}
            value={`${sym}${amountTier.toLocaleString()}`}
          />
          {isRecurring && (
            <>
              <Row label="Frequency" value={frequency} />
              <Row
                label={`Split Amount (${numberOfDays} Days)`}
                value={`${sym}${baseDonation.toLocaleString()}.00`}
              />
            </>
          )}
          {addOnBreakdown.map((addon) => (
            <Row
              key={addon.id}
              label={`Addons (${addon.name})`}
              value={`${sym}${Number(addon.total).toFixed(0)}`}
            />
          ))}
          {tipAmount > 0 && (
            <Row
              label="Platform Tip (Custom)"
              value={`${sym}${tipAmount.toFixed(2)}`}
            />
          )}
          <Row
            label="Total"
            value={`${sym}${grandTotal.toFixed(2)}`}
            bold
          />
        </div>

        {/* Payment Method */}
        <div className="flex flex-col gap-3">
          <p className="text-[14px] font-semibold text-[#383838]">Payment Method</p>
          {gatewaysLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-[60px] rounded-xl bg-[#F0F0F0] animate-pulse" />
              ))}
            </div>
          ) : gateways.length === 0 ? (
            <p className="text-[13px] text-[#8C8C8C]">No payment methods available.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {gateways.map((gateway) => {
                const isSelected = selectedGateway === gateway.provider;
                return (
                  <button
                    key={gateway.provider}
                    type="button"
                    onClick={() => setSelectedGateway(gateway.provider)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors text-left ${
                      isSelected
                        ? "border-[#055A46] bg-[#055A46]/5"
                        : "border-[#E5E5E5] bg-white"
                    }`}
                  >
                    <span className="shrink-0">{GATEWAY_ICONS[gateway.provider]}</span>
                    <span className="flex-1 text-[14px] font-medium text-[#383838]">
                      {GATEWAY_LABELS[gateway.provider] ?? gateway.provider}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        isSelected ? "border-[#055A46] bg-[#055A46]" : "border-[#CCCCCC]"
                      }`}
                    >
                      {isSelected && <CheckIcon />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
};

export default Step7PaymentDetails;

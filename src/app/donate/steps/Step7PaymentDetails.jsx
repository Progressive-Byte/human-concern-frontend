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
          <p className="text-[14px] font-semibold text-[#383838]">Other Payment Methods</p>

          {gatewaysLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-[80px] rounded-2xl bg-[#F0F0F0] animate-pulse" />
              ))}
            </div>
          ) : gateways.length === 0 ? (
            <p className="text-[13px] text-[#8C8C8C]">No payment methods available.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gateways
                .filter((g) => g.provider === "stripe" || g.provider === "paypal")
                .map((gateway) => {
                  const isSelected = selectedGateway === gateway.provider;
                  return (
                    <button
                      key={gateway.provider}
                      type="button"
                      onClick={() => setSelectedGateway(gateway.provider)}
                      className={`flex items-center justify-between px-5 py-5 rounded-2xl border transition-all duration-200 text-left ${
                        isSelected
                          ? "border-[#383838] bg-white shadow-sm"
                          : "border-[#E5E5E5] bg-white hover:border-[#AEAEAE]"
                      }`}
                    >
                      {/* Label */}
                      <span className="text-[14px] font-medium text-[#383838]">
                        {gateway.provider === "stripe" ? "Stripe" : "PayPal"}
                      </span>

                      {/* Logo */}
                      {gateway.provider === "stripe" ? (
                        /* Stripe wordmark SVG */
                        <svg width="40" height="28" viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M27.47 8.82c0-1.02.84-1.41 2.22-1.41 1.98 0 4.49.6 6.47 1.68V3.6C34.16 2.52 32.18 2 30.19 2c-4.49 0-7.47 2.34-7.47 6.24 0 6.1 8.4 5.12 8.4 7.74 0 1.2-.99 1.62-2.46 1.62-2.1 0-4.8-.9-6.9-2.1v5.52c2.34 1.02 4.68 1.44 6.9 1.44 5.16 0 8.34-2.58 8.34-6.54-.06-6.6-8.52-5.4-8.52-7.1zM17.35 4.98l-5.4 1.14-.02 12.06c0 2.28 1.68 3.84 3.96 3.84 1.26 0 2.16-.24 2.7-.54v-4.44c-.48.2-2.88.9-2.88-1.38V10.2h2.88V5.7l-1.24-.72zM9.66 7.44L4.32 8.58V22h5.34V7.44zM7 5.46C8.56 5.46 9.82 4.2 9.82 2.7S8.56 0 7 0 4.18 1.26 4.18 2.7s1.26 2.76 2.82 2.76zM44.96 7.2c-2.04 0-3.36.96-4.08 1.62l-.27-1.32H35.9V28l5.34-1.14.01-5.4c.75.54 1.86 1.32 3.66 1.32 3.72 0 7.08-2.94 7.08-9.36 0-5.94-3.42-9.22-7.03-9.22zm-1.23 14.28c-1.2 0-1.92-.42-2.4-.96l-.03-7.62c.51-.57 1.26-.99 2.43-.99 1.86 0 3.15 2.1 3.15 4.77 0 2.73-1.26 4.8-3.15 4.8zM58 7.56l-5.34 1.14V22H58V7.56z"
                            fill="#635BFF"
                          />
                        </svg>
                      ) : (
                        /* PayPal logo SVG */
                        <svg width="44" height="28" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M28.5 5.5H19.3c-.6 0-1.1.4-1.2 1L14.5 22c-.1.4.2.8.6.8h4.4c.6 0 1.1-.4 1.2-1l1-6.2c.1-.6.6-1 1.2-1h2.9c5.8 0 9.2-2.8 10.1-8.3.4-2.4 0-4.3-1.1-5.7-1.3-1.5-3.5-2.1-6.3-2.1z"
                            fill="#003087"
                          />
                          <path
                            d="M29.6 13.8c-.5 3.1-2.8 5.8-7.2 5.8h-1.8l-1.3 8c-.1.3.2.7.5.7h3.9c.5 0 .9-.4 1-.9l.8-5.4c.1-.5.5-.9 1-.9h1.2c4.2 0 6.8-2.1 7.5-6.2.3-1.9 0-3.5-.9-4.5-.4 1.3-.9 2.4-.7 3.4z"
                            fill="#009CDE"
                          />
                          <path
                            d="M19.5 13.2c.1-.3.3-.6.6-.8.1-.1.3-.1.5-.1h7.1c.8 0 1.6.1 2.2.2.2 0 .4.1.6.1.2.1.4.1.5.2.1 0 .1 0 .2.1.3.1.5.3.7.5.5-3.2-.1-5.3-1.6-7.3-1.7-2.1-4.8-3-8.7-3H11.5c-.6 0-1.1.4-1.2 1L6.7 22c-.1.4.2.8.6.8H12l2-12.8.5 3.2z"
                            fill="#012169"
                          />
                        </svg>
                      )}
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

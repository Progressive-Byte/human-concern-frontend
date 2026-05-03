"use client";

import { useState, useMemo, useEffect } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { apiRequest } from "@/services/api";
import StepLayout from "../DonateComponents/StepLayout";
import Row from "@/components/ui/Row";
import { StripeIcon, PayPalIcon, BankIcon } from "@/components/common/SvgIcon";

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
                      {gateway.provider === "stripe" ? StripeIcon : PayPalIcon}
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

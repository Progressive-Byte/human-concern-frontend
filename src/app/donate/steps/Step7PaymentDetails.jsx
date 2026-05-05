"use client";

import { useState, useMemo, useEffect } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { apiRequest } from "@/services/api";
import StepLayout from "../DonateComponents/StepLayout";
import Row from "@/components/ui/Row";
import Image from "next/image";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };


const Step7PaymentDetails = () => {
  const { data, update }  = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();
  const [anonymous, setAnonymous] = useState(data.anonymous ?? false);
  const [gateways, setGateways] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(
    ["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null
  );
  const [publishableKey, setPublishableKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
        const stripe = available.find((g) => g.provider === "stripe");
        if (stripe?.publishableKey) setPublishableKey(stripe.publishableKey);
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

  const causeLabels = (data.causes ?? []).join(", ");

  const buildSubmitBody = () => {
    const body = {
      ...(data.campaignId ? { formId: data.campaignId } : { formSlug: data.campaign }),
      info: {
        ...(data.organization && { organization: data.organization }),
        firstName:    data.firstName    ?? "",
        lastName:     data.lastName     ?? "",
        email:        data.email        ?? "",
        ...(data.phone && { phone: data.phone }),
        addressLine1: data.addressLine1 ?? "",
        city:         data.city        ?? "",
        postalCode:   data.zip         ?? "",
        state:        data.province    ?? "",
        streetName:   data.addressLine1 ?? "",
        country:      data.country     ?? "",
      },
      causeIds: data.causeIds ?? [],
      ...(data.isRamadan && data.objective && { objectiveId: data.objective }),
      paymentMethod: selectedGateway,
      ...(anonymous && { isAnonymous: true }),
      addons: {
        items: addOnBreakdown.map((addon) => ({
          addOnId: addon.id,
          values:  addon.values ?? {},
        })),
      },
    };

    if (isRecurring) {
      const startDate = new Date();
      const endDate   = new Date();
      endDate.setDate(endDate.getDate() + numberOfDays - 1);
      body.payment = {
        paymentMode:    "split",
        amount:         amountTier,
        currency,
        ...(tipPct > 0 && { platformTipPercent: tipPct }),
        scheduleType:   "date_range",
        scheduleConfig: {
          startDate: startDate.toISOString(),
          endDate:   endDate.toISOString(),
          frequency: frequency.toLowerCase(),
        },
      };
    } else {
      body.payment = {
        paymentMode: "one_time",
        amount:      amountTier,
        currency,
        ...(tipAmount > 0 && { platformTipAmount: tipAmount }),
      };
    }

    return body;
  };

  const onNext = async () => {

    if (submitting) return;

    if (!data.causeIds?.length) {
      setSubmitError("Please go back to Step Cause' and select at least one cause.");
      return;
    }

    update({ anonymous, paymentMethod: selectedGateway });
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await apiRequest("donations/submit", {
        method: "POST",
        body:   JSON.stringify(buildSubmitBody()),
      });

      const payment = res?.data?.payment ?? {};
      update({
        donationId:          res?.data?.donationId ?? null,
        stripeClientSecret:  payment.clientSecret  ?? null,
        stripePublishableKey: publishableKey,
      });

      handleNext(8);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message ?? "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <StepLayout
      step={7}
      title="Confirm Your Donation"
      subtitle="Review your donation details"
      onNext={onNext}
      onPrev={() => handlePrev(6)}
      prevLabel="Summary"
      nextLabel={submitting ? "Submitting…" : "Complete Donation"}
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
            <Row label="Objective" value={data.objectiveLabel ?? data.objective} />
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
        <div className="grid grid-cols-3 gap-3">
          {gateways
            .filter((g) => g.provider === "stripe" || g.provider === "paypal")
            .map((gateway) => {
              const isSelected = selectedGateway === gateway.provider;

              return (
                <button
                  key={gateway.provider}
                  type="button"
                  onClick={() => setSelectedGateway(gateway.provider)}
                  className={`flex items-center justify-between px-5 py-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                    isSelected
                      ? "border-[#383838] bg-white shadow-sm"
                      : "border-[#E5E5E5] bg-white hover:border-[#AEAEAE]"
                  }`}
                >
                  <span className="text-[14px] font-medium text-[#383838]">
                    {gateway.provider === "stripe" ? "Stripe" : "PayPal"}
                  </span>
                  <div className="relative w-[60px] h-[24px] shrink-0">
                    <Image
                      src={
                        gateway.provider === "stripe"
                          ? "/images/stripe.jpg"
                          : "/images/paypal.png"
                      }
                      alt={gateway.provider}
                      fill
                      className="object-contain"
                    />
                  </div>
                </button>
              );
            })}
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

        {submitError && (
          <p className="text-[13px] text-[#EA3335] bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-3">
            {submitError}
          </p>
        )}
      </div>
    </StepLayout>
  );
};

export default Step7PaymentDetails;

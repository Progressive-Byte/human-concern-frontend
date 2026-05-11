"use client";

import { useState, useMemo, useEffect } from "react";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import Stepper from "@/components/ui/Stepper";
import Toggle from "@/components/ui/Toggle";
import Image from "next/image";
import { apiRequest } from "@/services/api";

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

const TIP_PERCENTAGES = [0, 5, 10, 15];

function calcAddOnTotal(addOn, inputValues) {
  const { pricing, amount } = addOn;
  if (!pricing || pricing.type === "fixed") return amount ?? 0;
  if (pricing.type === "formula") {
    const base = pricing.baseUnitAmount ?? amount ?? 0;
    return (pricing.inputs ?? []).reduce(
      (acc, inp) => acc * (inputValues[inp.key] ?? inp.defaultValue ?? 1),
      base
    );
  }
  return amount ?? 0;
}

function buildFormulaLabel(addOn, inputValues, sym) {
  const { pricing } = addOn;
  if (!pricing?.formula || !pricing?.inputs) return null;
  const parts = (pricing.inputs ?? []).map((inp) => {
    const val = inputValues[inp.key] ?? inp.defaultValue ?? 1;
    return `${val} ${inp.label.toLowerCase()}`;
  });
  const base = pricing.baseUnitAmount ?? addOn.amount ?? 0;
  return `${parts.join(" × ")} × ${sym}${base}`;
}

const Step3Addons = () => {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignAddOns = campaignMeta.addOns            ?? [];
  const enableTipping  = campaignMeta.goalsDates?.enableTipping ?? true;

  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 0;
  const paymentType  = data.paymentType  ?? "one-time";
  const numberOfDays = data.numberOfDays ?? 30;
  const isRecurring  = paymentType === "recurring";

  const currencyData = CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const sym          = currencyData.symbol;
  const baseDonation = isRecurring ? amountTier * numberOfDays : amountTier;

  // ── Add-ons state ─────────────────────────────────────────────────────────
  const [addOnEnabled, setAddOnEnabled] = useState(() => {
    const breakdown = data.addOnBreakdown;
    if (!breakdown) return Object.fromEntries(campaignAddOns.map((a) => [a.id, true]));
    const enabledIds = new Set(breakdown.map((a) => a.id));
    return Object.fromEntries(campaignAddOns.map((a) => [a.id, enabledIds.has(a.id)]));
  });

  const [addOnInputs, setAddOnInputs] = useState(() => {
    const breakdown   = data.addOnBreakdown;
    const savedValues = breakdown
      ? Object.fromEntries(breakdown.map((a) => [a.id, a.values ?? {}]))
      : {};
    return Object.fromEntries(
      campaignAddOns.map((a) => [
        a.id,
        savedValues[a.id] ?? Object.fromEntries(
          (a.pricing?.inputs ?? []).map((inp) => [inp.key, inp.defaultValue ?? 1])
        ),
      ])
    );
  });

  const [tipPct, setTipPct] = useState(data.tipPct ?? 10);

  // ── Payment / gateway state ───────────────────────────────────────────────
  const [gateways, setGateways]               = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(
    ["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null
  );
  const [publishableKey, setPublishableKey] = useState(null);
  const [anonymous, setAnonymous]           = useState(data.anonymous ?? false);
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState(null);

  useEffect(() => {
    apiRequest("payment/settings")
      .then((res) => {
        const raw       = res?.data?.gateways ?? {};
        const available = Object.values(raw).filter((g) => g.enabled && g.configured);
        setGateways(available);
        if (!selectedGateway && available.length > 0) setSelectedGateway(available[0].provider);
        const stripe = available.find((g) => g.provider === "stripe");
        if (stripe?.publishableKey) setPublishableKey(stripe.publishableKey);
      })
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived totals ────────────────────────────────────────────────────────
  const addOnsTotal = campaignAddOns.reduce((sum, addOn) => {
    if (!addOnEnabled[addOn.id]) return sum;
    return sum + calcAddOnTotal(addOn, addOnInputs[addOn.id] ?? {});
  }, 0);

  const sliderMax  = 15;
  const tipAmount  = enableTipping ? Math.round((baseDonation * tipPct) / 100 * 100) / 100 : 0;
  const grandTotal = baseDonation + addOnsTotal + tipAmount;

  const updateAddOnInput = (addOnId, key, val) =>
    setAddOnInputs((prev) => ({ ...prev, [addOnId]: { ...prev[addOnId], [key]: val } }));

  const computedBreakdown = campaignAddOns
    .filter((a) => addOnEnabled[a.id])
    .map((a) => ({
      id:        a.id,
      name:      a.name,
      iconEmoji: a.iconEmoji ?? "",
      total:     calcAddOnTotal(a, addOnInputs[a.id] ?? {}),
      values:    addOnInputs[a.id] ?? {},
    }));

  // ── Submission ─────────────────────────────────────────────────────────────
  const buildSubmitBody = () => {
    const scheduleType   = data.scheduleType   ?? "date_range";
    const scheduleConfig = data.scheduleConfig ?? {};

    const body = {
      ...(data.campaignId ? { formId: data.campaignId } : { formSlug: data.campaign }),
      info: {
        ...(data.organization && { organization: data.organization }),
        firstName:    data.firstName    ?? "",
        lastName:     data.lastName     ?? "",
        email:        data.email        ?? "",
        ...(data.phone && { phone: data.phone }),
        addressLine1: data.addressLine1 ?? "",
        city:         data.city         ?? "",
        postalCode:   data.zip          ?? "",
        state:        data.province     ?? "",
        streetName:   data.addressLine1 ?? "",
        country:      data.country      ?? "",
      },
      causeIds: data.causeIds ?? [],
      ...(data.isRamadan && data.objective && { objectiveId: data.objective }),
      paymentMethod: selectedGateway,
      ...(anonymous && { isAnonymous: true }),
      addons: {
        items: computedBreakdown.map((addon) => ({
          addOnId: addon.id,
          values:  addon.values ?? {},
        })),
      },
    };

    if (isRecurring) {
      body.payment = {
        paymentMode:    "split",
        amount:         amountTier,
        currency,
        ...(tipPct > 0 && { platformTipPercent: tipPct }),
        scheduleType,
        scheduleConfig,
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

  const handleSubmit = async () => {
    if (submitting) return;

    if (!data.causeIds?.length) {
      setSubmitError("Please go back to 'Info' and select at least one cause.");
      return;
    }

    update({
      tipPct,
      grandTotal,
      addOnsTotal,
      addOnBreakdown: computedBreakdown,
      anonymous,
      paymentMethod: selectedGateway,
    });

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res     = await apiRequest("donations/submit", {
        method: "POST",
        body:   JSON.stringify(buildSubmitBody()),
      });
      const payment = res?.data?.payment ?? {};
      update({
        donationId:           res?.data?.donationId     ?? null,
        guestSessionId:       res?.data?.guestSessionId ?? null,
        stripeClientSecret:   payment.clientSecret       ?? null,
        stripePublishableKey: publishableKey,
      });
      handleNext(4);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message ?? "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <StepLayout
      step={3}
      title="Add-ons & Payment"
      subtitle="Enhance your donation with optional add-ons and complete your payment setup"
      onNext={handleSubmit}
      onPrev={() => {
        update({ tipPct, grandTotal, addOnsTotal, addOnBreakdown: computedBreakdown });
        handlePrev(2);
      }}
      prevLabel="Back"
      nextLabel={submitting ? "Submitting…" : "Complete Donation"}
    >
      <div className="flex flex-col gap-4">

        {/* ── Donation amount display ─────────────────────────────────────── */}
        <div className="border border-[#E5E5E5] rounded-xl px-4 py-3 bg-white">
          <p className="text-[13px] text-[#737373] mb-1.5">Donation Amount</p>
          <p className="text-[28px] font-bold text-[#383838]">
            {sym}{baseDonation.toLocaleString()}
          </p>
        </div>

        {/* ── Add-ons ─────────────────────────────────────────────────────── */}
        {campaignAddOns.map((addOn) => {
          const enabled      = addOnEnabled[addOn.id] ?? true;
          const inputs       = addOn.pricing?.inputs ?? [];
          const inputValues  = addOnInputs[addOn.id] ?? {};
          const addOnTotal   = calcAddOnTotal(addOn, inputValues);
          const formulaLabel = buildFormulaLabel(addOn, inputValues, sym);

          return (
            <div key={addOn.id} className="border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[14px] font-semibold text-[#383838]">{addOn.name}</p>
                  <p className="text-[12px] text-[#737373] mt-0.5">
                    {addOn.labelUnderAmount ?? addOn.shortDescription}
                  </p>
                </div>
                <Toggle
                  enabled={enabled}
                  onChange={(val) => setAddOnEnabled((prev) => ({ ...prev, [addOn.id]: val }))}
                />
              </div>

              {enabled && inputs.length > 0 && (
                <div className="px-4 pb-4 border-t border-[#F0F0F0] pt-3">
                  <div className="flex gap-3">
                    {inputs.map((inp) => (
                      <Stepper
                        key={inp.key}
                        label={inp.label}
                        hint="Add yourself & dependants"
                        value={inputValues[inp.key] ?? inp.defaultValue ?? 1}
                        onChange={(val) => updateAddOnInput(addOn.id, inp.key, val)}
                        min={inp.min ?? 1}
                        max={inp.max ?? 99}
                      />
                    ))}
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 flex flex-col items-center justify-center flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#065F46] text-center mb-1">Total</p>
                      <p className="text-[26px] font-bold text-[#065F46] leading-none">{sym}{addOnTotal}</p>
                      {formulaLabel && (
                        <p className="text-[10px] text-[#6B7280] mt-1.5 text-center leading-snug">{formulaLabel}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Tipping ─────────────────────────────────────────────────────── */}
        {enableTipping && (
          <div className="border border-[#E5E5E5] rounded-xl bg-[#F9F9F9] px-4 py-4">
            <p className="text-[14px] font-semibold text-[#383838]">Platform Support Fees</p>
            <p className="text-[12px] text-[#737373] mt-0.5 mb-4">
              Voluntary support for organization fees for platform maintenance and well being
            </p>
            <div className="inline-flex items-center bg-white border border-[#E5E5E5] rounded-lg px-4 py-2 mb-4">
              <span className="text-[16px] font-bold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={sliderMax}
                step={1}
                value={tipPct}
                onChange={(e) => setTipPct(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#EA3335]"
                style={{
                  background: `linear-gradient(to right, #EA3335 ${(tipPct / sliderMax) * 100}%, #E5E5E5 ${(tipPct / sliderMax) * 100}%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                {TIP_PERCENTAGES.map((pct) => (
                  <span
                    key={pct}
                    className={`text-[11px] font-medium transition-colors ${tipPct === pct ? "text-[#EA3335]" : "text-[#AEAEAE]"}`}
                  >
                    {pct}%
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#AEAEAE] mt-2">
              {tipPct}% of base donation ({sym}{baseDonation})
            </p>
          </div>
        )}

        {/* ── Subtotal ────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3">
          <p className="text-[13px] text-[#383838]">
            <span className="font-bold">Subtotal: </span>
            <span className="text-[#737373]">
              {sym}{baseDonation}
              {addOnsTotal > 0 && (
                <>{" + "}<span className="font-semibold text-[#383838]">{sym}{addOnsTotal}</span>{" (add-ons)"}</>
              )}
              {tipAmount > 0 && (
                <>{" + "}<span className="font-semibold text-[#383838]">{sym}{tipAmount.toFixed(2)}</span>{" (Tip)"}</>
              )}
              {" = "}
              <span className="font-bold text-[#383838] text-[15px]">{sym}{grandTotal.toFixed(2)}</span>
            </span>
          </p>
        </div>

        {/* ── Payment method ───────────────────────────────────────────────── */}
        <div className="pt-1">
          <p className="text-[14px] font-semibold text-[#383838] mb-3">Payment Method</p>
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
                        src={gateway.provider === "stripe" ? "/images/stripe.jpg" : "/images/paypal.png"}
                        alt={gateway.provider}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </button>
                );
              })}
          </div>
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

        {/* ── Anonymous ───────────────────────────────────────────────────── */}
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
            {anonymous && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
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

export default Step5Addons;

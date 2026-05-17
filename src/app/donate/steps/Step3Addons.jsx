"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "./StepComponents/StepLayout";
import { apiRequest } from "@/services/api";
import AddOnsList from "./StepComponents/Step3components/AddOnsList";
import TippingSection from "./StepComponents/Step3components/TippingSection";
import PaymentGatewaySelector from "./StepComponents/Step3components/PaymentGatewaySelector";

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

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

const Step3Addons = () => {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();
  const router = useRouter();

  useEffect(() => {
    if (data.submitted) {
      const base = data.campaign ? `/${data.campaign}` : "/donate";
      router.replace(`${base}/4`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignAddOns  = campaignMeta.addOns ?? [];
  const enableTipping   = campaignMeta.goalsDates?.enableTipping ?? true;
  const customNoteFields = campaignMeta.goalsDates?.customNotes ?? [];

  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 0;
  const paymentType  = data.paymentType  ?? "one-time";
  const numberOfDays = data.numberOfDays ?? 30;
  const isRecurring  = paymentType === "recurring";

  const sym          = (CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0]).symbol;
  // For specific_dates recurring with per-date custom amounts, use the pre-computed sum stored in context.
  const baseDonation = isRecurring
    ? (data.perDateTotal ?? amountTier * numberOfDays)
    : amountTier;

  const [addOnEnabled, setAddOnEnabled] = useState(() => {
    const breakdown = data.addOnBreakdown;
    if (!breakdown) return Object.fromEntries(campaignAddOns.map((a) => [a.id, false]));
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

  const [tipPct,          setTipPct]          = useState(data.tipPct ?? 10);
  const [customTipAmount, setCustomTipAmount] = useState(data.customTipAmount ?? "");
  const [gatewayState,    setGatewayState]    = useState({
    gateway:        ["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null,
    publishableKey: null,
  });
  const [customNoteValues, setCustomNoteValues] = useState(() =>
    Object.fromEntries(customNoteFields.map((f) => [f.key, f.defaultValue ?? ""]))
  );
  const [noteErrors,   setNoteErrors]   = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState(null);

  const computedBreakdown = useMemo(() =>
    campaignAddOns
      .filter((a) => addOnEnabled[a.id])
      .map((a) => ({
        id:        a.id,
        name:      a.name,
        iconEmoji: a.iconEmoji ?? "",
        total:     calcAddOnTotal(a, addOnInputs[a.id] ?? {}),
        values:    addOnInputs[a.id] ?? {},
      })),
    [campaignAddOns, addOnEnabled, addOnInputs]
  );

  const addOnsTotal = useMemo(() =>
    computedBreakdown.reduce((sum, a) => sum + a.total, 0),
    [computedBreakdown]
  );

  const customTipParsed = customTipAmount !== "" ? Math.max(0, Number(customTipAmount) || 0) : null;
  const tipAmount       = enableTipping
    ? (customTipParsed !== null ? customTipParsed : Math.round((baseDonation * tipPct) / 100 * 100) / 100)
    : 0;
  const grandTotal = baseDonation + addOnsTotal + tipAmount;

  const updateAddOnInput = (addOnId, key, val) =>
    setAddOnInputs((prev) => ({ ...prev, [addOnId]: { ...prev[addOnId], [key]: val } }));

  // Sync local add-on/tip state to context in real-time so DonationPreview updates live
  useEffect(() => {
    update({
      tipPct,
      customTipAmount,
      addOnsTotal,
      grandTotal,
      addOnBreakdown: computedBreakdown,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipPct, customTipAmount, computedBreakdown, grandTotal]);

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
      paymentMethod: gatewayState.gateway,
      ...(data.anonymous && { isAnonymous: true }),
      ...(customNoteFields.length > 0 && {
        customNotes: Object.fromEntries(
          customNoteFields
            .map((f) => [f.key, (customNoteValues[f.key] ?? "").trim()])
            .filter(([, v]) => v)
        ),
      }),
      addons: {
        items: computedBreakdown.map((addon) => ({
          addOnId: addon.id,
          values:  addon.values ?? {},
        })),
      },
    };

    if (isRecurring) {
      body.payment = {
        paymentMode: "split",
        amount:      amountTier,
        currency,
        ...(tipAmount > 0
          ? customTipParsed !== null
            ? { platformTipAmount: tipAmount }
            : { platformTipPercent: tipPct }
          : {}),
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
    const errors = Object.fromEntries(
      customNoteFields
        .filter((f) => f.required && !(customNoteValues[f.key] ?? "").trim())
        .map((f) => [f.key, true])
    );
    if (Object.keys(errors).length > 0) {
      setNoteErrors(errors);
      setSubmitError("Please fill in all required fields.");
      return;
    }
    setNoteErrors({});
    update({ tipPct, grandTotal, addOnsTotal, addOnBreakdown: computedBreakdown, paymentMethod: gatewayState.gateway });
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res     = await apiRequest("donations/submit", { method: "POST", body: JSON.stringify(buildSubmitBody()) });
      const payment = res?.data?.payment ?? {};
      update({
        donationId:           res?.data?.donationId     ?? null,
        guestSessionId:       res?.data?.guestSessionId ?? null,
        stripeClientSecret:   payment.clientSecret       ?? null,
        stripePublishableKey: gatewayState.publishableKey,
        submitted:            true,
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
      title="Overview"
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

        {/* <div className="border border-[#E5E5E5] rounded-xl px-4 py-3 bg-white">
          <p className="text-[13px] text-[#737373] mb-1.5">Donation Amount</p>
          <p className="text-[28px] font-bold text-[#383838]">
            {sym}{baseDonation.toLocaleString()}
          </p>
        </div> */}

        <AddOnsList
          campaignAddOns={campaignAddOns}
          sym={sym}
          addOnEnabled={addOnEnabled}
          setAddOnEnabled={setAddOnEnabled}
          addOnInputs={addOnInputs}
          updateAddOnInput={updateAddOnInput}
        />

        {enableTipping && (
          <TippingSection
            sym={sym}
            baseDonation={baseDonation}
            tipPct={tipPct}
            setTipPct={setTipPct}
            customTipAmount={customTipAmount}
            setCustomTipAmount={setCustomTipAmount}
          />
        )}

        {/* <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3">
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
        </div> */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-[#383838]">Custom Note</p>
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Add a note to your donation…"
            rows={3}
            className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-[14px] text-[#383838] bg-white placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#EA3335] resize-none transition-colors"
          />
        </div>

        <PaymentGatewaySelector
          isRecurring={isRecurring}
          initialGateway={["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null}
          onChange={setGatewayState}
        />

        {submitError && (
          <p className="text-[13px] text-[#EA3335] bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-3">
            {submitError}
          </p>
        )}

      </div>
    </StepLayout>
  );
};

export default Step3Addons;

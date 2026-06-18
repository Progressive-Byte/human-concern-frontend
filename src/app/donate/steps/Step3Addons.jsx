"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "./StepComponents/StepLayout";
import { apiRequest } from "@/services/api";
import { generateDatesInRange } from "./StepComponents/countOccurrences";
import AddOnsList from "./StepComponents/Step3components/AddOnsList";
import TippingSection from "./StepComponents/Step3components/TippingSection";
import PaymentGatewaySelector from "./StepComponents/Step3components/PaymentGatewaySelector";

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

function normalizeNoteFields(value) {
  return Array.isArray(value) ? value.filter((field) => field && typeof field === "object") : [];
}

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
  const pathname = usePathname();
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignAddOns  = campaignMeta.addOns ?? [];
  const goalsDatesCompleted = Boolean(campaignMeta.sectionsCompleted?.goalsDates);
  const enableTipping = isPreview ? (goalsDatesCompleted ? Boolean(campaignMeta.goalsDates?.enableTipping) : false) : (campaignMeta.goalsDates?.enableTipping ?? true);
  const customNotes = isPreview ? (goalsDatesCompleted ? (campaignMeta.goalsDates?.customNotes ?? []) : []) : (campaignMeta.goalsDates?.customNotes ?? []);
  const showGlobalNote = isPreview ? (goalsDatesCompleted ? Boolean(campaignMeta.goalsDates?.showGlobalNote) : false) : Boolean(campaignMeta.goalsDates?.showGlobalNote);
  const [globalNoteFields, setGlobalNoteFields] = useState(() => normalizeNoteFields(campaignMeta.globalNote));
  
  // Combine custom notes and global notes, avoiding duplicate keys
  const customNoteFields = useMemo(() => {
    const combined = [...customNotes];
    const existingKeys = new Set(combined.map(f => String(f.key).trim()));
    if (showGlobalNote) {
      globalNoteFields.forEach(f => {
        const key = String(f.key).trim();
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          combined.push(f);
        }
      });
    }
    return combined;
  }, [customNotes, showGlobalNote, globalNoteFields]);

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
  const [gatewayState, setGatewayState] = useState({
    gateway: isPreview ? "stripe" : (["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null),
    publishableKey: null,
  });
  const [customNoteValues, setCustomNoteValues] = useState(() =>
    Object.fromEntries(customNoteFields.map((f) => {
      if (f.type === "checkbox") {
        return [f.key, f.defaultValue ?? false];
      }
      return [f.key, f.defaultValue ?? ""];
    }))
  );
  const [noteErrors,   setNoteErrors]   = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState(null);

  useEffect(() => {
    if (!showGlobalNote || isPreview) return;
    let alive = true;

    (async () => {
      try {
        const res = await apiRequest("payment/settings", { method: "GET" });
        if (!alive) return;
        const fetchedFields = normalizeNoteFields(res?.data?.globalNote);
        if (fetchedFields.length > 0) {
          setGlobalNoteFields(fetchedFields);
        }
      } catch (err) {
        console.error("Failed to fetch global notes", err);
      }
    })();

    return () => {
      alive = false;
    };
  }, [showGlobalNote, isPreview]);

  useEffect(() => {
    setCustomNoteValues((prev) => {
      const next = { ...(prev || {}) };
      customNoteFields.forEach((field) => {
        if (field?.key in next) return;
        next[field.key] = field.type === "checkbox" ? (field.defaultValue ?? false) : (field.defaultValue ?? "");
      });
      return next;
    });
  }, [customNoteFields]);

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

  const buildApiScheduleConfig = (scheduleType, scheduleConfig) => {
    const dateAmounts = scheduleConfig.dateAmounts ?? {};

    if (scheduleType === "specific_dates") {
      const dates = scheduleConfig.dates ?? [];
      return {
        dates: dates.map((isoDate) => {
          const key = isoDate.split("T")[0];
          return {
            date:   isoDate,
            amount: dateAmounts[key] !== undefined ? Number(dateAmounts[key]) : amountTier,
          };
        }),
      };
    }

    // date_range
    const rawFreq  = scheduleConfig.frequency ?? "daily";
    const apiFreq  = rawFreq === "custom" ? "interval" : rawFreq;
    const interval = scheduleConfig.customInterval ?? 1;
    const startKey = scheduleConfig.startDate?.split("T")[0] ?? "";
    const endKey   = scheduleConfig.endDate?.split("T")[0]   ?? "";
    const allKeys  = generateDatesInRange(startKey, endKey, rawFreq, interval);

    return {
      startDate: scheduleConfig.startDate ?? "",
      endDate:   scheduleConfig.endDate   ?? "",
      frequency: apiFreq,
      ...(apiFreq === "interval" && { intervalValue: interval }),
      dates: allKeys.map((d) => ({
        date:   new Date(`${d}T00:00:00.000Z`).toISOString(),
        amount: dateAmounts[d] !== undefined ? Number(dateAmounts[d]) : amountTier,
      })),
    };
  };

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
            .map((f) => {
              if (f.type === "checkbox") {
                return [f.key, !!customNoteValues[f.key]];
              }
              const val = customNoteValues[f.key] ?? "";
              return [f.key, typeof val === "string" ? val.trim() : val];
            })
            .filter(([_, v]) => {
              // Include checkbox values even if false (if required), otherwise only include non-empty
              const field = customNoteFields.find(f => f.key === _);
              if (field?.type === "checkbox") {
                return true; // Always include checkbox values
              }
              return v;
            })
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
      const howToSplit = (data.splitMode ?? "repeat") === "divide" ? "divide" : "each";
      body.payment = {
        paymentMode: "split",
        // total across all scheduled dates (API validates sum matches dates array)
        amount:      baseDonation,
        currency,
        howToSplit,
        ...(tipAmount > 0
          ? customTipParsed !== null
            ? { platformTipAmount: tipAmount }
            : { platformTipPercent: tipPct }
          : {}),
        scheduleType,
        scheduleConfig: buildApiScheduleConfig(scheduleType, scheduleConfig),
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
    if (isRecurring) {
      const schedCfg  = data.scheduleConfig ?? {};
      const schedType = data.scheduleType   ?? "date_range";
      if (schedType === "specific_dates") {
        if (!schedCfg.dates?.length) {
          setSubmitError("Please go back to 'Payment' and select at least one date for your schedule.");
          return;
        }
      } else {
        if (!schedCfg.startDate || !schedCfg.endDate) {
          setSubmitError("Please go back to 'Payment' and set a start and end date for your schedule.");
          return;
        }
      }
    }
    const errors = Object.fromEntries(
      customNoteFields
        .filter((f) => {
          if (f.required) {
            if (f.type === "checkbox") {
              return !customNoteValues[f.key];
            }
            return !(customNoteValues[f.key] ?? "").toString().trim();
          }
          return false;
        })
        .map((f) => [f.key, true])
    );
    if (Object.keys(errors).length > 0) {
      setNoteErrors(errors);
      setSubmitError("Please fill in all required fields.");
      return;
    }
    setNoteErrors({});
    const paymentMethod = isPreview ? "stripe" : gatewayState.gateway;
    update({ tipPct, grandTotal, addOnsTotal, addOnBreakdown: computedBreakdown, paymentMethod });
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isPreview) {
        update({
          donationId: "preview",
          guestSessionId: null,
          stripeClientSecret: null,
          stripePublishableKey: null,
          submitted: true,
        });
        handleNext(4);
        setSubmitting(false);
        return;
      }
      const res     = await apiRequest("donations/submit", { method: "POST", body: JSON.stringify(buildSubmitBody()) });
      const payment = res?.data?.payment ?? {};
      const pendingSessionId =
        res?.data?.pendingSessionId ??
        payment?.pendingSessionId ??
        res?.pendingSessionId ??
        null;
      const setupIntentId =
        payment?.setupIntentId ??
        payment?.setupIntent?.id ??
        res?.data?.setupIntentId ??
        null;
      update({
        donationId:           res?.data?.donationId     ?? null,
        guestSessionId:       res?.data?.guestSessionId ?? null,
        stripeClientSecret:   payment.clientSecret       ?? null,
        stripePublishableKey: gatewayState.publishableKey,
        pendingSessionId,
        setupIntentId,
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
      nextLabel={submitting ? "Submitting…" : isPreview ? "Preview Confirmation" : "Complete Donation"}
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
        {customNoteFields.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 flex flex-col gap-4">
            {customNoteFields.map((field) => {
              const value   = customNoteValues[field.key] ?? "";
              const hasError = noteErrors[field.key];
              const baseInputClass = `w-full border rounded-lg px-3 py-2 text-[14px] text-[#383838] bg-white placeholder:text-[#AEAEAE] focus:outline-none resize-none transition-colors ${
                hasError
                  ? "border-[#EA3335] focus:border-[#EA3335]"
                  : "border-[#E5E5E5] focus:border-[#EA3335]"
              }`;
              
              return (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-semibold text-[#383838]">
                    {field.label}
                    {field.required && <span className="text-[#EA3335] ml-0.5">*</span>}
                  </p>
                  
                  {field.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => {
                        setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                        if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                      }}
                      placeholder={field.placeholder ?? ""}
                      rows={3}
                      className={baseInputClass}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={value}
                      onChange={(e) => {
                        setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                        if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                      }}
                      className={baseInputClass}
                    >
                      <option value="">Select an option</option>
                      {(field.options || []).map((opt, idx) => (
                        <option key={opt.id || idx} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "radio" ? (
                    <div className="flex flex-col gap-2">
                      {(field.options || []).map((opt, idx) => (
                        <label key={opt.id || idx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`custom-note-${field.key}`}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={(e) => {
                              setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                              if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                            }}
                            className="h-4 w-4 text-[#EA3335] focus:ring-[#EA3335]"
                          />
                          <span className="text-[14px] text-[#383838]">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => {
                          setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.checked }));
                          if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                        }}
                        className="h-4 w-4 text-[#EA3335] focus:ring-[#EA3335]"
                      />
                      <span className="text-[14px] text-[#383838]">{field.label}</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                        if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                      }}
                      placeholder={field.placeholder ?? ""}
                      className={baseInputClass}
                    />
                  )}
                  
                  {field.helpText && (
                    <p className="text-[12px] text-[#737373]">{field.helpText}</p>
                  )}
                  {hasError && (
                    <p className="text-[12px] text-[#EA3335]">{field.label} is required.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isPreview ? (
          <PaymentGatewaySelector
            isRecurring={isRecurring}
            initialGateway={["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null}
            onChange={setGatewayState}
          />
        ) : null}

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

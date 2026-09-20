"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "./StepComponents/StepLayout";
import { apiRequest } from "@/services/api";
import { submitScheduleEditForm } from "@/services/donationService";
import { generateDatesInRange } from "./StepComponents/countOccurrences";
import { distributeAmount } from "@/utils/causeSplit";
import { computeFirstPayment, resolveFirstInstallment } from "./StepComponents/firstPayment";
import AddOnsList from "./StepComponents/Step3components/AddOnsList";
import TippingSection from "./StepComponents/Step3components/TippingSection";
import PaymentGatewaySelector from "./StepComponents/Step3components/PaymentGatewaySelector";
import { buildDonorReturnParams, saveDonorReturnParams } from "@/components/payment/UnifiedChallengeDispatcher";
import { resetIdempotencyKeyForChangedIntent } from "@/utils/idempotency";
import { validateOverviewStep } from "@/utils/donationStepValidation";
import { buildUtmPayload, readFirstTouch } from "@/utils/utm";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$",
  SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥",
};

// Stable empty-array fallback — avoids creating a new reference on every render,
// which would cause the customNoteFields useMemo to recompute and trigger an
// infinite setState loop in the sync effect below.
const EMPTY_NOTES = [];

function normalizeNoteFields(value) {
  return Array.isArray(value) ? value.filter((field) => field && typeof field === "object") : [];
}

/**
 * The amount for one schedule date. The resolved map (Step 2) already applied the committed total
 * and the last-installment remainder, so it wins; explicit per-date overrides are next, and the
 * plain per-date amount is the fallback.
 */
function pickDateAmount({ resolved, overrides, key, fallback }) {
  const r = resolved ? resolved[key] : undefined;
  if (r !== undefined && r !== null) return Number(r);
  if (overrides && overrides[key] !== undefined) return Number(overrides[key]);
  return fallback;
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
  const router = useRouter();
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const isEditMode = useMemo(() => {
    try {
      return Boolean(JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").isEditMode);
    } catch { return false; }
  }, []);

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const campaignAddOns  = campaignMeta.addOns ?? [];
  const goalsDatesCompleted = Boolean(campaignMeta.sectionsCompleted?.goalsDates);
  const enableTipping = isPreview ? (goalsDatesCompleted ? Boolean(campaignMeta.goalsDates?.enableTipping) : false) : (campaignMeta.goalsDates?.enableTipping ?? true);
  const customNotes = isPreview ? (goalsDatesCompleted ? (campaignMeta.goalsDates?.customNotes ?? EMPTY_NOTES) : EMPTY_NOTES) : (campaignMeta.goalsDates?.customNotes ?? EMPTY_NOTES);
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

  const sym          = CURRENCY_SYMBOLS[currency] ?? currency;
  const paymentMethods = campaignMeta.goalsDates?.paymentMethods ?? [];
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
    // Support both 'values' (current) and legacy 'inputValues' key names
    const savedValues = breakdown
      ? Object.fromEntries(breakdown.map((a) => [a.id, a.values ?? a.inputValues ?? {}]))
      : {};
    return Object.fromEntries(
      campaignAddOns.map((a) => {
        // Always seed with pricing defaults so formula inputs are never missing,
        // then overlay any saved values (from context/API restore) on top.
        const defaults = Object.fromEntries(
          (a.pricing?.inputs ?? []).map((inp) => [inp.key, inp.defaultValue ?? 1])
        );
        return [a.id, { ...defaults, ...(savedValues[a.id] || {}) }];
      })
    );
  });

  const [tipPct,          setTipPct]          = useState(data.tipPct ?? 10);
  const [customTipAmount, setCustomTipAmount] = useState(data.customTipAmount ?? "");
  const [gatewayState, setGatewayStateInternal] = useState({
    gateway: isPreview ? "stripe" : (["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null),
    configurationId: data.gatewayConfigurationId ?? null,
    publishableKey: data.stripePublishableKey ?? null,
    clientId: data.paypalClientId ?? null,
  });

  const setGatewayState = (next) => {
    const merged = typeof next === "function" ? next(gatewayState) : { ...gatewayState, ...(next || {}) };
    setGatewayStateInternal(merged);
    const provider = merged.gateway ?? merged.provider ?? null;
    const patch = { paymentMethod: provider };
    if (provider === "stripe") {
      if (merged.publishableKey) patch.stripePublishableKey = merged.publishableKey;
      if (merged.configurationId) patch.gatewayConfigurationId = merged.configurationId;
    } else if (provider === "paypal") {
      if (merged.clientId ?? merged.paypalConfig?.clientId) {
        patch.paypalClientId = merged.clientId ?? merged.paypalConfig?.clientId;
      }
      if (merged.configurationId) patch.gatewayConfigurationId = merged.configurationId;
    }
    update(patch);
  };
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

  // The tip is charged in full with the FIRST installment, so for recurring the percentage
  // applies to the first payment — not the whole commitment (which would dwarf the first
  // charge). One-time keeps using the single payment amount.
  const tipBasis = isRecurring
    ? resolveFirstInstallment({
        isRecurring,
        scheduleType: data.scheduleType,
        scheduleConfig: data.scheduleConfig,
        amountTier,
      }).base
    : amountTier;

  const tipAmount       = enableTipping
    ? (customTipParsed !== null ? customTipParsed : Math.round((tipBasis * tipPct) / 100 * 100) / 100)
    : 0;
  const grandTotal = baseDonation + addOnsTotal + tipAmount;

  // Recurring charges the first scheduled payment + all one-time extras (add-ons + tip)
  // on the first date — not the whole commitment. Surfaced on the pay button (step 4).
  const { amount: firstPaymentAmount, date: firstPaymentDate } = computeFirstPayment({
    isRecurring,
    scheduleType: data.scheduleType,
    scheduleConfig: data.scheduleConfig,
    amountTier,
    addOnsTotal,
    tipAmount,
  });

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
      firstPaymentAmount,
      firstPaymentDate,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipPct, customTipAmount, computedBreakdown, grandTotal, firstPaymentAmount, firstPaymentDate]);

  const buildEditPayload = () => {
    const scheduleType   = data.scheduleType   ?? "specific_dates";
    const scheduleConfig = data.scheduleConfig ?? {};
    const dateAmounts    = scheduleConfig.dateAmounts ?? {};

    let prefillDateMap = {};
    try {
      const editRaw = sessionStorage.getItem("hc_schedule_edit");
      if (editRaw) prefillDateMap = JSON.parse(editRaw).prefillDateMap || {};
    } catch (_) {}

    const buildDates = () => {
      if (scheduleType === "specific_dates") {
        return (scheduleConfig.dates ?? []).map((isoDate) => {
          const key    = isoDate.split("T")[0];
          const prefill = prefillDateMap[key];
          const amount = pickDateAmount({ resolved: data.resolvedScheduleAmounts, overrides: dateAmounts, key, fallback: amountTier });
          const row = {
            date:   isoDate.includes("T") ? isoDate : `${isoDate}T00:00:00.000Z`,
            amount,
          };
          // Pre-filled date that wasn't removed → the backend must match its existing installment
          if (prefill && !prefill.removed) row.transactionId = prefill.transactionId;
          return row;
        });
      }

      // date_range — expand to individual rows, each with optional transactionId
      const rawFreq  = scheduleConfig.frequency ?? "daily";
      const interval = scheduleConfig.customInterval ?? 1;
      const days     = Array.isArray(scheduleConfig.daysOfWeek) ? scheduleConfig.daysOfWeek : [];
      const startKey = scheduleConfig.startDate?.split("T")[0] ?? "";
      const endKey   = scheduleConfig.endDate?.split("T")[0]   ?? "";
      return generateDatesInRange(startKey, endKey, rawFreq, interval, days).map((d) => {
        const prefill = prefillDateMap[d];
        const amount  = pickDateAmount({ resolved: data.resolvedScheduleAmounts, overrides: dateAmounts, key: d, fallback: amountTier });
        const row = { date: `${d}T00:00:00.000Z`, amount };
        if (prefill && !prefill.removed) row.transactionId = prefill.transactionId;
        return row;
      });
    };

    const tipPayload = customTipParsed !== null
      ? { platformTipAmount: tipAmount }
      : tipPct > 0
      ? { platformTipPercent: tipPct }
      : {};

    return {
      causeIds: data.causeIds ?? [],
      addons: {
        items: computedBreakdown.map((addon) => ({
          addOnId: addon.id,
          values:  addon.values ?? {},
        })),
      },
      payment: {
        paymentMode: "split",
        amount:      Math.round(baseDonation * 100) / 100,
        currency,
        ...tipPayload,
        scheduleType,
        scheduleConfig: { dates: buildDates() },
      },
    };
  };

  const buildApiScheduleConfig = (scheduleType, scheduleConfig) => {
    const dateAmounts = scheduleConfig.dateAmounts ?? {};

    const causeSplit = data.causeSplit ?? {};

    if (scheduleType === "specific_dates") {
      const dates = scheduleConfig.dates ?? [];
      return {
        dates: dates.map((isoDate) => {
          const key    = isoDate.split("T")[0];
          const amount = pickDateAmount({ resolved: data.resolvedScheduleAmounts, overrides: dateAmounts, key, fallback: amountTier });
          return {
            date:   isoDate,
            amount,
            causeAllocations: distributeAmount(amount, causeSplit),
          };
        }),
      };
    }

    // date_range
    const rawFreq  = scheduleConfig.frequency ?? "daily";
    const apiFreq  = rawFreq === "custom" ? "interval" : rawFreq;
    const interval = scheduleConfig.customInterval ?? 1;
    const days     = Array.isArray(scheduleConfig.daysOfWeek) ? scheduleConfig.daysOfWeek : [];
    const startKey = scheduleConfig.startDate?.split("T")[0] ?? "";
    const endKey   = scheduleConfig.endDate?.split("T")[0]   ?? "";
    const allKeys  = generateDatesInRange(startKey, endKey, rawFreq, interval, days);

    return {
      startDate: scheduleConfig.startDate ?? "",
      endDate:   scheduleConfig.endDate   ?? "",
      frequency: apiFreq,
      ...(apiFreq === "interval" && { intervalValue: interval }),
      ...(apiFreq === "weekly" && days.length ? { daysOfWeek: days } : {}),
      dates: allKeys.map((d) => {
        const amount = pickDateAmount({ resolved: data.resolvedScheduleAmounts, overrides: dateAmounts, key: d, fallback: amountTier });
        return {
          date:   new Date(`${d}T00:00:00.000Z`).toISOString(),
          amount,
          causeAllocations: distributeAmount(amount, causeSplit),
        };
      }),
    };
  };

  const buildSubmitBody = () => {
    const scheduleType   = data.scheduleType   ?? "date_range";
    const scheduleConfig = data.scheduleConfig ?? {};
    const utm            = buildUtmPayload(data);
    const firstTouch     = readFirstTouch();

    const body = {
      ...(data.campaignId ? { formId: data.campaignId } : { formSlug: data.campaign }),
      ...(utm && { utm }),
      ...(firstTouch && { firstTouch }),
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
        countryCode:  data.donorCountryCode ?? "",
      },
      ...(data.isRamadan && data.objective && { objectiveId: data.objective }),
      paymentMethod: gatewayState.gateway,
      ...(data.anonymous && { isAnonymous: true }),
      // The UI shows form + global notes together, but the API validates them separately:
      // form-defined answers go in `customNotes`, everything else in `globalNotes`.
      ...(() => {
        const formKeys = new Set(
          normalizeNoteFields(customNotes).map((f) => String(f.key ?? "").trim()).filter(Boolean)
        );
        const formValues = {};
        const globalValues = {};

        for (const f of customNoteFields) {
          const key = String(f.key ?? "").trim();
          if (!key) continue;

          let value;
          if (f.type === "checkbox") {
            value = !!customNoteValues[f.key];
          } else {
            const raw = customNoteValues[f.key] ?? "";
            value = typeof raw === "string" ? raw.trim() : raw;
          }

          // Checkboxes are always sent (a false is meaningful); other types are skipped when empty.
          if (f.type !== "checkbox" && !value) continue;

          if (formKeys.has(key)) formValues[key] = value;
          else globalValues[key] = value;
        }

        return {
          ...(Object.keys(formValues).length > 0 && { customNotes: formValues }),
          ...(Object.keys(globalValues).length > 0 && { globalNotes: globalValues }),
        };
      })(),
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
        ...(data.makeUpMissedDates && data.schedulePreset && data.schedulePreset !== "custom"
          ? { makeUpMissedDates: true, presetId: String(data.schedulePreset) }
          : {}),
      };
    } else {
      body.payment = {
        paymentMode: "one_time",
        amount:      amountTier,
        currency,
        ...(tipAmount > 0 && { platformTipAmount: tipAmount }),
        causeAllocations: distributeAmount(amountTier, data.causeSplit ?? {}),
      };
    }

    if (gatewayState.gateway === "paypal") {
      const donorReturnParams = buildDonorReturnParams(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          donorCountryCode: data.donorCountryCode,
        },
        {
          info: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            donorCountryCode: data.donorCountryCode,
            countryCode: data.donorCountryCode,
          },
          ...data,
        }
      );
      saveDonorReturnParams(donorReturnParams);
      body.donorReturnParams = donorReturnParams;
      body.orchestrationMode = "redirect";
    }

    return body;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!isPreview && !isEditMode) {
      const overviewError = validateOverviewStep({ paymentMethod: gatewayState.gateway });
      if (overviewError) {
        setSubmitError(overviewError);
        return;
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
    update({ tipPct, grandTotal, addOnsTotal, addOnBreakdown: computedBreakdown, paymentMethod, firstPaymentAmount, firstPaymentDate });
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
        return;
      }

      if (isEditMode) {
        let scheduleId = "";
        try {
          scheduleId = JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").scheduleId ?? "";
        } catch (_) {}
        await submitScheduleEditForm(scheduleId, buildEditPayload());
        sessionStorage.removeItem("hc_schedule_edit");
        sessionStorage.removeItem("hc_donation");
        sessionStorage.removeItem("campaignData");
        router.push(`/dashboard/schedules/${encodeURIComponent(scheduleId)}`);
        return;
      }

      const submitOpts = { method: "POST", body: JSON.stringify(buildSubmitBody()) };
      if (data.idempotencyKey) submitOpts.idempotencyKey = data.idempotencyKey;
      const res     = await apiRequest("donations/submit", submitOpts);

      // Cross-provider fallback markers (backend composeResponseStep root fields).
      const providerSwapped = Boolean(
        res?.providerSwapped ?? res?.data?.providerSwapped ?? res?.data?.data?.providerSwapped
      );
      const providerSwappedFrom =
        res?.providerSwappedFrom ?? res?.data?.providerSwappedFrom ?? res?.data?.data?.providerSwappedFrom ?? null;
      const swappedReasonCode =
        res?.swappedReasonCode ?? res?.data?.swappedReasonCode ?? res?.data?.data?.swappedReasonCode ?? null;

      // Ordering matters: overwrite the context provider FIRST, then (re)write the
      // unified challenge session, THEN navigate to Step 4.
      if (providerSwapped && typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("hc_unified_challenge");
          sessionStorage.removeItem("hc_last_challenge");
          sessionStorage.removeItem("hc_auth_challenge_id");
          sessionStorage.removeItem("hc_frontend_return_payload_id");
        } catch {
          // noop
        }
      }

      const payment =
        res?.payment ??
        res?.data?.payment ??
        res?.data?.data?.payment ??
        res?.payments?.[0] ??
        {};
      const pendingSessionId =
        payment?.pendingSessionId ??
        payment?.pending_session_id ??
        res?.data?.pendingSessionId ??
        res?.data?.pending_session_id ??
        res?.pendingSessionId ??
        null;
      const setupIntentId =
        payment?.setupIntentId ??
        payment?.setup_intent_id ??
        payment?.setupIntent?.id ??
        payment?.setup_intent?.id ??
        res?.data?.setupIntentId ??
        res?.data?.setup_intent_id ??
        null;
      const paymentIntentId =
        payment?.paymentIntentId ??
        payment?.payment_intent_id ??
        payment?.paymentIntent?.id ??
        payment?.payment_intent?.id ??
        res?.data?.paymentIntentId ??
        res?.data?.payment_intent_id ??
        null;
      const challenge =
        payment?.challenge ??
        res?.data?.challenge ??
        res?.challenge ??
        null;
      if (challenge && typeof window !== "undefined") {
        try {
          sessionStorage.setItem("hc_unified_challenge", JSON.stringify(challenge));
          if (challenge.authChallengeId) {
            sessionStorage.setItem("hc_auth_challenge_id", String(challenge.authChallengeId));
          }
          if (challenge.frontendReturnPayloadId) {
            sessionStorage.setItem("hc_frontend_return_payload_id", String(challenge.frontendReturnPayloadId));
          }
        } catch {
          // noop
        }
      }
      const resolvedPublishableKey =
        res?.stripePublishableKey ??
        res?.stripe_publishable_key ??
        res?.publishableKey ??
        res?.data?.stripePublishableKey ??
        res?.data?.stripe_publishable_key ??
        res?.data?.publishableKey ??
        payment?.stripePublishableKey ??
        payment?.stripe_publishable_key ??
        payment?.publishableKey ??
        payment?.publishable_key ??
        null;
      const resolvedClientId =
        res?.clientId ??
        res?.client_id ??
        res?.data?.clientId ??
        res?.data?.client_id ??
        res?.data?.payment?.clientId ??
        res?.data?.payment?.client_id ??
        payment?.clientId ??
        payment?.client_id ??
        null;
      const gatewayConfigurationId =
        payment?.gatewayConfigurationId ??
        payment?.gateway_configuration_id ??
        res?.data?.gatewayConfigurationId ??
        res?.data?.gateway_configuration_id ??
        res?.gatewayConfigurationId ??
        gatewayState.configurationId ??
        data.gatewayConfigurationId ??
        null;
      const orderId =
        payment?.orderId ??
        payment?.order_id ??
        res?.data?.orderId ??
        res?.data?.order_id ??
        res?.orderId ??
        null;
      const redirectUrl =
        payment?.redirectUrl ??
        payment?.redirect_url ??
        payment?.approvalUrl ??
        payment?.approval_url ??
        res?.data?.redirectUrl ??
        res?.data?.redirect_url ??
        res?.data?.approvalUrl ??
        res?.data?.approval_url ??
        res?.redirectUrl ??
        res?.approvalUrl ??
        null;
      const approvalUrl =
        payment?.approvalUrl ?? payment?.approval_url ??
        res?.data?.approvalUrl ?? res?.data?.approval_url ??
        res?.approvalUrl ?? redirectUrl ?? null;
      const billingAgreementToken =
        payment?.billingAgreementToken ?? payment?.billing_agreement_token ?? payment?.baToken ??
        res?.data?.billingAgreementToken ?? res?.data?.billing_agreement_token ?? res?.data?.baToken ??
        res?.billingAgreementToken ??
        null;
      const stripeClientSecret =
        payment?.clientSecret ??
        payment?.client_secret ??
        payment?.stripeClientSecret ??
        payment?.stripe_client_secret ??
        payment?.setupIntent?.clientSecret ??
        payment?.setupIntent?.client_secret ??
        payment?.setup_intent?.client_secret ??
        payment?.setup_intent?.clientSecret ??
        payment?.paymentIntent?.clientSecret ??
        payment?.paymentIntent?.client_secret ??
        payment?.payment_intent?.client_secret ??
        payment?.payment_intent?.clientSecret ??
        res?.data?.clientSecret ??
        res?.data?.client_secret ??
        res?.data?.stripeClientSecret ??
        res?.data?.stripe_client_secret ??
        res?.clientSecret ??
        res?.client_secret ??
        null;
      const resolvedPaymentType =
        (payment?.paymentMode && (payment.paymentMode === "split" || payment.paymentMode === "recurring")) ? "recurring" :
        (payment?.paymentMode === "one_time" || payment?.paymentMode === "onetime") ? "one-time" :
        (setupIntentId && !paymentIntentId) ? "recurring" :
        data.paymentType;
      const resolvedProvider =
        payment?.provider ??
        res?.data?.provider ??
        res?.provider ??
        gatewayState.gateway ??
        data.paymentMethod ??
        null;

      // 1) Overwrite the gateway state with the winning provider BEFORE navigating,
      //    so Step 4 mounts the correct provider form (form type always wins from
      //    payment.provider, never from the donor's original tile choice).
      if (providerSwapped && resolvedProvider) {
        setGatewayState({
          gateway: resolvedProvider,
          configurationId: gatewayConfigurationId,
          publishableKey: resolvedPublishableKey,
          clientId: resolvedClientId,
        });
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("hc_provider_swap", JSON.stringify({
              swapped: true,
              from: providerSwappedFrom,
              to: resolvedProvider,
              reasonCode: swappedReasonCode,
              donationId: res?.donationId ?? res?.data?.donationId ?? null,
              ts: Date.now(),
            }));
          } catch {
            // noop
          }
        }
      }

      const updatePayload = {
        donationId:           res?.donationId ?? res?.data?.donationId ?? res?.id ?? null,
        guestSessionId:       res?.guestSessionId ?? res?.data?.guestSessionId ?? res?.guest_session_id ?? res?.data?.guest_session_id ?? null,
        stripeClientSecret,
        stripePublishableKey: resolvedPublishableKey,
        paypalClientId:       resolvedClientId,
        paypalOrderId:        orderId,
        pendingSessionId,
        setupIntentId,
        gatewayConfigurationId,
        paymentMethod:        resolvedProvider,
        paymentType:          resolvedPaymentType,
        grandTotal:           grandTotal ?? data.grandTotal ?? 0,
        submitted:            true,
        unifiedChallenge:     challenge,
        // --- Canonical nested envelope (clean-break preference) ---
        payment:              payment ?? res?.data?.payment ?? res?.payment ?? {},
        // --- Legacy root aliases for backward compat with in-flight readers ---
        redirectUrl,
        paypalRedirectUrl:    redirectUrl,
        approvalUrl,
        paypalApprovalUrl:    approvalUrl,
        billingAgreementToken,
        paypalBillingAgreementToken: billingAgreementToken,
        baToken:              billingAgreementToken,
        providerSwapped,
        providerSwappedFrom:  providerSwappedFrom ?? "",
        swappedReasonCode:    swappedReasonCode ?? "",
      };
      update(updatePayload);
      handleNext(4);
    } catch (err) {
      console.log("[raw-body-debug] Step3 submit error — raw response body:", (err && err.body && typeof err.body === 'object') ? JSON.stringify(err.body, null, 2) : String(err && err.body ? err.body : err));
      const specificCode =
        (err.body && err.body.error && err.body.error.code) ||
        err.code ||
        'NO_CODE';
      const specificMsg =
        (err.body && err.body.error && err.body.error.message) ||
        err.technical ||
        err.message ||
        'An unexpected error occurred. Please try again.';
      const reqId =
        (err.body && err.body.error && err.body.error.requestId) ||
        '';

      console.error("[submitDonation] FAILURE", {
        specificCode,
        specificMsg,
        requestId: reqId,
        status: err.statusCode,
        fullBody: err.body,
        stack: err && err.stack,
      });

      const codeToHuman = {
        GATEWAY_CONFIG_NOT_FOUND_IN_SETTINGS:
          'The payment system switched to a backup card (Stripe 2) but that card is not fully saved in Admin &rarr; Settings &rarr; Payment. Open that card, ensure Enabled = ON, and click Save.',
        SETTINGS_GATEWAY_CREDENTIAL_MISSING:
          'A payment card&apos;s publishable key is not saved. Re-save both Stripe cards in Admin &rarr; Settings &rarr; Payment to re-encrypt the keys.',
        SETTINGS_ENCRYPTION_KEY_MISSING:
          'Server environment SETTINGS_ENCRYPTION_KEY is missing or changed. Set it then re-save both Stripe cards from the Admin UI to re-encrypt.',
        SETTINGS_GATEWAY_CREDENTIAL_DECRYPT_EMPTY:
          'A payment card&apos;s encrypted key could not be decrypted (empty result). Re-paste the correct publishable key into the Stripe 2 card and save it.',
        SETTINGS_GATEWAY_CREDENTIAL_INVALID:
          'A payment card&apos;s publishable key decrypted but is not valid. The most common cause is pasting the SECRET key (sk_&hellip;) into the publishable key field. Re-paste the correct PK starting with pk_.',
      };
      const humanMsg = codeToHuman[specificCode] || specificMsg;
      const displayMsg = `${humanMsg}${reqId ? ` (Ref: ${reqId})` : ''}`;
      setSubmitError(displayMsg);

      const status = Number(err?.statusCode ?? err?.status ?? 0);
      if (status === 409) {
        setSubmitError(err.message ?? "We detected a duplicate submit and kept the first result — no double charge occurred.");
      }
      const needsIdempotencyReset =
        (status >= 400 && status < 500 && status !== 401 && status !== 403 && status !== 404);
      if (needsIdempotencyReset) {
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("hc_submit_idempotency");
            sessionStorage.removeItem("hc_idempotency_key_checkout_submit");
          }
        } catch (_) {
          // noop
        }
        if (typeof resetIdempotencyKeyForChangedIntent === "function") {
          try { resetIdempotencyKeyForChangedIntent(); } catch (_) {
            // noop
          }
        }
        update({ idempotencyKey: "" });
      }
    } finally {
      setSubmitting((prev) => (prev ? false : prev));
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
      nextLabel={submitting ? (isEditMode ? "Updating…" : "Submitting…") : isEditMode ? "Update Schedule" : isPreview ? "Preview Confirmation" : "Complete Donation"}
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

        {!isPreview && !isEditMode ? (
          <PaymentGatewaySelector
            isRecurring={isRecurring}
            initialGateway={["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null}
            paymentMethods={paymentMethods}
            onChange={setGatewayState}
            donorData={{
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              donorCountryCode: data.donorCountryCode,
              utm_source: data.utm_source,
              utm_medium: data.utm_medium,
              utm_campaign: data.utm_campaign,
              utm_term: data.utm_term,
              utm_content: data.utm_content,
              info: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                donorCountryCode: data.donorCountryCode,
                countryCode: data.donorCountryCode,
              },
            }}
            currency={currency}
            amount={baseDonation}
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

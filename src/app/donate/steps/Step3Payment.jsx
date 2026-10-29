"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { apiRequest } from "@/services/api";
import { submitScheduleEditForm } from "@/services/donationService";
import { validateOverviewStep } from "@/utils/donationStepValidation";
import { computeDonationProgressFromStorage } from "@/utils/donationFormProgress";
import { resetIdempotencyKeyForChangedIntent } from "@/utils/idempotency";
import { getCurrencySymbol } from "@/utils/money";
import TurnstileBox from "@/components/common/TurnstileBox";
import { TURNSTILE_ENABLED } from "@/utils/turnstile";
import StepLayout from "./StepComponents/StepLayout";
import StepProgress from "./StepComponents/StepProgress";
import DonateFormHeader from "./StepComponents/DonateFormHeader";
import TippingSection from "./StepComponents/Step3components/TippingSection";
import PaymentGatewaySelector from "./StepComponents/Step3components/PaymentGatewaySelector";
import DonationPreview from "./StepComponents/DonationPreview";
import OneTimeUpsell from "./StepComponents/Step3components/OneTimeUpsell";
import PaymentPanel from "./StepComponents/Step3components/PaymentPanel";
import { buildSubmitBody, buildEditPayload, normalizeNoteFields } from "./StepComponents/Step3components/buildSubmitBody";
import { parsePaymentResponse } from "./StepComponents/Step3components/parsePaymentResponse";
import { computeFirstPayment, resolveFirstInstallment } from "./StepComponents/firstPayment";

const Step3Payment = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const { data, update } = useDonation();
  const { handlePrev } = useStepNavigation();

  const isEditMode = useMemo(() => {
    try {
      return Boolean(JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").isEditMode);
    } catch { return false; }
  }, []);

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);

  const goalsDatesCompleted = Boolean(campaignMeta.sectionsCompleted?.goalsDates);
  const enableTipping = isPreview
    ? (goalsDatesCompleted ? Boolean(campaignMeta.goalsDates?.enableTipping) : false)
    : (campaignMeta.goalsDates?.enableTipping ?? true);
  const allowRecurring = campaignMeta.goalsDates?.allowRecurringDonations ?? true;
  const paymentMethods = campaignMeta.goalsDates?.paymentMethods ?? [];

  const currency     = data.currency     ?? "USD";
  const amountTier   = data.amountTier   ?? 0;
  const paymentType  = data.paymentType  ?? "one-time";
  const numberOfDays = data.numberOfDays ?? 30;
  const isRecurring  = paymentType === "recurring";
  const isOneTime    = !isRecurring;
  const sym          = getCurrencySymbol(currency);

  const baseDonation = isRecurring
    ? (data.perDateTotal ?? amountTier * numberOfDays)
    : amountTier;

  const [phase, setPhase] = useState("review");
  const [tipPct, setTipPct] = useState(data.tipPct ?? 10);
  const [customTipAmount, setCustomTipAmount] = useState(data.customTipAmount ?? "");
  const [tipSettings, setTipSettings] = useState(null);
  const tipWasRestored = useRef(data.tipPct !== undefined && data.tipPct !== null);
  const tipTouched = useRef(false);

  const [gatewayState, setGatewayStateInternal] = useState({
    gateway: isPreview ? "stripe" : (["stripe", "paypal"].includes(data.paymentMethod) ? data.paymentMethod : null),
    configurationId: data.gatewayConfigurationId ?? null,
    publishableKey: data.stripePublishableKey ?? null,
    clientId: data.paypalClientId ?? null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [upsellDismissed, setUpsellDismissed] = useState(false);

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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiRequest("payment/settings", { method: "GET" });
        if (!alive) return;
        setTipSettings(res?.data?.tips ?? null);
      } catch (err) {
        console.error("Failed to fetch payment settings", err);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Open on the admin's default percentage, but only when the donor has nothing of
  // their own yet. Clamped to the slider's 0-15 range.
  useEffect(() => {
    if (!tipSettings || tipWasRestored.current || tipTouched.current) return;
    const pct = Number(tipSettings.defaultPercent);
    if (!Number.isFinite(pct)) return;
    setTipPct(Math.min(15, Math.max(0, Math.round(pct))));
  }, [tipSettings]);

  const handleTipPctChange = (next) => {
    tipTouched.current = true;
    setTipPct(next);
  };

  const customTipParsed = customTipAmount !== "" ? Math.max(0, Number(customTipAmount) || 0) : null;

  const tipBasis = isRecurring
    ? resolveFirstInstallment({
        isRecurring,
        scheduleType: data.scheduleType,
        scheduleConfig: data.scheduleConfig,
        amountTier,
      }).base
    : amountTier;

  const tipAmount = enableTipping
    ? (customTipParsed !== null ? customTipParsed : Math.round((tipBasis * tipPct) / 100 * 100) / 100)
    : 0;

  const addOnsTotal = Number(data.addOnsTotal ?? 0);
  const grandTotal = baseDonation + addOnsTotal + tipAmount;

  const { amount: firstPaymentAmount, date: firstPaymentDate } = computeFirstPayment({
    isRecurring,
    scheduleType: data.scheduleType,
    scheduleConfig: data.scheduleConfig,
    amountTier,
    resolvedAmounts: data.resolvedScheduleAmounts,
    makeUpEnabled: Boolean(data.makeUpMissedDates),
    addOnsTotal,
    tipAmount,
  });

  // Keep tip and totals in context so the summary and the payment panel agree.
  useEffect(() => {
    update({ tipPct, customTipAmount, grandTotal, firstPaymentAmount, firstPaymentDate });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipPct, customTipAmount, grandTotal, firstPaymentAmount, firstPaymentDate]);

  const customNoteFields = useMemo(() => {
    const combined = normalizeNoteFields(campaignMeta.goalsDates?.customNotes);
    const seen = new Set(combined.map((f) => String(f.key ?? "").trim()));
    if (campaignMeta.goalsDates?.showGlobalNote) {
      normalizeNoteFields(campaignMeta.globalNote).forEach((f) => {
        const key = String(f.key ?? "").trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push(f);
        }
      });
    }
    return combined;
  }, [campaignMeta]);

  const validateNotes = () => {
    const answers = data.customNoteValues ?? {};
    const errors = Object.fromEntries(
      customNoteFields
        .filter((f) => {
          if (!f.required) return false;
          if (f.type === "checkbox") return !answers[f.key];
          return !String(answers[f.key] ?? "").trim();
        })
        .map((f) => [f.key, true])
    );
    return errors;
  };

  const resetIdempotencyForRetry = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("hc_submit_idempotency");
        sessionStorage.removeItem("hc_idempotency_key_checkout_submit");
      }
    } catch {}
    try { resetIdempotencyKeyForChangedIntent(); } catch {}
    update({ idempotencyKey: "" });
  };

  const handleStartPayment = async () => {
    if (submitting) return;

    const noteErrors = validateNotes();
    if (Object.keys(noteErrors).length > 0) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    if (isPreview || isEditMode) {
      update({ progressPercent: 100 });
    } else {
      const progress = computeDonationProgressFromStorage({
        ...data,
        paymentMethod: gatewayState.gateway ?? data.paymentMethod,
      });
      update({ progressPercent: progress.percent });
    }

    if (isPreview) {
      update({
        donationId: "preview",
        guestSessionId: null,
        stripeClientSecret: null,
        stripePublishableKey: null,
        submitted: true,
      });
      setPhase("pay");
      return;
    }

    if (isEditMode) {
      let scheduleId = "";
      try {
        scheduleId = JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").scheduleId ?? "";
      } catch (_) {}
      setSubmitting(true);
      setSubmitError(null);
      try {
        await submitScheduleEditForm(scheduleId, buildEditPayload({
          data, amountTier, currency, tipAmount, tipPct, customTipParsed,
        }));
        sessionStorage.removeItem("hc_schedule_edit");
        sessionStorage.removeItem("hc_donation");
        sessionStorage.removeItem("campaignData");
        router.push(`/dashboard/schedules/${encodeURIComponent(scheduleId)}`);
      } catch (err) {
        setSubmitError(err?.message || "Could not update this schedule. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!data.campaignId) {
      setSubmitError("We could not load this form. Please refresh the page and try again.");
      return;
    }

    const overviewError = validateOverviewStep({ paymentMethod: gatewayState.gateway });
    if (overviewError) {
      setSubmitError(overviewError);
      return;
    }

    if (TURNSTILE_ENABLED && turnstileToken.length === 0) {
      setSubmitError("Please wait for the security check to finish.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const body = buildSubmitBody({
        data,
        gateway: gatewayState.gateway,
        amountTier,
        currency,
        isRecurring,
        baseDonation,
        tipAmount,
        tipPct,
        customTipParsed,
        campaignMeta,
      });

      const opts = { method: "POST", body: JSON.stringify(body) };
      if (data.idempotencyKey) opts.idempotencyKey = data.idempotencyKey;
      if (turnstileToken) opts.headers = { "cf-turnstile-response": turnstileToken };

      const res = await apiRequest("donations/submit", opts);

      const { updatePayload } = parsePaymentResponse({ res, data, gatewayState, grandTotal });
      update(updatePayload);
      setPhase("pay");
    } catch (err) {
      const specificCode =
        (err.body && err.body.error && err.body.error.code) ||
        err.code ||
        "NO_CODE";
      const specificMsg =
        (err.body && err.body.error && err.body.error.message) ||
        err.technical ||
        err.message ||
        "An unexpected error occurred. Please try again.";
      const reqId = (err.body && err.body.error && err.body.error.requestId) || "";

      const codeToHuman = {
        GATEWAY_CONFIG_NOT_FOUND_IN_SETTINGS:
          "The payment system switched to a backup card but that card is not fully saved in Admin → Settings → Payment.",
        SETTINGS_GATEWAY_CREDENTIAL_MISSING:
          "A payment card's publishable key is not saved. Re-save both Stripe cards in Admin → Settings → Payment.",
        SETTINGS_ENCRYPTION_KEY_MISSING:
          "Server environment SETTINGS_ENCRYPTION_KEY is missing or changed.",
        SETTINGS_GATEWAY_CREDENTIAL_DECRYPT_EMPTY:
          "A payment card's encrypted key could not be decrypted.",
        SETTINGS_GATEWAY_CREDENTIAL_INVALID:
          "A payment card's publishable key is not valid. Re-paste the correct pk_ key.",
      };
      const humanMsg = codeToHuman[specificCode] || specificMsg;
      setSubmitError(`${humanMsg}${reqId ? ` (Ref: ${reqId})` : ""}`);

      const status = Number(err?.statusCode ?? err?.status ?? 0);
      if (status === 409) {
        setSubmitError("We detected a duplicate submit and kept the first result — no double charge occurred.");
      }
      if (status >= 400 && status < 500 && status !== 401 && status !== 403 && status !== 404) {
        resetIdempotencyForRetry();
      }
    } finally {
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
      setSubmitting(false);
    }
  };

  const base = data.campaign ? `/${data.campaign}` : "/donate";

  if (phase === "pay") {
    return (
      <main className="min-h-screen bg-[#F9F9F9] pt-[88px] pb-16 px-4">
        <DonateFormHeader maxWidth="max-w-5xl" />
        <div className="max-w-5xl mx-auto">
          <StepProgress current={3} />
          <div className="flex flex-col lg:flex-row items-start gap-5">
            <div className="flex-1 min-w-0 w-full">
              <PaymentPanel />
            </div>
            <DonationPreview currentStep={3} />
          </div>
        </div>
      </main>
    );
  }

  const nextLabel = isEditMode
    ? (submitting ? "Updating…" : "Update Schedule")
    : isPreview
    ? "Preview Confirmation"
    : submitting
    ? "Starting payment…"
    : isRecurring
    ? "Continue to payment"
    : `Donate ${sym}${grandTotal.toFixed(2)}`;

  return (
    <StepLayout
      step={3}
      title="Payment"
      subtitle="Review your donation and choose how to pay"
      onNext={handleStartPayment}
      onPrev={() => handlePrev(2)}
      prevLabel="Back"
      nextLabel={nextLabel}
    >
      <div className="flex flex-col gap-4">

        {enableTipping && (
          <TippingSection
            sym={sym}
            baseDonation={tipBasis}
            tipPct={tipPct}
            setTipPct={handleTipPctChange}
            customTipAmount={customTipAmount}
            setCustomTipAmount={setCustomTipAmount}
            label={tipSettings?.label}
            description={tipSettings?.description}
          />
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

        {isOneTime && allowRecurring && !upsellDismissed && (
          <OneTimeUpsell
            amount={amountTier}
            currency={currency}
            onSwitch={() => {
              update({ paymentType: "recurring" });
              router.push(`${base}/1`);
            }}
            onDismiss={() => setUpsellDismissed(true)}
          />
        )}

        {submitError && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {submitError}
          </p>
        )}

        {!isPreview && !isEditMode ? (
          <TurnstileBox onToken={setTurnstileToken} resetKey={turnstileReset} />
        ) : null}

      </div>
    </StepLayout>
  );
};

export default Step3Payment;

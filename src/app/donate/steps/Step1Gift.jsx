"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useBranding } from "@/context/BrandingContext";
import { HeartIcon } from "@/components/common/SvgIcon";
import RisingHeart from "@/components/common/RisingHeart";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { fitSplit, applyManualAmount } from "@/utils/causeSplit";
import { validateGiftStep } from "@/utils/donationStepValidation";
import { computeDonationProgressFromStorage } from "@/utils/donationFormProgress";
import StepLayout from "./StepComponents/StepLayout";
import CauseSelector from "./StepComponents/Step1components/CauseSelector";
import AmountSelector from "./StepComponents/Step2components/AmountSelector";
import RecurringSchedule from "./StepComponents/Step2components/RecurringSchedule";
import SectionStep from "./StepComponents/Step2components/SectionStep";
import AddOnsList from "./StepComponents/Step3components/AddOnsList";
import TippingSection from "./StepComponents/Step3components/TippingSection";
import { useGiftAmountSchedule } from "./StepComponents/useGiftAmountSchedule";
import { useCampaignAddOns } from "./StepComponents/useCampaignAddOns";
import { resolveFirstInstallment } from "./StepComponents/firstPayment";
import { apiRequest } from "@/services/api";

const PAYMENT_TYPES = [
  { value: "one-time",  label: "One-time" },
  { value: "recurring", label: "Recurring" },
];

const Step1Gift = ({ campaignSlug }) => {
  const searchParams = useSearchParams();
  const { data, update } = useDonation();
  const { primaryColor, donationPrimaryColor } = useBranding();
  const { handleNext } = useStepNavigation();
  const [error, setError] = useState("");

  /* The heart floats from the Recurring option when that option is picked. */
  const recurringHeartRef = useRef(null);
  const risingHeartFrame = useRef(null);
  const risingHeartTimer = useRef(null);
  const risingHeartCount = useRef(0);
  const [risingHeart, setRisingHeart] = useState(null);

  useEffect(
    () => () => {
      if (risingHeartFrame.current) window.cancelAnimationFrame(risingHeartFrame.current);
      if (risingHeartTimer.current) window.clearTimeout(risingHeartTimer.current);
    },
    [],
  );

  const {
    isPreview,
    isEditMode,
    paymentType,
    isRecurring,
    allowRecurring,
    allowRecurringSplit,
    sym,
    currencyOptions,
    suggestedAmounts,
    suggestedAmountsData,
    currenciesWithRates,
    minDonation,
    maxDonation,
    recurringPresets,
    campaignEndDate,
    defaultPresetId,
    initAmount,
    effectiveAmount,
    amountError,
    handleAmountChange,
    handlePaymentTypeChange,
    occurrences,
    splitMode,
    splitModes,
    handleSplitModeChange,
    scheduleState,
    handleScheduleChange,
    resolvedAmountDollars,
    perDateTotal,
    defaultPerDate,
    makeUpMissedDates,
    causeLabelById,
  } = useGiftAmountSchedule();

  const {
    campaignAddOns,
    addOnEnabled,
    setAddOnEnabled,
    addOnInputs,
    updateAddOnInput,
  } = useCampaignAddOns();

  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);
  const goalsDatesCompleted = Boolean(campaignMeta.sectionsCompleted?.goalsDates);
  const enableTipping = isPreview
    ? (goalsDatesCompleted ? Boolean(campaignMeta.goalsDates?.enableTipping) : false)
    : (campaignMeta.goalsDates?.enableTipping ?? true);

  // The platform support slider lives here, beside the amount it is a percentage of.
  const [tipSettings, setTipSettings] = useState(null);
  const [tipPct, setTipPctState] = useState(data.tipPct ?? 10);
  const [customTipAmount, setCustomTipAmountState] = useState(data.customTipAmount ?? "");
  const tipWasRestored = useRef(data.tipPct !== undefined && data.tipPct !== null);
  const tipTouched = useRef(false);

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

  // Start on the admin's default percentage, unless the donor already chose one.
  useEffect(() => {
    if (!tipSettings || tipWasRestored.current || tipTouched.current) return;
    const pct = Number(tipSettings.defaultPercent);
    if (!Number.isFinite(pct)) return;
    const min = Number.isFinite(Number(tipSettings.minPercent)) ? Number(tipSettings.minPercent) : 0;
    const max = Number.isFinite(Number(tipSettings.maxPercent)) ? Number(tipSettings.maxPercent) : 15;
    setTipPctState(Math.min(max, Math.max(min, Math.round(pct))));
  }, [tipSettings]);

  useEffect(() => {
    if (!tipSettings) return;
    const min = Number.isFinite(Number(tipSettings.minPercent)) ? Number(tipSettings.minPercent) : 0;
    const max = Number.isFinite(Number(tipSettings.maxPercent)) ? Number(tipSettings.maxPercent) : 15;
    setTipPctState((prev) => Math.min(max, Math.max(min, prev)));
  }, [tipSettings]);

  useEffect(() => {
    update({ tipPct, customTipAmount });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipPct, customTipAmount]);

  const handleTipPctChange = (next) => {
    tipTouched.current = true;
    setTipPctState(next);
  };
  const handleCustomTipChange = (next) => {
    setCustomTipAmountState(next);
  };

  const tipBasis = isRecurring
    ? resolveFirstInstallment({
        isRecurring,
        scheduleType: data.scheduleType,
        scheduleConfig: data.scheduleConfig,
        amountTier: defaultPerDate,
      }).base
    : effectiveAmount;

  // Campaign context (id, title, zakat flag) comes from the form config written by
  // CampaignConfigLoader or the admin preview.
  useEffect(() => {
    const campaign = campaignSlug ?? searchParams.get("campaign");
    const amount   = searchParams.get("amount");
    const currency = searchParams.get("currency");

    let campaignId    = null;
    let zakatEligible = false;
    let campaignTitle = "";
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      campaignId    = meta.id            ?? null;
      zakatEligible = meta.zakatEligible ?? false;
      campaignTitle = meta.name          ?? "";
    } catch {}

    if (campaign) {
      update({
        campaignId,
        campaign,
        zakatEligible,
        campaignTitle,
        ...(amount   && { amount }),
        ...(currency && { currency }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const causes = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return (meta.causes ?? []).map((c) => ({
        id:            c.id,
        label:         c.name,
        desc:          c.description ?? "",
        emoji:         c.iconEmoji   ?? "",
        zakatEligible: c.zakatEligible ?? false,
      }));
    } catch { return []; }
  }, []);

  const selectedCauseIds = data.causeIds ?? [];
  const causeSplit       = data.causeSplit ?? {};

  const toggleCause = (cause) => {
    const isSelected = selectedCauseIds.includes(cause.id);
    const nextIds = isSelected
      ? selectedCauseIds.filter((id) => id !== cause.id)
      : [...selectedCauseIds, cause.id];
    update({
      causeIds: nextIds,
      causes: isSelected
        ? (data.causes ?? []).filter((l) => l !== cause.label)
        : [...(data.causes ?? []), cause.label],
      causeSplit: fitSplit({ causeIds: nextIds }),
    });
    setError("");
  };

  const handleSplitChange = (causeId, amount) => {
    if (effectiveAmount <= 0) return;
    // Only the edited cause moves — every other cause is left exactly as it is. Step 1
    // blocks advancing if the amounts no longer add up to the donation.
    const { causeSplit: nextSplit } = applyManualAmount({
      causeIds: selectedCauseIds,
      causeSplit,
      editedId: causeId,
      amount,
      total: effectiveAmount,
    });
    update({ causeSplit: nextSplit });
    setError("");
  };

  const handleResetSplit = () => {
    update({ causeSplit: fitSplit({ causeIds: selectedCauseIds }) });
    setError("");
  };

  const validateAndNext = () => {
    if (amountError) return;

    let giftError = null;
    if (!isPreview && !isEditMode) {
      giftError = validateGiftStep({
        amount:            effectiveAmount,
        isRecurring,
        allowRecurring,
        currency:          data.currency ?? "USD",
        allowedCurrencies: currencyOptions.map((opt) => opt.value),
        scheduleType:      scheduleState.scheduleType,
        scheduleConfig:    scheduleState.scheduleConfig,
        campaignEndDate,
        makeUpMissedDates,
        causeIds:          selectedCauseIds,
        causesCount:       causes.length,
        causeSplit,
        totalAmount:       effectiveAmount,
        sym,
      });
    } else if (causes.length > 0 && selectedCauseIds.length === 0) {
      giftError = "Please select at least one cause.";
    }

    if (giftError) {
      setError(giftError);
      return;
    }

    setError("");
    const progress = computeDonationProgressFromStorage({
      ...data,
      donorAmount: effectiveAmount,
      amountTier: defaultPerDate,
      paymentType,
    });
    update({ progressPercent: progress.percent });
    handleNext(2);
  };

  function handlePaymentType(type) {
    const startingRecurring = type.value === "recurring" && paymentType !== "recurring";

    handlePaymentTypeChange(type.value);

    if (!startingRecurring) return;

    // Wait for the selected state to render, so the heart is measured where it
    // actually is after the recurring sections appear.
    if (risingHeartFrame.current) window.cancelAnimationFrame(risingHeartFrame.current);
    risingHeartFrame.current = window.requestAnimationFrame(() => {
      const rect = recurringHeartRef.current?.getBoundingClientRect();
      if (!rect) return;

      /* A new key each time, so picking Recurring again starts the float again. */
      risingHeartCount.current += 1;
      setRisingHeart({
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2,
        key: risingHeartCount.current,
      });

      if (risingHeartTimer.current) window.clearTimeout(risingHeartTimer.current);
      risingHeartTimer.current = window.setTimeout(() => setRisingHeart(null), 3900);
    });
  }

  return (
    <StepLayout
      step={1}
      title="Your gift"
      subtitle="Choose your cause, how often you give, the amount, and any extra gifts"
      onNext={validateAndNext}
      nextLabel="Continue"
    >
      <div className="flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SectionStep num={1} title="Donation Amount & Cause" />
            <select
              value={data.currency ?? "USD"}
              onChange={(e) => update({ currency: e.target.value })}
              disabled={isEditMode}
              className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-medium outline-none transition-colors ${
                isEditMode
                  ? "border-[#E5E5E5] bg-[#F9FAFB] text-[#9CA3AF] cursor-not-allowed"
                  : "border-[#E5E5E5] bg-white text-[#383838] focus:border-[#EA3335] cursor-pointer"
              }`}
            >
              {currencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <AmountSelector
            suggestedAmounts={suggestedAmounts}
            suggestedAmountsData={suggestedAmountsData}
            currenciesWithRates={currenciesWithRates}
            minDonation={minDonation}
            maxDonation={maxDonation}
            currency={data.currency ?? "USD"}
            isRecurring={isRecurring}
            splitMode={splitMode}
            occurrences={occurrences}
            initialAmount={initAmount}
            onAmountChange={handleAmountChange}
            overrideTotal={perDateTotal}
            feeSlot={
              enableTipping ? (
                <TippingSection
                  sym={sym}
                  baseDonation={tipBasis}
                  tipPct={tipPct}
                  setTipPct={handleTipPctChange}
                  customTipAmount={customTipAmount}
                  setCustomTipAmount={handleCustomTipChange}
                  label={tipSettings?.label}
                  description={tipSettings?.description}
                  minPercent={tipSettings?.minPercent}
                  maxPercent={tipSettings?.maxPercent}
                  embedded
                />
              ) : null
            }
          />
        </div>

        <CauseSelector
          causes={causes}
          selectedCauseIds={selectedCauseIds}
          toggleCause={toggleCause}
          causeSplit={causeSplit}
          totalAmount={effectiveAmount}
          sym={sym}
          onSplitChange={handleSplitChange}
          onResetSplit={handleResetSplit}
        />

        {allowRecurring && (
          <div className="flex flex-col gap-3">
            <SectionStep num={2} title="How would you like to give?" />
            <div className="relative flex rounded-full bg-[#F5F5F5] p-1">
              <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[#EA3335] transition-transform duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)] ${
                  isRecurring ? "translate-x-full" : "translate-x-0"
                }`}
              />

              {PAYMENT_TYPES.map((type) => {
                const active = paymentType === type.value;
                const locked = isEditMode && type.value === "one-time";
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handlePaymentType(type)}
                    disabled={locked}
                    aria-pressed={active}
                    className={`relative z-10 flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[0.875rem] font-semibold whitespace-nowrap transition-colors ${
                      locked
                        ? "opacity-40 cursor-not-allowed"
                        : active
                        ? "text-white cursor-pointer"
                        : "text-[#383838] hover:text-[#EA3335] cursor-pointer"
                    }`}
                  >
                    {type.value === "recurring" && (
                      <span
                        ref={recurringHeartRef}
                        className={`inline-flex shrink-0 origin-center ${active ? "hc-heartbeat" : "text-[#8C8C8C]"}`}
                      >
                        {HeartIcon}
                      </span>
                    )}
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isRecurring && (
          <>
            {allowRecurringSplit && (
              <div className="flex flex-col gap-3">
                <SectionStep num={3} title="How to split?" />
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {splitModes.map((mode) => {
                    const active = splitMode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => handleSplitModeChange(mode.value)}
                        className={`w-full sm:flex-1 flex items-center gap-3.5 rounded-2xl px-4 sm:px-5 py-4 border text-left transition-all duration-200 cursor-pointer min-h-[84px] ${
                          active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-[#383838] leading-snug">{mode.title}</p>
                          <p className="text-[12px] text-[#737373] mt-0.5 font-medium tabular-nums break-words">{mode.example}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <SectionStep num={allowRecurringSplit ? 4 : 3} title="Choose a schedule" />
              <RecurringSchedule
                sym={sym}
                effectiveAmount={defaultPerDate}
                resolvedAmounts={resolvedAmountDollars}
                splitMode={splitMode}
                initialScheduleType={data.scheduleType}
                initialConfig={data.scheduleConfig}
                initialActivePreset={data.schedulePreset}
                initialMakeUpMissedDates={data.makeUpMissedDates}
                defaultPresetId={defaultPresetId}
                apiPresets={recurringPresets}
                causeSplit={causeSplit}
                causeLabelById={causeLabelById}
                campaignEndDate={isEditMode ? null : campaignEndDate}
                onChange={handleScheduleChange}
              />
            </div>
          </>
        )}

        {campaignAddOns.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionStep num={5} title="Add-ons / special giving" />
            <p className="text-[12px] text-[#737373] -mt-1">
              These are additional gifts. Each one is added on top of your donation and sent to its own fund.
            </p>
            <AddOnsList
              campaignAddOns={campaignAddOns}
              sym={sym}
              addOnEnabled={addOnEnabled}
              setAddOnEnabled={setAddOnEnabled}
              addOnInputs={addOnInputs}
              updateAddOnInput={updateAddOnInput}
            />
          </div>
        )}

        {error && <p className="text-red-600 text-[13px]">{error}</p>}

      </div>

      {risingHeart ? (
        <RisingHeart
          trigger={risingHeart.key}
          left={risingHeart.left}
          top={risingHeart.top}
          color={donationPrimaryColor || primaryColor}
        />
      ) : null}
    </StepLayout>
  );
};

export default Step1Gift;

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { useDonation } from "@/context/DonationContext";
import { HeartIcon } from "@/components/common/SvgIcon";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { fitSplit, applyManualAmount } from "@/utils/causeSplit";
import { validateGiftStep } from "@/utils/donationStepValidation";
import StepLayout from "./StepComponents/StepLayout";
import CauseSelector from "./StepComponents/Step1components/CauseSelector";
import AmountSelector from "./StepComponents/Step2components/AmountSelector";
import RecurringSchedule from "./StepComponents/Step2components/RecurringSchedule";
import SectionStep from "./StepComponents/Step2components/SectionStep";
import AddOnsList from "./StepComponents/Step3components/AddOnsList";
import { useGiftAmountSchedule } from "./StepComponents/useGiftAmountSchedule";
import { useCampaignAddOns } from "./StepComponents/useCampaignAddOns";

const PAYMENT_TYPES = [
  { value: "one-time",  label: "One-time payment",  desc: (amt, sym) => `Pay the full amount of ${sym}${amt} today` },
  { value: "recurring", label: "Recurring payments", desc: () => "Split your donation into scheduled payments" },
];

const CONFETTI_COLORS = ["#EA3335", "#FF6B35", "#FFD700", "#00C853", "#2196F3", "#9C27B0"];

const Step1Gift = ({ campaignSlug }) => {
  const searchParams = useSearchParams();
  const { data, update } = useDonation();
  const { handleNext } = useStepNavigation();
  const [error, setError] = useState("");

  const {
    isPreview,
    isEditMode,
    paymentType,
    isRecurring,
    allowRecurring,
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

  const onPaymentTypeChange = (value) => {
    if (value === "recurring") {
      confetti({ particleCount: 90, angle: 60, spread: 70, startVelocity: 50, origin: { x: 0, y: 0.65 }, colors: CONFETTI_COLORS });
      confetti({ particleCount: 90, angle: 120, spread: 70, startVelocity: 50, origin: { x: 1, y: 0.65 }, colors: CONFETTI_COLORS });
    }
    handlePaymentTypeChange(value);
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
    handleNext(2);
  };

  return (
    <StepLayout
      step={1}
      title="Your gift"
      subtitle="Choose your cause, how often you give, the amount, and any extra gifts"
      onNext={validateAndNext}
      nextLabel="Continue"
    >
      <div className="flex flex-col gap-6">

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

        <div className="flex flex-col gap-3">
          <SectionStep num={2} title="How would you like to give?" />
          <div className="flex flex-col sm:flex-row gap-2.5">
            {PAYMENT_TYPES.filter((t) => t.value === "one-time" || allowRecurring).map((type) => {
              const active = paymentType === type.value;
              const locked = isEditMode && type.value === "one-time";
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={locked ? undefined : () => onPaymentTypeChange(type.value)}
                  className={`w-full sm:flex-1 flex items-center gap-3.5 rounded-2xl px-4 sm:px-5 py-4 border text-left transition-all duration-200 ${
                    locked
                      ? "border-[#E5E5E5] bg-white opacity-40 cursor-not-allowed"
                      : active
                      ? "border-[#EA3335] bg-[#FFF5F5] cursor-pointer"
                      : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40 cursor-pointer"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-[#EA3335]" : "border-[#CCCCCC]"
                  }`}>
                    {active && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 text-[15px] font-semibold text-[#383838] leading-snug">
                      {type.label}
                      {type.value === "recurring" && (
                        <span className={`inline-flex shrink-0 ${active ? "text-[#EB3336]" : "text-[#CCCCCC]"}`}>
                          {HeartIcon}
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-[#737373] mt-0.5">{type.desc(effectiveAmount, sym)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SectionStep num={3} title="Donation Amount" />
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
          />
        </div>

        {isRecurring && (
          <>
            <div className="flex flex-col gap-3">
              <SectionStep num={4} title="How to split?" />
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

            <div className="flex flex-col gap-3">
              <SectionStep num={5} title="Choose a schedule" />
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
            <SectionStep num={6} title="Add-ons / special giving" />
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
    </StepLayout>
  );
};

export default Step1Gift;

"use client";

import { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { usePathname } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { HeartIcon } from "@/components/common/SvgIcon";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout        from "./StepComponents/StepLayout";
import countOccurrences, { generateDatesInRange } from "./StepComponents/countOccurrences";
import RecurringSchedule from "./StepComponents/Step2components/RecurringSchedule";
import AmountSelector    from "./StepComponents/Step2components/AmountSelector";
import SectionStep from "./StepComponents/Step2components/SectionStep";
import { validateAmountScheduleStep } from "@/utils/donationStepValidation";
import { earliestAllowedDateStr } from "@/utils/scheduleDateLimits";
import { resolveScheduleAmounts, toCents, fromCents } from "@/utils/money";

const PAYMENT_TYPES = [
  { value: "one-time",  label: "One-time payment",  desc: (amt, sym) => `Pay the full amount of ${sym}${amt} today` },
  { value: "recurring", label: "Recurring payments", desc: () => "Split your donation into scheduled payments" },
];

const CONFETTI_COLORS = ["#EA3335", "#FF6B35", "#FFD700", "#00C853", "#2196F3", "#9C27B0"];

const Step2Payment = () => {
  const pathname = usePathname();
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const isEditMode = useMemo(() => {
    try {
      return Boolean(JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").isEditMode);
    } catch { return false; }
  }, []);

  const { suggestedAmounts, suggestedAmountsData, allowRecurring, minDonation, maxDonation, recurringPresets, currenciesWithRates, campaignEndDate } = useMemo(() => {
    const fallbackPreview = { suggestedAmounts: [], suggestedAmountsData: [], allowRecurring: false, minDonation: 0, maxDonation: undefined, recurringPresets: [], currenciesWithRates: [] };
    const fallbackDefault = { suggestedAmounts: [25, 50, 100], suggestedAmountsData: [], allowRecurring: true, minDonation: 1, maxDonation: undefined, recurringPresets: [], currenciesWithRates: [] };
    try {
      const meta       = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      const goalsDates = meta.goalsDates ?? {};
      const completed  = Boolean(meta.sectionsCompleted?.goalsDates);

      if (isPreview && !completed) return fallbackPreview;

      const suggestedRaw = meta.suggestedAmounts;
      const suggestedList = Array.isArray(suggestedRaw) ? suggestedRaw : [];
      const normalizedSuggested = suggestedList
        .map((x) => (typeof x === "number" ? x : Number(x?.value ?? x)))
        .filter((n) => Number.isFinite(n) && n > 0);

      return {
        suggestedAmounts:    normalizedSuggested.length ? normalizedSuggested : (isPreview ? [] : [25, 50, 100]),
        suggestedAmountsData: Array.isArray(meta.suggestedAmountsData) ? meta.suggestedAmountsData : [],
        allowRecurring:      goalsDates.allowRecurringDonations ?? true,
        minDonation:         goalsDates.minimumDonation         ?? (isPreview ? 0 : 1),
        maxDonation:         goalsDates.maximumDonation         ?? undefined,
        recurringPresets:    (goalsDates.recurringPresets ?? [])
          .filter((p) => p.enabled)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        currenciesWithRates: meta.currenciesWithRates ?? [],
        campaignEndDate:     goalsDates.endAt ?? meta.endAt ?? null,
      };
    } catch {
      return isPreview ? fallbackPreview : fallbackDefault;
    }
  }, [isPreview]);

  // recurringPresets already excludes disabled ones, so a default on a disabled preset is ignored.
  const defaultPresetId = recurringPresets.find((p) => p.isDefault === true)?.id ?? null;

  useEffect(() => {
    if (!allowRecurring && data.paymentType === "recurring") update({ paymentType: "one-time" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowRecurring]);

  const paymentType = data.paymentType ?? "one-time";
  const isRecurring = paymentType === "recurring";
  // donorAmount = the UI-facing total the user chose (restored on back-navigation).
  // amountTier  = the derived per-date amount (e.g. $50÷4 = $12.5) — NOT suitable
  //               for restoring the amount field because it would show the divided value.
  const _donorAmt   = data.donorAmount && Number.isFinite(data.donorAmount) ? data.donorAmount : null;
  const _urlAmt     = data.amount && Number.isFinite(Number(data.amount)) ? Number(data.amount) : null;
  const initAmount  = _donorAmt ?? _urlAmt ?? suggestedAmounts[0] ?? (isPreview ? 0 : 25);
  const _currSymbols = { USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$", SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥" };
  const sym          = _currSymbols[data.currency ?? "USD"] ?? (data.currency ?? "$");

  const causeSplit = data.causeSplit ?? {};
  const causeLabelById = Object.fromEntries(
    (data.causeIds ?? []).map((id, i) => [id, data.causes?.[i] ?? id])
  );

  const currencyOptions = useMemo(() => {
    if (currenciesWithRates?.length) {
      return currenciesWithRates.map(({ currency: code }) => ({
        label: `${code} (${_currSymbols[code] ?? code})`,
        value: code,
      }));
    }
    const cur = data.currency ?? "USD";
    return [{ label: `${cur} (${_currSymbols[cur] ?? cur})`, value: cur }];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currenciesWithRates, data.currency]);

  const initOccurrences = useMemo(() => {
    const sc = data.scheduleConfig;
    if (!sc || !isRecurring) return 1;
    if (data.scheduleType === "specific_dates") return sc.dates?.length ?? 1;
    return countOccurrences(sc.startDate?.split("T")[0], sc.endDate?.split("T")[0], sc.frequency ?? "daily", sc.customInterval ?? 1, sc.daysOfWeek ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Occurrences that are NOT make-up (i.e. dated today or later). Divide mode splits the donor's
  // amount across these only, so the per-date amount is unchanged by make-up (the total grows).
  const initRemainingOccurrences = useMemo(() => {
    const sc = data.scheduleConfig;
    if (!sc || !isRecurring) return 1;
    const minStr = earliestAllowedDateStr();
    if (data.scheduleType === "specific_dates") {
      const future = (sc.dates ?? []).filter((d) => String(d).split("T")[0] >= minStr);
      return future.length || (sc.dates?.length ?? 1);
    }
    const all = generateDatesInRange(sc.startDate?.split("T")[0], sc.endDate?.split("T")[0], sc.frequency ?? "daily", sc.customInterval ?? 1, sc.daysOfWeek ?? []);
    const future = all.filter((d) => d >= minStr);
    return future.length || all.length || 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [effectiveAmount, setEffectiveAmount] = useState(initAmount);
  const [amountError,     setAmountError]     = useState(false);
  const [stepError,       setStepError]       = useState("");
  const [occurrences,     setOccurrences]     = useState(isRecurring ? initOccurrences : 1);
  const [remainingOccurrences, setRemainingOccurrences] = useState(isRecurring ? initRemainingOccurrences : 1);
  const [makeUpMissedDates, setMakeUpMissedDates] = useState(Boolean(data.makeUpMissedDates));
  const [splitMode,       setSplitMode]       = useState(data.splitMode ?? "repeat");
  const [activePreset,    setActivePreset]    = useState(data.schedulePreset ?? "custom");
  const [scheduleState,   setScheduleState]   = useState({
    scheduleType:   data.scheduleType   ?? "specific_dates",
    scheduleConfig: data.scheduleConfig ?? {},
  });

  // Per-date default amount based on split mode. Divide splits across the NON-make-up dates only,
  // so ticking make-up keeps the per-date amount and grows the total (rather than shrinking it).
  const divideDenominator = remainingOccurrences > 0 ? remainingOccurrences : (occurrences > 0 ? occurrences : 1);
  const defaultPerDate = isRecurring && splitMode === "divide"
    ? Math.floor((effectiveAmount / divideDenominator) * 100) / 100
    : effectiveAmount;

  // Every date of the schedule, in order.
  const scheduleDates = useMemo(() => {
    if (!isRecurring) return [];
    const config = scheduleState.scheduleConfig ?? {};
    if (scheduleState.scheduleType === "specific_dates") {
      return (config.dates ?? []).map((d) => String(d).split("T")[0]);
    }
    const start = config.startDate?.split("T")[0];
    const end = config.endDate?.split("T")[0];
    if (!start || !end) return [];
    return generateDatesInRange(start, end, config.frequency ?? "daily", config.customInterval ?? 1, config.daysOfWeek ?? []);
  }, [isRecurring, scheduleState]);

  // Past (make-up) dates are charged at the full default and are not part of the split, so the
  // commitment grows instead of the per-date amount shrinking.
  const minDateKey = useMemo(() => earliestAllowedDateStr(), []);
  const { splitDates, fixedAmounts, committedCents } = useMemo(() => {
    const overrides = scheduleState.scheduleConfig?.dateAmounts ?? {};
    const past = scheduleDates.filter((d) => d < minDateKey);
    const future = scheduleDates.filter((d) => d >= minDateKey);
    const fixed = {};
    past.forEach((d) => {
      const raw = overrides[d];
      const hasOverride = raw !== undefined && raw !== null && String(raw).trim() !== "" && Number.isFinite(Number(raw));
      fixed[d] = toCents(hasOverride ? raw : defaultPerDate);
    });

    // Divide mode: the donor typed the TOTAL, so that is the commitment. Repeat mode: the typed
    // per-date amount is the commitment, so the total is per-date x dates.
    const committed = splitMode === "divide"
      ? toCents(effectiveAmount)
      : toCents(defaultPerDate) * (future.length || 1);

    return { splitDates: future, fixedAmounts: fixed, committedCents: committed };
  }, [scheduleDates, scheduleState.scheduleConfig?.dateAmounts, minDateKey, defaultPerDate, splitMode, effectiveAmount]);

  // The single source of truth for what each date is charged: the donor's edits are kept and the
  // cent remainder lands on the LAST un-edited date, so the schedule always sums exactly.
  const { amounts: resolvedAmountCents, totalCents: perDateTotalCents } = useMemo(
    () =>
      resolveScheduleAmounts({
        dates: splitDates,
        overrides: scheduleState.scheduleConfig?.dateAmounts ?? {},
        committedCents,
        fixed: fixedAmounts,
      }),
    [splitDates, scheduleState.scheduleConfig?.dateAmounts, committedCents, fixedAmounts]
  );

  const perDateTotal = isRecurring ? fromCents(perDateTotalCents) : null;

  // Same map as dollars, for display and for the submit payload.
  const resolvedAmountDollars = useMemo(() => {
    const out = {};
    Object.entries(resolvedAmountCents || {}).forEach(([date, cents]) => {
      out[date] = fromCents(cents);
    });
    return out;
  }, [resolvedAmountCents]);

  // Sync local state to context in real-time
  useEffect(() => {
    update({
      donorAmount:      effectiveAmount,
      amountTier:       defaultPerDate,
      splitMode:        isRecurring ? splitMode : undefined,
      scheduleType:     isRecurring ? scheduleState.scheduleType   : undefined,
      scheduleConfig:   isRecurring ? scheduleState.scheduleConfig : undefined,
      schedulePreset:   isRecurring ? activePreset : undefined,
      installmentCount: isRecurring ? occurrences : 1,
      numberOfDays:     isRecurring ? occurrences : 1,
      makeUpMissedDates: isRecurring ? makeUpMissedDates : undefined,
      frequency:        isRecurring && scheduleState.scheduleType === "date_range"
        ? scheduleState.scheduleConfig?.frequency
        : undefined,
      perDateTotal: isRecurring && perDateTotal !== null ? perDateTotal : undefined,
      resolvedScheduleAmounts: isRecurring ? resolvedAmountDollars : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAmount, defaultPerDate, isRecurring, splitMode, scheduleState, occurrences, perDateTotal, activePreset, makeUpMissedDates]);

  const handleAmountChange = (amount, hasError) => {
    setEffectiveAmount(amount);
    setAmountError(hasError);
  };

  // Recurring is the outcome we want, so picking it gets a small celebration —
  // same two-cannon burst used on the add-ons step.
  const handlePaymentTypeChange = (value) => {
    if (value === "recurring") {
      confetti({ particleCount: 90, angle: 60, spread: 70, startVelocity: 50, origin: { x: 0, y: 0.65 }, colors: CONFETTI_COLORS });
      confetti({ particleCount: 90, angle: 120, spread: 70, startVelocity: 50, origin: { x: 1, y: 0.65 }, colors: CONFETTI_COLORS });
    }
    update({ paymentType: value });
  };

  const handleScheduleChange = ({
    scheduleType,
    scheduleConfig,
    occurrences: occ,
    remainingOccurrences: remOcc,
    makeUpMissedDates: mk,
    activePreset: preset,
  }) => {
    setOccurrences(occ);
    if (remOcc !== undefined) setRemainingOccurrences(remOcc);
    if (mk !== undefined) setMakeUpMissedDates(Boolean(mk));
    setScheduleState({ scheduleType, scheduleConfig });
    if (preset !== undefined) setActivePreset(preset);
    setStepError("");
  };

  // Amount + recurring schedule rules live on this step, so an invalid amount,
  // currency or schedule never surfaces on a later step.
  const validateStep = () => validateAmountScheduleStep({
    amount:           effectiveAmount,
    isRecurring,
    allowRecurring,
    currency:         data.currency,
    allowedCurrencies: currencyOptions.map((opt) => opt.value),
    scheduleType:     scheduleState.scheduleType,
    scheduleConfig:   scheduleState.scheduleConfig,
    campaignEndDate,
    makeUpMissedDates,
  });

  const handleSplitModeChange = (val) => {
    setSplitMode(val);
    // Switching to divide clears any per-date overrides so the new per-date
    // default (total ÷ count) applies evenly to all dates.
    if (val === "divide") {
      setScheduleState((prev) => ({
        ...prev,
        scheduleConfig: { ...prev.scheduleConfig, dateAmounts: {} },
      }));
    }
  };

  // Dynamic example text for split mode cards
  const safeOcc = occurrences > 0 ? occurrences : 1;
  // Use perDateTotal (actual sum including per-date overrides) when available,
  // otherwise fall back to the simple formula total.
  const repeatDisplayTotal = perDateTotal !== null
    ? perDateTotal
    : effectiveAmount * occurrences;

  // Round to 2 decimal places for display to avoid JavaScript float imprecision
  // (e.g. 132.02 - 22 - 10 = 100.02000000000001).
  const fmtAmt = (n) => Number.isFinite(n) ? Number(n.toFixed(2)) : 0;

  const splitModes = [
    {
      value:   "divide",
      title:   "Divide total across dates",
      example: occurrences > 1
        ? `${sym}${fmtAmt(effectiveAmount)} ÷ ${occurrences} = ${sym}${(effectiveAmount / safeOcc).toFixed(2)}/date`
        : "Select dates to see per-date amount",
    },
    {
      value:   "repeat",
      title:   "Pay this amount each date",
      example: occurrences > 1
        ? `${sym}${fmtAmt(effectiveAmount)} × ${occurrences} = ${sym}${fmtAmt(repeatDisplayTotal).toLocaleString()} total`
        : `${sym}${fmtAmt(effectiveAmount)} per scheduled date`,
    },
  ];

  return (
    <StepLayout
      step={2}
      title="Payment"
      subtitle="Choose your amount and payment schedule"
      onNext={() => {
        if (amountError) return;
        // Admin preview and schedule-edit never hit the split-submit endpoint
        // (edit reschedules an existing plan), so the API-aligned rules must not
        // block stepping through them.
        const stepErr = (isPreview || isEditMode) ? null : validateStep();
        if (stepErr) {
          setStepError(stepErr);
          return;
        }
        setStepError("");
        update({
          paymentType,
          currency:         data.currency ?? "USD",
          amountTier:       defaultPerDate,
          splitMode:        isRecurring ? splitMode : undefined,
          scheduleType:     isRecurring ? scheduleState.scheduleType   : undefined,
          scheduleConfig:   isRecurring ? scheduleState.scheduleConfig : undefined,
          installmentCount: isRecurring ? occurrences : 1,
          numberOfDays:     isRecurring ? occurrences : 1,
          frequency:        isRecurring && scheduleState.scheduleType === "date_range"
            ? scheduleState.scheduleConfig?.frequency
            : undefined,
          perDateTotal: isRecurring && perDateTotal !== null ? perDateTotal : undefined,
        });
        handleNext(3);
      }}
      onPrev={() => handlePrev(1)}
      prevLabel="Back"
      nextLabel="Add-ons"
    >
      <div className="flex flex-col gap-6">

        {/* ── Step 1: Donation Amount ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SectionStep num={1} title="Donation Amount" />
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

        {/* ── Step 2: Payment mode ── */}
        <div className="flex flex-col gap-3">
          <SectionStep num={2} title="How would you like to pay?" />
          <div className="flex flex-col sm:flex-row gap-2.5">
            {PAYMENT_TYPES.filter((t) => t.value === "one-time" || allowRecurring).map((type) => {
              const active = paymentType === type.value;
              const locked = isEditMode && type.value === "one-time";
              return (
                <button
                  key={type.value}
                  onClick={locked ? undefined : () => handlePaymentTypeChange(type.value)}
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
                    <p className="flex items-center gap-1.5 text-[15px] font-semibold text-[#383838] leading-snug">
                      {type.value === "recurring" && (
                        <span className={`inline-flex shrink-0 ${active ? "text-[#EA3335]" : "text-[#CCCCCC]"}`}>
                          {HeartIcon}
                        </span>
                      )}
                      {type.label}
                    </p>
                    <p className="text-[12px] text-[#737373] mt-0.5">{type.desc(effectiveAmount, sym)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {isRecurring && (
          <>
            {/* ── Step 3: How to split ── */}
            <div className="flex flex-col gap-3">
              <SectionStep num={3} title="How to split?" />
              <div className="flex flex-col sm:flex-row gap-2.5">
                {splitModes.map((mode) => {
                  const active = splitMode === mode.value;
                  return (
                    <button
                      key={mode.value}
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

            {/* ── Step 4: Choose a schedule ── */}
            <div className="flex flex-col gap-3">
              <SectionStep num={4} title="Choose a schedule" />
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

        {stepError && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {stepError}
          </p>
        )}

      </div>
    </StepLayout>
  );
};

export default Step2Payment;

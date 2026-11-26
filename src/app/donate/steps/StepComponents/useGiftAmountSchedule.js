"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import countOccurrences, { generateDatesInRange } from "./countOccurrences";
import { earliestAllowedDateStr } from "@/utils/scheduleDateLimits";
import { resolveScheduleAmounts, toCents, fromCents } from "@/utils/money";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$",
  SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥",
};

// Amount, currency and schedule state for the "Your gift" step. Lifted out of the
// screen so Step1Gift stays readable. The old Step 2 logic is kept the same.
//
// The query string may carry settings. They behave like UTM parameters: anything that
// matches a real option is selected, anything that does not is ignored but left in the
// URL. Unknown values never block the form.
//   amount        a preset amount, or any number within the form's limits
//   currency      a currency the form accepts
//   paymentType   "one-time" | "recurring"
//   cause         a cause name on this form
//
// They are passed in, not read from window.location, because on a client-side
// navigation window.location still holds the previous URL when this hook first runs.
export function useGiftAmountSchedule({
  urlAmount,
  urlPaymentType,
} = {}) {
  const pathname = usePathname();
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const { data, update } = useDonation();

  const isEditMode = useMemo(() => {
    try {
      return Boolean(JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").isEditMode);
    } catch { return false; }
  }, []);

  const {
    suggestedAmounts, suggestedAmountsData, allowRecurring, allowRecurringSplit, allowCustomRecurringSchedule,
    minDonation, maxDonation, recurringPresets, currenciesWithRates, campaignEndDate,
  } = useMemo(() => {
    const fallbackPreview = { suggestedAmounts: [], suggestedAmountsData: [], allowRecurring: false, allowRecurringSplit: true, allowCustomRecurringSchedule: true, minDonation: 0, maxDonation: undefined, recurringPresets: [], currenciesWithRates: [] };
    const fallbackDefault = { suggestedAmounts: [25, 50, 100], suggestedAmountsData: [], allowRecurring: true, allowRecurringSplit: true, allowCustomRecurringSchedule: true, minDonation: 1, maxDonation: undefined, recurringPresets: [], currenciesWithRates: [] };
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
        allowRecurringSplit: goalsDates.allowRecurringSplit     ?? true,
        allowCustomRecurringSchedule: goalsDates.allowCustomRecurringSchedule ?? true,
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

  const defaultPresetId = recurringPresets.find((p) => p.isDefault === true)?.id ?? null;

  // recurringPresets already excludes disabled ones, so a default on a disabled preset is ignored.
  useEffect(() => {
    if (!allowRecurring && data.paymentType === "recurring") update({ paymentType: "one-time" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowRecurring]);

  /*
    A link may carry paymentType/preset. They only count when the form actually allows
    recurring donations — an admin mistake must not block a donor, so we fall back to
    the donor's own choice instead of erroring.
  */
  const linkPaymentType = String(urlPaymentType || "").trim().toLowerCase();
  const wantsRecurringLink = allowRecurring && linkPaymentType === "recurring";

  /*
    The payment type is local state, seeded from the link so it is right on the very first
    render. Everything below (occurrence counts, per-date splits) depends on it, so applying
    the link in an effect afterwards would build the schedule for the wrong payment type.
    A donor's own click always wins after that.
  */
  const [paymentType, setPaymentType] = useState(() => {
    if (wantsRecurringLink) return "recurring";
    if (linkPaymentType === "one-time") return "one-time";
    return data.paymentType ?? "one-time";
  });
  const isRecurring = paymentType === "recurring";

  /*
    Query parameters outrank everything the session remembers: they are an explicit instruction
    for this visit. A value that is missing or unusable simply falls through to the defaults, so
    a donor can never be blocked by a bad link.
  */
  const _linkAmt = Number(urlAmount);
  const _hasLinkAmt = Number.isFinite(_linkAmt) && _linkAmt > 0;

  // donorAmount = the UI-facing total the user chose (restored on back-navigation).
  // amountTier  = the derived per-date amount (e.g. $50÷4 = $12.5) — NOT suitable
  //               for restoring the amount field because it would show the divided value.
  const _donorAmt   = data.donorAmount && Number.isFinite(data.donorAmount) ? data.donorAmount : null;
  const _urlAmt     = data.amount && Number.isFinite(Number(data.amount)) ? Number(data.amount) : null;
  const _adminDefaultAmt = Number(suggestedAmountsData.find((a) => a?.isDefault)?.value);
  const _fallbackAmt = Number.isFinite(_adminDefaultAmt) && _adminDefaultAmt > 0
    ? _adminDefaultAmt
    : suggestedAmounts[0] ?? 25;

  const initAmount  = _hasLinkAmt ? _linkAmt : (_donorAmt ?? _urlAmt ?? _fallbackAmt);
  const sym         = CURRENCY_SYMBOLS[data.currency ?? "USD"] ?? (data.currency ?? "$");

  const causeSplit = data.causeSplit ?? {};
  const causeLabelById = Object.fromEntries(
    (data.causeIds ?? []).map((id, i) => [id, data.causes?.[i] ?? id])
  );

  const currencyOptions = useMemo(() => {
    if (currenciesWithRates?.length) {
      return currenciesWithRates.map(({ currency: code }) => ({
        label: `${code} (${CURRENCY_SYMBOLS[code] ?? code})`,
        value: code,
      }));
    }
    const cur = data.currency ?? "USD";
    return [{ label: `${cur} (${CURRENCY_SYMBOLS[cur] ?? cur})`, value: cur }];
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
  /*
    "How to split?" only makes sense when the plan has a fixed number of payments to divide
    across. A form with no end date is open-ended — the donor commits to one payment at a time,
    so the choice is hidden and the mode is forced to "repeat" (pay this amount each date).
  */
  const hasEndDate = Boolean(campaignEndDate);
  const showSplitChoice = allowRecurringSplit && hasEndDate;

  const [occurrences,     setOccurrences]     = useState(isRecurring ? initOccurrences : 1);
  const [remainingOccurrences, setRemainingOccurrences] = useState(isRecurring ? initRemainingOccurrences : 1);
  const [makeUpMissedDates, setMakeUpMissedDates] = useState(Boolean(data.makeUpMissedDates));
  const [splitMode,       setSplitMode]       = useState(
    showSplitChoice ? (data.splitMode ?? "divide") : "repeat"
  );

  // A schedule restored from storage can carry "divide" from a form that had an end date. Once
  // the choice is hidden, the stored value must not quietly keep dividing the whole amount.
  useEffect(() => {
    if (!showSplitChoice && splitMode !== "repeat") setSplitMode("repeat");
  }, [showSplitChoice, splitMode]);
  // Restore a real stored choice only. "custom" is no longer a default, so a fresh visit
  // starts with nothing picked and the schedule dropdown asks the donor to choose.
  const [activePreset,    setActivePreset]    = useState(
    data.schedulePreset && data.schedulePreset !== "custom" ? data.schedulePreset : ""
  );
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

  // Sync local state to context in real-time. paymentType is included because Step 3 and the
  // summary read it from the context, and the link may have seeded it without a click.
  useEffect(() => {
    update({
      paymentType,
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
  }, [paymentType, effectiveAmount, defaultPerDate, isRecurring, splitMode, scheduleState, occurrences, perDateTotal, activePreset, makeUpMissedDates]);

  const handleAmountChange = (amount, hasError) => {
    setEffectiveAmount(amount);
    setAmountError(hasError);
  };

  const handleScheduleChange = ({
    scheduleType,
    scheduleConfig,
    occurrences: occ,
    remainingOccurrences: remOcc,
    makeUpMissedDates: mk,
    activePreset: preset,
    openEnded: openEndedNext,
  }) => {
    setOccurrences(occ);
    if (remOcc !== undefined) setRemainingOccurrences(remOcc);
    if (mk !== undefined) setMakeUpMissedDates(Boolean(mk));
    setScheduleState({ scheduleType, scheduleConfig });
    if (preset !== undefined) setActivePreset(preset);
    update({ openEnded: Boolean(openEndedNext) });
  };

  const handleSplitModeChange = (val) => {
    // Same guard as the render: with no end date the choice is not offered, so it cannot be set.
    if (!showSplitChoice && val !== "repeat") return;
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

  const handlePaymentTypeChange = (value) => {
    setPaymentType(value);
    update({ paymentType: value });
  };

  const splitModes = [
    ...(allowRecurringSplit
      ? [{
          value:   "divide",
          title:   "Divide total across dates",
          example: occurrences > 1
            ? `${sym}${Number(effectiveAmount.toFixed(2))} ÷ ${occurrences} = ${sym}${(effectiveAmount / Math.max(1, occurrences)).toFixed(2)}/date`
            : "Select dates to see per-date amount",
        }]
      : []),
    {
      value:   "repeat",
      title:   "Pay this amount each date",
      example: occurrences > 1
        ? `${sym}${Number(effectiveAmount.toFixed(2))} × ${occurrences} = ${sym}${Number(((perDateTotal ?? effectiveAmount * occurrences)).toFixed(2)).toLocaleString()} total`
        : `${sym}${Number(effectiveAmount.toFixed(2))} per scheduled date`,
    },
  ];

  return {
    isPreview,
    isEditMode,
    paymentType,
    isRecurring,
    allowRecurring,
    allowRecurringSplit,
    allowCustomRecurringSchedule,
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
    showSplitChoice,
    handleSplitModeChange,
    scheduleState,
    handleScheduleChange,
    resolvedAmountDollars,
    perDateTotal,
    defaultPerDate,
    makeUpMissedDates,
    causeLabelById,
  };
}

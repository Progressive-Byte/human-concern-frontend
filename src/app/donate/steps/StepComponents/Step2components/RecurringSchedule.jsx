"use client";

import { useState, useMemo, useEffect } from "react";
import countOccurrences, { generateDatesInRange } from "../countOccurrences";
import { buildConfig, resolveFreq, isPeriodFreq, periodStartFor, earliestPeriodStartFor } from "./scheduleUtils";
import { earliestAllowedDateStr } from "@/utils/scheduleDateLimits";
import SpecificDatesSection from "./SpecificDatesSection";
import DateRangeSection from "./DateRangeSection";
import PerDateAmountTable from "./PerDateAmountTable";

const weekdayOf = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d.getUTCDay();
};

const SCHEDULE_TYPES = [
  { value: "specific_dates", label: "Specific Dates" },
  { value: "date_range",     label: "Date Range" },
];

// Presets with these names open the editable form instead of applying a fixed config
const TEMPLATE_NAMES = new Set(["specific dates", "date range", "interval"]);
const isTemplate = (preset) => TEMPLATE_NAMES.has((preset?.name ?? "").toLowerCase().trim());

const RecurringSchedule = ({
  sym,
  effectiveAmount,
  splitMode,
  initialScheduleType,
  initialConfig,
  initialActivePreset,
  defaultPresetId = null,
  initialMakeUpMissedDates = false,
  apiPresets = [],
  causeSplit,
  causeLabelById,
  campaignEndDate = null,
  onChange,
}) => {
  // Earliest date the API accepts as a due date (now + lead time, at UTC midnight).
  const minDateStr = useMemo(() => earliestAllowedDateStr(), []);
  // A preset date strictly before today is "missed" (make-up eligible).
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [activePreset,   setActivePreset]   = useState(initialActivePreset ?? "custom");
  const [makeUpMissedDates, setMakeUpMissedDates] = useState(Boolean(initialMakeUpMissedDates));
  const [scheduleType,   setScheduleType]   = useState(initialScheduleType ?? "specific_dates");
  const [selectedDates,  setSelectedDates]  = useState(() =>
    (initialConfig?.dates ?? []).map((d) => d.split("T")[0])
  );
  const [dateAmounts,    setDateAmounts]    = useState(() => initialConfig?.dateAmounts ?? {});
  const [rangeStart,     setRangeStart]     = useState(initialConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,       setRangeEnd]       = useState(initialConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,      setRangeFreq]      = useState(initialConfig?.frequency ?? "daily");
  const [customInterval, setCustomInterval] = useState(initialConfig?.customInterval ?? 1);
  const [weekDays,       setWeekDays]       = useState(() =>
    Array.isArray(initialConfig?.daysOfWeek) ? initialConfig.daysOfWeek : []
  );

  // Weekly collects on at least one weekday; default to the start date's weekday.
  const effectiveWeekDays = useMemo(() => {
    if (rangeFreq !== "weekly") return [];
    if (weekDays.length) return weekDays;
    const d = weekdayOf(rangeStart);
    return d === null ? [] : [d];
  }, [rangeFreq, weekDays, rangeStart]);

  const hasPresets       = apiPresets.length > 0;
  const isCustom         = activePreset === "custom";
  const activeApiPreset  = apiPresets.find((p) => p.id === activePreset);
  const isTemplateActive = activeApiPreset ? isTemplate(activeApiPreset) : false;
  // Show full controls for: Custom pill, template presets, or no API presets at all
  const showFullControls = isCustom || isTemplateActive || !hasPresets;
  // Only snap monthly/yearly onto whole periods while the donor is editing the range. A
  // fixed admin preset keeps its exact anchor day (e.g. a monthly preset on the 15th).
  const anchorPeriods = showFullControls;

  // Monthly/yearly choose whole periods, so anchor them to the 1st. This keeps the month
  // picker, the dates table and the submitted config consistent, and guarantees the
  // submitted dates match the API generator without month-end clamping.
  const effRangeStart = useMemo(
    () => (anchorPeriods ? periodStartFor(rangeFreq, rangeStart) : rangeStart),
    [anchorPeriods, rangeFreq, rangeStart]
  );
  const effRangeEnd = useMemo(
    () => (anchorPeriods ? periodStartFor(rangeFreq, rangeEnd) : rangeEnd),
    [anchorPeriods, rangeFreq, rangeEnd]
  );

  const generatedDates = useMemo(
    () => scheduleType === "date_range"
      ? generateDatesInRange(effRangeStart, effRangeEnd, rangeFreq, customInterval, effectiveWeekDays)
      : [],
    [scheduleType, effRangeStart, effRangeEnd, rangeFreq, customInterval, effectiveWeekDays]
  );

  const activeDates = scheduleType === "date_range"
    ? generatedDates
    : [...selectedDates].sort();

  // Full date list a preset covers (past AND future), as YYYY-MM-DD keys.
  const fullPresetDates = (preset) => {
    if (!preset) return [];
    const cfg = preset.scheduleConfig && typeof preset.scheduleConfig === "object" ? preset.scheduleConfig : {};
    if (preset.scheduleType === "date_range") {
      const start = cfg.startDate?.split("T")[0] ?? "";
      const end = cfg.endDate?.split("T")[0] ?? "";
      const interval = cfg.intervalValue ?? 1;
      const freq = interval > 1 ? "custom" : (cfg.frequency ?? "daily");
      const days = freq === "weekly"
        ? (Array.isArray(cfg.daysOfWeek) && cfg.daysOfWeek.length
            ? cfg.daysOfWeek
            : (weekdayOf(start) === null ? [] : [weekdayOf(start)]))
        : [];
      return generateDatesInRange(start, end, freq, interval > 1 ? interval : 1, days);
    }
    return (Array.isArray(cfg.dates) ? cfg.dates : []).map((d) => String(d).split("T")[0]);
  };

  const notify = (type, dates, start, end, freq, amounts, interval, preset = activePreset, daysOverride, opts = {}) => {
    const days = daysOverride !== undefined ? daysOverride : effectiveWeekDays;
    // While editing, monthly/yearly always anchor on the 1st of the month/year. Fixed presets
    // keep whatever anchor day the admin configured.
    const anchorStart = anchorPeriods ? periodStartFor(freq, start) : start;
    const anchorEnd = anchorPeriods ? periodStartFor(freq, end) : end;
    // `includePast` is only set when applying a preset with make-up ticked; manual edits always drop past dates.
    const keepAll = opts.includePast === true;
    const futureDates = (type === "specific_dates" && !keepAll) ? dates.filter((d) => d >= minDateStr) : dates;
    const futureAmounts = (type === "specific_dates" && !keepAll)
      ? Object.fromEntries(Object.entries(amounts).filter(([d]) => d >= minDateStr))
      : amounts;
    const occ    = type === "specific_dates"
      ? futureDates.length
      : countOccurrences(anchorStart, anchorEnd, freq, interval, days);
    const config = buildConfig(type, futureDates, anchorStart, anchorEnd, freq, futureAmounts, interval, days);
    onChange({
      scheduleType: type,
      scheduleConfig: config,
      occurrences: occ,
      remainingOccurrences: opts.remainingOccurrences !== undefined ? opts.remainingOccurrences : occ,
      makeUpMissedDates: Boolean(opts.makeUpMissedDates),
      activePreset: preset,
    });
  };

  const handlePreset = (presetId, makeUpOverride) => {
    setActivePreset(presetId);

    if (presetId === "custom") {
      setMakeUpMissedDates(false);
      setScheduleType("specific_dates");
      setSelectedDates([]);
      setDateAmounts({});
      setWeekDays([]);
      notify("specific_dates", [], rangeStart, rangeEnd, rangeFreq, {}, customInterval, presetId);
      return;
    }

    const preset = apiPresets.find((p) => p.id === presetId);
    if (!preset) return;
    const cfg = preset.scheduleConfig ?? {};

    // "Missed" = preset dates strictly before today. Make-up is only offered for a real preset
    // that allows it and actually has passed dates.
    const allPresetDates = fullPresetDates(preset);
    const missedDates = allPresetDates.filter((d) => d < todayKey);
    const futurePresetDates = allPresetDates.filter((d) => d >= minDateStr);
    const canMakeUp = Boolean(preset.allowMissedMakeUp) && missedDates.length > 0;
    const wantMakeUp = makeUpOverride !== undefined ? Boolean(makeUpOverride) : makeUpMissedDates;
    const nextMakeUp = canMakeUp && wantMakeUp;
    setMakeUpMissedDates(nextMakeUp);

    if (preset.scheduleType === "date_range") {
      const start    = cfg.startDate?.split("T")[0] ?? "";
      const end      = cfg.endDate?.split("T")[0]   ?? "";
      const interval = cfg.intervalValue ?? 1;
      const freq     = interval > 1 ? "custom" : (cfg.frequency ?? "daily");
      const presetDays = freq === "weekly"
        ? (Array.isArray(cfg.daysOfWeek) && cfg.daysOfWeek.length ? cfg.daysOfWeek : (weekdayOf(start) === null ? [] : [weekdayOf(start)]))
        : [];
      // With make-up OFF, clamp the range start so already-passed dates are excluded — otherwise
      // the API rejects the schedule (past dates).
      const effectiveStart = nextMakeUp ? start : (futurePresetDates[0] ?? start);
      setScheduleType("date_range");
      setRangeStart(effectiveStart);
      setRangeEnd(end);
      setRangeFreq(freq);
      setCustomInterval(interval > 1 ? interval : 1);
      setSelectedDates([]);
      setDateAmounts({});
      setWeekDays(presetDays);
      notify(
        "date_range", [], effectiveStart, end, freq, {}, interval > 1 ? interval : 1, presetId, presetDays,
        { includePast: nextMakeUp, makeUpMissedDates: nextMakeUp, remainingOccurrences: futurePresetDates.length },
      );
      return;
    }

    // specific_dates (including the "Specific Dates" template, whose list is empty)
    const dates = nextMakeUp ? [...missedDates, ...futurePresetDates] : futurePresetDates;
    setScheduleType("specific_dates");
    setSelectedDates(dates);
    setDateAmounts({});
    notify(
      "specific_dates", dates, rangeStart, rangeEnd, rangeFreq, {}, customInterval, presetId, undefined,
      { includePast: nextMakeUp, makeUpMissedDates: nextMakeUp, remainingOccurrences: futurePresetDates.length },
    );
  };

  // Pre-select the admin-configured default preset once, unless the donor already has a
  // selection to restore (a stored choice, including "custom", always wins). Reusing
  // handlePreset means the default goes through the exact same mapping as a click.
  useEffect(() => {
    if (initialActivePreset) return;
    if (!defaultPresetId) return;
    if (!apiPresets.some((p) => p.id === defaultPresetId)) return;
    handlePreset(defaultPresetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDate = (dateStr) => {
    const isSelected  = selectedDates.includes(dateStr);
    const nextDates   = isSelected ? selectedDates.filter((d) => d !== dateStr) : [...selectedDates, dateStr];
    // In divide mode, changing the date count redistributes the total evenly across all
    // dates — clear all per-date overrides so the new defaultPerDate applies to everyone.
    // In repeat mode, only remove the override for the toggled date.
    let nextAmounts;
    if (splitMode === "divide") {
      nextAmounts = {};
    } else {
      nextAmounts = { ...dateAmounts };
      if (isSelected) delete nextAmounts[dateStr];
    }
    setSelectedDates(nextDates);
    setDateAmounts(nextAmounts);
    notify(scheduleType, nextDates, rangeStart, rangeEnd, rangeFreq, nextAmounts, customInterval);

    // Keep prefillDateMap in sync: if this date was pre-filled, mark removed=true when
    // deselected and removed=false when re-selected, so the PUT payload knows which
    // dates carry a transactionId (pre-filled) vs are brand-new (no transactionId).
    try {
      const editRaw = sessionStorage.getItem("hc_schedule_edit");
      if (editRaw) {
        const editData = JSON.parse(editRaw);
        if (editData.isEditMode && editData.prefillDateMap && dateStr in editData.prefillDateMap) {
          editData.prefillDateMap[dateStr].removed = isSelected; // true = removing, false = re-adding
          sessionStorage.setItem("hc_schedule_edit", JSON.stringify(editData));
        }
      }
    } catch (_) {}
  };

  const handleDateAmountChange = (dateStr, val) => {
    const nextAmounts = { ...dateAmounts };
    if (val === "" || val === undefined) delete nextAmounts[dateStr];
    else nextAmounts[dateStr] = val;
    setDateAmounts(nextAmounts);
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, rangeFreq, nextAmounts, customInterval);
  };

  const handleScheduleType = (val) => {
    setScheduleType(val);
    setDateAmounts({});
    const days = val === "weekly" && !weekDays.length
      ? (weekdayOf(rangeStart) === null ? [] : [weekdayOf(rangeStart)])
      : effectiveWeekDays;
    if (val === "weekly" && !weekDays.length) setWeekDays(days);
    notify(val, selectedDates, rangeStart, rangeEnd, rangeFreq, {}, customInterval, activePreset, days);
  };

  const handleRangeStart = (val) => {
    setRangeStart(val);
    const nextFreq = resolveFreq(val, rangeEnd, rangeFreq);
    if (nextFreq !== rangeFreq) setRangeFreq(nextFreq);
    let days = effectiveWeekDays;
    if (nextFreq === "weekly" && !weekDays.length) {
      days = weekdayOf(val) === null ? [] : [weekdayOf(val)];
      setWeekDays(days);
    }
    // Period frequencies pick whole months/years: never let the end fall before the start.
    let nextEnd = rangeEnd;
    if (isPeriodFreq(nextFreq) && val && nextEnd && nextEnd < val) {
      nextEnd = val;
      setRangeEnd(nextEnd);
    }
    const next = Object.fromEntries(Object.entries(dateAmounts).filter(([d]) => d >= val));
    setDateAmounts(next);
    notify(scheduleType, selectedDates, val, nextEnd, nextFreq, next, customInterval, activePreset, days);
  };

  const handleRangeEnd = (val) => {
    // Defensive clamp: the end can never precede the start for period frequencies.
    const clamped = isPeriodFreq(rangeFreq) && rangeStart && val && val < rangeStart ? rangeStart : val;
    setRangeEnd(clamped);
    const nextFreq = resolveFreq(rangeStart, clamped, rangeFreq);
    if (nextFreq !== rangeFreq) setRangeFreq(nextFreq);
    const next = Object.fromEntries(Object.entries(dateAmounts).filter(([d]) => d <= clamped));
    setDateAmounts(next);
    notify(scheduleType, selectedDates, rangeStart, clamped, nextFreq, next, customInterval);
  };

  const handleRangeFreq = (val) => {
    setRangeFreq(val);
    setDateAmounts({});
    const days = val === "weekly"
      ? (weekDays.length ? weekDays : (weekdayOf(rangeStart) === null ? [] : [weekdayOf(rangeStart)]))
      : [];
    setWeekDays(days);

    // Switching to Monthly/Yearly: snap the range onto whole periods and keep it in the
    // future, so the picker is valid immediately (instead of downgrading back to Daily).
    let nextStart = rangeStart;
    let nextEnd = rangeEnd;
    if (isPeriodFreq(val)) {
      const floor = earliestPeriodStartFor(val, minDateStr);
      const snappedStart = rangeStart ? periodStartFor(val, rangeStart) : floor;
      nextStart = snappedStart && snappedStart >= floor ? snappedStart : floor;
      const snappedEnd = rangeEnd ? periodStartFor(val, rangeEnd) : nextStart;
      nextEnd = snappedEnd && snappedEnd >= nextStart ? snappedEnd : nextStart;
      setRangeStart(nextStart);
      setRangeEnd(nextEnd);
    }

    notify(scheduleType, selectedDates, nextStart, nextEnd, val, {}, customInterval, activePreset, days);
  };

  const handleCustomInterval = (val) => {
    const n = Math.min(15, Math.max(1, parseInt(val, 10) || 1));
    setCustomInterval(n);
    setDateAmounts({});
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, rangeFreq, {}, n);
  };

  const futureSelectedDates = selectedDates.filter((d) => d >= minDateStr);
  const presetDateCount  = !showFullControls
    ? (scheduleType === "date_range" ? generatedDates.length : futureSelectedDates.length)
    : 0;
  const pastPresetCount = !showFullControls && scheduleType === "specific_dates"
    ? selectedDates.length - futureSelectedDates.length
    : 0;
  // When a template preset has intervalValue, lock frequency controls to read-only
  const lockedInterval = (isTemplateActive && (activeApiPreset?.scheduleConfig?.intervalValue ?? 0) > 1)
    ? activeApiPreset.scheduleConfig.intervalValue
    : null;

  // Make-up offer: only for a real preset that allows it and has already-passed dates.
  const presetMissedDates = activeApiPreset && !isTemplateActive
    ? fullPresetDates(activeApiPreset).filter((d) => d < todayKey)
    : [];
  const showMakeUp = Boolean(activeApiPreset?.allowMissedMakeUp) && presetMissedDates.length > 0;
  const makeUpAmount = presetMissedDates.length * (Number(effectiveAmount) || 0);
  const scheduledDateCount = makeUpMissedDates
    ? (scheduleType === "date_range" ? generatedDates.length : selectedDates.length)
    : presetDateCount;

  return (
    <div className="flex flex-col gap-4">

      {/* Preset pills */}
      {hasPresets && (
        <div className="flex flex-wrap gap-2">
          {[...apiPresets, { id: "custom", name: "Custom" }].map((p) => {
            const active = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePreset(p.id)}
                className={`px-3.5 py-2 rounded-full border text-[12px] font-medium transition-all cursor-pointer ${
                  active
                    ? "border-[#EA3335] bg-[#EA3335] text-white"
                    : "border-[#E5E5E5] bg-white text-[#737373] hover:border-[#EA3335]/50 hover:text-[#383838]"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Make up for missed dates — only when the active preset allows it and has passed dates */}
      {showMakeUp && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={makeUpMissedDates}
            onChange={(e) => handlePreset(activePreset, e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer"
            style={{ accentColor: "#EA3335" }}
          />
          <span className="text-[12px] text-[#383838]">
            <span className="font-medium">Make up for {presetMissedDates.length} missed date{presetMissedDates.length !== 1 ? "s" : ""}</span>
            {makeUpAmount > 0 ? (
              <span className="text-[#EA3335] font-medium"> (+{sym}{makeUpAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })})</span>
            ) : null}
            <span className="mt-0.5 block text-[11px] text-[#737373]">
              You&apos;ll pay for the dates that already passed, in addition to the remaining ones.
            </span>
          </span>
        </label>
      )}

      {/* Summary banner — only for fixed presets (not template, not custom) */}
      {!showFullControls && (scheduledDateCount > 0 || (!makeUpMissedDates && pastPresetCount > 0)) && (
        <div className="flex items-center justify-between bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-2.5">
          <span className="text-[12px] text-[#EA3335] font-medium flex items-center gap-1.5">
            {scheduledDateCount} date{scheduledDateCount !== 1 ? "s" : ""} selected from preset
            {!makeUpMissedDates && pastPresetCount > 0 && (
              <span className="text-[11px] text-[#AEAEAE] font-normal">
                ({pastPresetCount} past, disabled)
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => handlePreset("custom")}
            className="text-[11px] text-[#737373] underline cursor-pointer hover:text-[#383838]"
          >
            Clear &amp; customise
          </button>
        </div>
      )}

      {/* Full controls — Custom, template presets, or no API presets */}
      {showFullControls && (
        <div className="flex flex-col gap-4">

          {/* Schedule Type toggle — hidden for interval presets (type is fixed) */}
          {lockedInterval == null && (
            <div>
              <label className="block text-[13px] font-medium text-[#383838] mb-2">Schedule Type</label>
              <div className="flex gap-2">
                {SCHEDULE_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleScheduleType(opt.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all cursor-pointer ${
                      scheduleType === opt.value
                        ? "border-[#EA3335] bg-[#FFF5F5] text-[#EA3335]"
                        : "border-[#E5E5E5] bg-white text-[#737373] hover:border-[#EA3335]/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {scheduleType === "specific_dates" ? (
            <SpecificDatesSection
              selectedDates={selectedDates}
              onToggleDate={toggleDate}
              minDateStr={minDateStr}
              maxDateStr={campaignEndDate}
            />
          ) : (
            <DateRangeSection
              rangeStart={effRangeStart}
              rangeEnd={effRangeEnd}
              rangeFreq={rangeFreq}
              customInterval={customInterval}
              weekDays={effectiveWeekDays}
              onWeekDays={setWeekDays}
              effectiveAmount={effectiveAmount}
              sym={sym}
              lockedInterval={lockedInterval}
              minDateStr={minDateStr}
              maxDateStr={campaignEndDate}
              onRangeStart={handleRangeStart}
              onRangeEnd={handleRangeEnd}
              onRangeFreq={handleRangeFreq}
              onCustomInterval={handleCustomInterval}
            />
          )}
        </div>
      )}

      {/* Per-date amount table — shown for all active states that have dates */}
      {activeDates.length > 0 && (
        <PerDateAmountTable
          activeDates={activeDates}
          dateAmounts={dateAmounts}
          effectiveAmount={effectiveAmount}
          sym={sym}
          onChange={handleDateAmountChange}
          minDateStr={minDateStr}
          causeSplit={causeSplit}
          causeLabelById={causeLabelById}
        />
      )}

    </div>
  );
};

export default RecurringSchedule;

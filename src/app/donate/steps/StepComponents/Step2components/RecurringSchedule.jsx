"use client";

import { useState, useMemo } from "react";
import countOccurrences, { generateDatesInRange } from "../countOccurrences";
import { buildConfig, resolveFreq } from "./scheduleUtils";
import SpecificDatesSection from "./SpecificDatesSection";
import DateRangeSection from "./DateRangeSection";
import PerDateAmountTable from "./PerDateAmountTable";

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
  initialScheduleType,
  initialConfig,
  initialActivePreset,
  apiPresets = [],
  onChange,
}) => {
  const [activePreset,   setActivePreset]   = useState(initialActivePreset ?? "custom");
  const [scheduleType,   setScheduleType]   = useState(initialScheduleType ?? "specific_dates");
  const [selectedDates,  setSelectedDates]  = useState(() =>
    (initialConfig?.dates ?? []).map((d) => d.split("T")[0])
  );
  const [dateAmounts,    setDateAmounts]    = useState(() => initialConfig?.dateAmounts ?? {});
  const [rangeStart,     setRangeStart]     = useState(initialConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,       setRangeEnd]       = useState(initialConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,      setRangeFreq]      = useState(initialConfig?.frequency ?? "daily");
  const [customInterval, setCustomInterval] = useState(initialConfig?.customInterval ?? 1);

  const generatedDates = useMemo(
    () => scheduleType === "date_range"
      ? generateDatesInRange(rangeStart, rangeEnd, rangeFreq, customInterval)
      : [],
    [scheduleType, rangeStart, rangeEnd, rangeFreq, customInterval]
  );

  const activeDates = scheduleType === "date_range"
    ? generatedDates
    : [...selectedDates].sort();

  const notify = (type, dates, start, end, freq, amounts, interval, preset = activePreset) => {
    const occ    = type === "specific_dates"
      ? dates.length
      : countOccurrences(start, end, freq, interval);
    const config = buildConfig(type, dates, start, end, freq, amounts, interval);
    onChange({ scheduleType: type, scheduleConfig: config, occurrences: occ, activePreset: preset });
  };

  const handlePreset = (presetId) => {
    setActivePreset(presetId);

    if (presetId === "custom") {
      setScheduleType("specific_dates");
      setSelectedDates([]);
      setDateAmounts({});
      notify("specific_dates", [], rangeStart, rangeEnd, rangeFreq, {}, customInterval, presetId);
      return;
    }

    const preset = apiPresets.find((p) => p.id === presetId);
    if (!preset) return;
    const cfg = preset.scheduleConfig ?? {};

    if (isTemplate(preset)) {
      // Template presets open the form pre-configured — no summary banner
      if (preset.scheduleType === "date_range") {
        const start    = cfg.startDate?.split("T")[0] ?? "";
        const end      = cfg.endDate?.split("T")[0]   ?? "";
        const interval = cfg.intervalValue ?? 1;
        const freq     = interval > 1 ? "custom" : (cfg.frequency ?? "daily");
        setScheduleType("date_range");
        setRangeStart(start);
        setRangeEnd(end);
        setRangeFreq(freq);
        setCustomInterval(interval > 1 ? interval : 1);
        setSelectedDates([]);
        setDateAmounts({});
        notify("date_range", [], start, end, freq, {}, interval > 1 ? interval : 1, presetId);
      } else {
        // "Specific Dates" template — open empty calendar
        setScheduleType("specific_dates");
        setSelectedDates([]);
        setDateAmounts({});
        notify("specific_dates", [], rangeStart, rangeEnd, rangeFreq, {}, customInterval, presetId);
      }
    } else {
      // Fixed presets — apply config directly, show summary banner
      if (preset.scheduleType === "date_range") {
        const start    = cfg.startDate?.split("T")[0] ?? "";
        const end      = cfg.endDate?.split("T")[0]   ?? "";
        const interval = cfg.intervalValue ?? 1;
        const freq     = interval > 1 ? "custom" : (cfg.frequency ?? "daily");
        setScheduleType("date_range");
        setRangeStart(start);
        setRangeEnd(end);
        setRangeFreq(freq);
        setCustomInterval(interval > 1 ? interval : 1);
        setSelectedDates([]);
        setDateAmounts({});
        notify("date_range", [], start, end, freq, {}, interval > 1 ? interval : 1, presetId);
      } else {
        const dates = (cfg.dates ?? []).map((d) => d.split("T")[0]);
        setScheduleType("specific_dates");
        setSelectedDates(dates);
        setDateAmounts({});
        notify("specific_dates", dates, rangeStart, rangeEnd, rangeFreq, {}, customInterval, presetId);
      }
    }
  };

  const toggleDate = (dateStr) => {
    const isSelected  = selectedDates.includes(dateStr);
    const nextDates   = isSelected ? selectedDates.filter((d) => d !== dateStr) : [...selectedDates, dateStr];
    const nextAmounts = { ...dateAmounts };
    if (isSelected) delete nextAmounts[dateStr];
    setSelectedDates(nextDates);
    setDateAmounts(nextAmounts);
    notify(scheduleType, nextDates, rangeStart, rangeEnd, rangeFreq, nextAmounts, customInterval);
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
    notify(val, selectedDates, rangeStart, rangeEnd, rangeFreq, {}, customInterval);
  };

  const handleRangeStart = (val) => {
    setRangeStart(val);
    const nextFreq = resolveFreq(val, rangeEnd, rangeFreq);
    if (nextFreq !== rangeFreq) setRangeFreq(nextFreq);
    const next = Object.fromEntries(Object.entries(dateAmounts).filter(([d]) => d >= val));
    setDateAmounts(next);
    notify(scheduleType, selectedDates, val, rangeEnd, nextFreq, next, customInterval);
  };

  const handleRangeEnd = (val) => {
    setRangeEnd(val);
    const nextFreq = resolveFreq(rangeStart, val, rangeFreq);
    if (nextFreq !== rangeFreq) setRangeFreq(nextFreq);
    const next = Object.fromEntries(Object.entries(dateAmounts).filter(([d]) => d <= val));
    setDateAmounts(next);
    notify(scheduleType, selectedDates, rangeStart, val, nextFreq, next, customInterval);
  };

  const handleRangeFreq = (val) => {
    setRangeFreq(val);
    setDateAmounts({});
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, val, {}, customInterval);
  };

  const handleCustomInterval = (val) => {
    const n = Math.min(15, Math.max(1, parseInt(val, 10) || 1));
    setCustomInterval(n);
    setDateAmounts({});
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, rangeFreq, {}, n);
  };

  const hasPresets       = apiPresets.length > 0;
  const isCustom         = activePreset === "custom";
  const activeApiPreset  = apiPresets.find((p) => p.id === activePreset);
  const isTemplateActive = activeApiPreset ? isTemplate(activeApiPreset) : false;
  // Show full controls for: Custom pill, template presets, or no API presets at all
  const showFullControls = isCustom || isTemplateActive || !hasPresets;
  const presetDateCount  = !showFullControls
    ? (scheduleType === "date_range" ? generatedDates.length : selectedDates.length)
    : 0;
  // When a template preset has intervalValue, lock frequency controls to read-only
  const lockedInterval = (isTemplateActive && (activeApiPreset?.scheduleConfig?.intervalValue ?? 0) > 1)
    ? activeApiPreset.scheduleConfig.intervalValue
    : null;

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

      {/* Summary banner — only for fixed presets (not template, not custom) */}
      {!showFullControls && presetDateCount > 0 && (
        <div className="flex items-center justify-between bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-2.5">
          <span className="text-[12px] text-[#EA3335] font-medium">
            {presetDateCount} date{presetDateCount !== 1 ? "s" : ""} selected from preset
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

          {scheduleType === "specific_dates" ? (
            <SpecificDatesSection selectedDates={selectedDates} onToggleDate={toggleDate} />
          ) : (
            <DateRangeSection
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              rangeFreq={rangeFreq}
              customInterval={customInterval}
              effectiveAmount={effectiveAmount}
              sym={sym}
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
        />
      )}

    </div>
  );
};

export default RecurringSchedule;

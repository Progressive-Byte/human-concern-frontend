"use client";

import { useState, useMemo } from "react";
import MiniCalendar from "./MiniCalendar";
import countOccurrences, { generateDatesInRange } from "../countOccurrences";
import { PRESETS, getPresetDates } from "./presetDates";
import DateAmountRow from "./DateAmountRow";

const SCHEDULE_TYPES = [
  { value: "specific_dates", label: "Specific Dates" },
  { value: "date_range",     label: "Date Range" },
];

// minDays: minimum range span required for this frequency to be valid
const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily",   minDays: 1 },
  { value: "weekly",  label: "Weekly",  minDays: 7 },
  { value: "monthly", label: "Monthly", minDays: 30 },
  { value: "yearly",  label: "Yearly",  minDays: 365 },
  { value: "custom",  label: "Custom",  minDays: 1 },
];

const RecurringSchedule = ({ sym, effectiveAmount, initialScheduleType, initialConfig, onChange }) => {
  const [activePreset,    setActivePreset]    = useState("custom");
  const [scheduleType,    setScheduleType]    = useState(initialScheduleType ?? "specific_dates");
  const [selectedDates,   setSelectedDates]   = useState(() =>
    (initialConfig?.dates ?? []).map((d) => d.split("T")[0])
  );
  const [dateAmounts,     setDateAmounts]     = useState(() => initialConfig?.dateAmounts ?? {});
  const [rangeStart,      setRangeStart]      = useState(initialConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,        setRangeEnd]        = useState(initialConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,       setRangeFreq]       = useState(initialConfig?.frequency ?? "daily");
  const [customInterval,  setCustomInterval]  = useState(initialConfig?.customInterval ?? 1);

  const todayStr = new Date().toISOString().split("T")[0];

  // Number of days between start and end (inclusive)
  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const diff = Math.floor((new Date(rangeEnd) - new Date(rangeStart)) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);

  // Which frequency options are disabled for the current range
  const freqDisabled = useMemo(
    () => Object.fromEntries(FREQ_OPTIONS.map(({ value, minDays }) => [value, rangeDays > 0 && rangeDays < minDays])),
    [rangeDays]
  );

  const generatedDates = useMemo(
    () => scheduleType === "date_range"
      ? generateDatesInRange(rangeStart, rangeEnd, rangeFreq, customInterval)
      : [],
    [scheduleType, rangeStart, rangeEnd, rangeFreq, customInterval]
  );

  // ── helpers ──────────────────────────────────────────────────────────────

  const buildConfig = (type, dates, start, end, freq, amounts, interval) => {
    if (type === "specific_dates") {
      const sorted    = [...dates].sort();
      const overrides = {};
      sorted.forEach((d) => {
        if (amounts[d] !== undefined && amounts[d] !== "") overrides[d] = Number(amounts[d]);
      });
      return {
        dates: sorted.map((d) => new Date(`${d}T00:00:00.000Z`).toISOString()),
        ...(Object.keys(overrides).length > 0 && { dateAmounts: overrides }),
      };
    }
    const rangeDatesArr = generateDatesInRange(start, end, freq, interval);
    const validSet      = new Set(rangeDatesArr);
    const overrides     = {};
    Object.entries(amounts).forEach(([d, v]) => {
      if (validSet.has(d) && v !== undefined && v !== "") overrides[d] = Number(v);
    });
    return {
      startDate: start ? new Date(`${start}T00:00:00.000Z`).toISOString() : "",
      endDate:   end   ? new Date(`${end}T00:00:00.000Z`).toISOString()   : "",
      frequency: freq,
      ...(freq === "custom" && { customInterval: Math.max(1, Number(interval) || 1) }),
      ...(Object.keys(overrides).length > 0 && { dateAmounts: overrides }),
    };
  };

  const notify = (type, dates, start, end, freq, amounts, interval) => {
    const occ    = type === "specific_dates"
      ? dates.length
      : countOccurrences(start, end, freq, interval);
    const config = buildConfig(type, dates, start, end, freq, amounts, interval);
    onChange({ scheduleType: type, scheduleConfig: config, occurrences: occ });
  };

  // If the current frequency is no longer valid for a new range, fall back to daily
  const resolveFreq = (newStart, newEnd, currentFreq) => {
    if (!newStart || !newEnd) return currentFreq;
    const days = Math.floor((new Date(newEnd) - new Date(newStart)) / 86400000) + 1;
    if (days <= 0) return currentFreq;
    const opt = FREQ_OPTIONS.find((o) => o.value === currentFreq);
    if (opt && days < opt.minDays) return "daily";
    return currentFreq;
  };

  // ── event handlers ────────────────────────────────────────────────────────

  const handlePreset = (presetId) => {
    setActivePreset(presetId);
    if (presetId === "custom") {
      setScheduleType("specific_dates");
      setSelectedDates([]);
      setDateAmounts({});
      notify("specific_dates", [], rangeStart, rangeEnd, rangeFreq, {}, customInterval);
      return;
    }
    const result = getPresetDates(presetId);
    if (!result) return;
    setScheduleType("specific_dates");
    setSelectedDates(result.dates);
    setDateAmounts({});
    notify("specific_dates", result.dates, rangeStart, rangeEnd, rangeFreq, {}, customInterval);
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

  // ── derived ───────────────────────────────────────────────────────────────

  const activeDates = (scheduleType === "date_range" && activePreset === "custom")
    ? generatedDates
    : [...selectedDates].sort();

  const occurrences = scheduleType === "specific_dates"
    ? selectedDates.length
    : countOccurrences(rangeStart, rangeEnd, rangeFreq, customInterval);

  const calcTotal = (dates, amounts) =>
    dates.reduce((sum, d) => {
      const ov  = amounts[d] ?? "";
      const amt = ov !== "" ? Number(ov) : effectiveAmount;
      return sum + (isNaN(amt) ? effectiveAmount : amt);
    }, 0);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* Preset pills */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePreset(p.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12px] font-medium transition-all cursor-pointer ${
                active
                  ? "border-[#EA3335] bg-[#EA3335] text-white"
                  : "border-[#E5E5E5] bg-white text-[#737373] hover:border-[#EA3335]/50 hover:text-[#383838]"
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preset summary */}
      {activePreset !== "custom" && selectedDates.length > 0 && (
        <div className="flex items-center justify-between bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-2.5">
          <span className="text-[12px] text-[#EA3335] font-medium">
            {selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""} selected from preset
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

      {/* Full controls — Custom preset only */}
      {activePreset === "custom" && (
        <div className="flex flex-col gap-4">

          {/* Schedule type toggle */}
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

            /* Specific dates: calendar picker */
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#383838] mb-2">
                  Select Donation Dates
                  {selectedDates.length > 0 && (
                    <span className="ml-1.5 text-[#EA3335]">({selectedDates.length} selected)</span>
                  )}
                </label>
                <MiniCalendar selectedDates={selectedDates} onToggleDate={toggleDate} />
                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[...selectedDates].sort().map((d) => (
                      <span
                        key={d}
                        className="flex items-center gap-1 text-[11px] bg-[#FFF5F5] border border-[#FFCCCC] text-[#EA3335] rounded-lg px-2 py-1 font-medium"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => toggleDate(d)}
                          className="ml-0.5 hover:text-[#c0272a] cursor-pointer leading-none"
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          ) : (

            /* Date range */
            <div className="flex flex-col gap-3">

              {/* Start / end date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#383838] mb-2">Start Date</label>
                  <input
                    type="date"
                    value={rangeStart}
                    min={todayStr}
                    onChange={(e) => handleRangeStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#383838] outline-none focus:border-[#EA3335] bg-white transition-colors cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#383838] mb-2">
                    {rangeFreq === "custom" ? "Until Date" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={rangeEnd}
                    min={rangeStart || todayStr}
                    onChange={(e) => handleRangeEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#383838] outline-none focus:border-[#EA3335] bg-white transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Frequency buttons */}
              <div>
                <label className="block text-[13px] font-medium text-[#383838] mb-2">Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {FREQ_OPTIONS.map(({ value, label, minDays }) => {
                    const disabled = freqDisabled[value];
                    const active   = rangeFreq === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRangeFreq(value)}
                        title={disabled ? `Requires at least ${minDays} day${minDays !== 1 ? "s" : ""} range` : undefined}
                        className={`px-4 py-2 rounded-xl border text-[12px] font-medium transition-all ${
                          active
                            ? "border-[#EA3335] bg-[#FFF5F5] text-[#EA3335]"
                            : disabled
                            ? "border-[#E5E5E5] bg-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed"
                            : "border-[#E5E5E5] bg-white text-[#737373] hover:border-[#EA3335]/40 cursor-pointer"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {/* Inline validation hint when active freq is too wide for range */}
                {rangeDays > 0 && freqDisabled[rangeFreq] && (
                  <p className="text-[11px] text-[#EA3335] mt-1.5 px-0.5">
                    {`${FREQ_OPTIONS.find((o) => o.value === rangeFreq)?.label} requires at least ${FREQ_OPTIONS.find((o) => o.value === rangeFreq)?.minDays} days — switched to Daily.`}
                  </p>
                )}
              </div>

              {/* Custom interval input */}
              {rangeFreq === "custom" && (
                <div className="flex items-center gap-3 bg-[#F9F9F9] border border-[#EBEBEB] rounded-xl px-4 py-3">
                  <span className="text-[13px] font-medium text-[#383838] whitespace-nowrap">Every</span>
                  <input
                    type="number"
                    min={1}
                    value={customInterval}
                    onChange={(e) => handleCustomInterval(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg border border-[#E5E5E5] text-[14px] text-[#383838] text-center outline-none focus:border-[#EA3335] bg-white"
                  />
                  <span className="text-[13px] font-medium text-[#383838]">
                    day{customInterval !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Payment count summary */}
              {rangeStart && rangeEnd && occurrences > 0 && (
                <p className="text-[12px] text-[#737373] bg-[#F9F9F9] rounded-xl px-4 py-2.5 border border-[#EBEBEB]">
                  {occurrences} payment{occurrences !== 1 ? "s" : ""} of {sym}{effectiveAmount} each
                  {rangeFreq === "custom" && (
                    <span className="ml-1 text-[#AEAEAE]">(every {customInterval} day{customInterval !== 1 ? "s" : ""})</span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Per-date amount table */}
      {activeDates.length > 0 && (
        <div className="flex flex-col gap-2 border border-[#EBEBEB] rounded-xl overflow-hidden bg-[#FAFAFA]">

          <div className="flex items-center justify-between px-3 pt-3">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-[#383838]">Amount Per Date</p>
              <span className="text-[11px] text-[#737373] bg-[#F0F0F0] rounded-full px-2 py-0.5 tabular-nums">
                {activeDates.length} date{activeDates.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-[11px] text-[#737373]">Default: {sym}{effectiveAmount}</p>
          </div>

          <div
            className="flex flex-col gap-1.5 max-h-[230px] overflow-y-scroll px-3 pb-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB #F3F4F6" }}
          >
            {activeDates.map((d) => (
              <DateAmountRow
                key={d}
                d={d}
                override={dateAmounts[d] ?? ""}
                effectiveAmount={effectiveAmount}
                sym={sym}
                onChange={handleDateAmountChange}
              />
            ))}
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#E5E5E5] bg-white">
            <span className="text-[12px] font-semibold text-[#383838]">
              Total ({activeDates.length} payment{activeDates.length !== 1 ? "s" : ""})
            </span>
            <span className="text-[14px] font-bold text-[#EA3335] tabular-nums">
              {sym}{calcTotal(activeDates, dateAmounts).toLocaleString()}
            </span>
          </div>

        </div>
      )}

    </div>
  );
};

export default RecurringSchedule;

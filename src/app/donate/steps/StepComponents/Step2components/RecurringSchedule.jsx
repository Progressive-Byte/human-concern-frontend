"use client";

import { useState, useMemo } from "react";
import Select from "@/components/ui/Select";
import MiniCalendar from "./MiniCalendar";
import countOccurrences, { generateDatesInRange } from "../countOccurrences";

const SCHEDULE_TYPES = [
  { value: "specific_dates", label: "Specific Dates" },
  { value: "date_range",     label: "Date Range" },
];

const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily" },
  { value: "weekly",  label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const PRESETS = [
  { id: "every_monday",   label: "Every Monday",     icon: "📅" },
  { id: "odd_nights",     label: "Odd nights",        icon: "🌙" },
  { id: "ramadan_last10", label: "Last 10 Ramadan",   icon: "✨" },
  { id: "may_15_30",      label: "15–30 May",          icon: "🗓" },
  { id: "every_friday",   label: "Every Friday",       icon: "🕌" },
  { id: "custom",         label: "Custom",             icon: "✏️" },
];

function getPresetDates(presetId) {
  const today    = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const toISO    = (d) => d.toISOString().split("T")[0];

  if (presetId === "every_monday" || presetId === "every_friday") {
    const targetDay = presetId === "every_monday" ? 1 : 5;
    const dates = [];
    const d = new Date(today);
    const diff = (targetDay - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    for (let i = 0; i < 4; i++) {
      dates.push(toISO(d));
      d.setDate(d.getDate() + 7);
    }
    return { type: "specific_dates", dates };
  }

  if (presetId === "odd_nights") {
    const dates = [];
    const m = today.getMonth();
    const y = today.getFullYear();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      if (day % 2 !== 0) {
        const s = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (s >= todayStr) dates.push(s);
      }
    }
    if (dates.length < 3) {
      const nm = (m + 1) % 12;
      const ny = nm === 0 ? y + 1 : y;
      const daysNext = new Date(ny, nm + 1, 0).getDate();
      for (let day = 1; day <= daysNext; day++) {
        if (day % 2 !== 0) {
          dates.push(`${ny}-${String(nm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
        }
      }
    }
    return { type: "specific_dates", dates: dates.slice(0, 15) };
  }

  if (presetId === "ramadan_last10") {
    // Ramadan 2027: ~Feb 17 – Mar 18; last 10 nights: Mar 9–18
    const start = new Date("2027-03-09");
    const dates = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return toISO(d);
    });
    return { type: "specific_dates", dates };
  }

  if (presetId === "may_15_30") {
    const y      = today.getFullYear();
    const endMay = new Date(y, 4, 30);
    const useY   = endMay >= today ? y : y + 1;
    const dates  = [];
    for (let day = 15; day <= 30; day++) {
      const s = `${useY}-05-${String(day).padStart(2, "0")}`;
      if (s >= todayStr) dates.push(s);
    }
    return { type: "specific_dates", dates };
  }

  return null;
}

const DateAmountRow = ({ d, override, effectiveAmount, sym, onChange }) => {
  const isOverridden  = override !== "";
  const displayAmount = isOverridden ? Number(override) : effectiveAmount;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#737373] w-[88px] shrink-0 font-medium tabular-nums">{d}</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] text-[13px] font-medium select-none">
          {sym}
        </span>
        <input
          type="number"
          value={override}
          placeholder={String(effectiveAmount)}
          min={0}
          onChange={(e) => onChange(d, e.target.value)}
          className={`w-full pl-7 pr-3 py-2 text-[13px] border rounded-xl outline-none transition-colors bg-white ${
            isOverridden
              ? "border-[#EA3335] text-[#383838]"
              : "border-[#E5E5E5] text-[#383838] focus:border-[#EA3335]"
          }`}
        />
      </div>
      <span className={`text-[12px] font-semibold w-14 text-right shrink-0 tabular-nums ${
        isOverridden ? "text-[#EA3335]" : "text-[#383838]"
      }`}>
        {sym}{displayAmount.toLocaleString()}
      </span>
    </div>
  );
};

const RecurringSchedule = ({ sym, effectiveAmount, initialScheduleType, initialConfig, onChange }) => {
  const [activePreset,  setActivePreset]  = useState("custom");
  const [scheduleType,  setScheduleType]  = useState(initialScheduleType ?? "specific_dates");
  const [selectedDates, setSelectedDates] = useState(() =>
    (initialConfig?.dates ?? []).map((d) => d.split("T")[0])
  );
  const [dateAmounts, setDateAmounts] = useState(() => initialConfig?.dateAmounts ?? {});
  const [rangeStart,  setRangeStart]  = useState(initialConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,    setRangeEnd]    = useState(initialConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,   setRangeFreq]   = useState(initialConfig?.frequency ?? "daily");

  const todayStr = new Date().toISOString().split("T")[0];

  const generatedDates = useMemo(
    () => (scheduleType === "date_range" ? generateDatesInRange(rangeStart, rangeEnd, rangeFreq) : []),
    [scheduleType, rangeStart, rangeEnd, rangeFreq]
  );

  const buildConfig = (type, dates, start, end, freq, amounts) => {
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
    const rangeDates = generateDatesInRange(start, end, freq);
    const validSet   = new Set(rangeDates);
    const overrides  = {};
    Object.entries(amounts).forEach(([d, v]) => {
      if (validSet.has(d) && v !== undefined && v !== "") overrides[d] = Number(v);
    });
    return {
      startDate: start ? new Date(`${start}T00:00:00.000Z`).toISOString() : "",
      endDate:   end   ? new Date(`${end}T00:00:00.000Z`).toISOString()   : "",
      frequency: freq,
      ...(Object.keys(overrides).length > 0 && { dateAmounts: overrides }),
    };
  };

  const notify = (type, dates, start, end, freq, amounts) => {
    const occ    = type === "specific_dates" ? dates.length : countOccurrences(start, end, freq);
    const config = buildConfig(type, dates, start, end, freq, amounts);
    onChange({ scheduleType: type, scheduleConfig: config, occurrences: occ });
  };

  const handlePreset = (presetId) => {
    setActivePreset(presetId);
    if (presetId === "custom") {
      // Clear preset dates so the user starts with a blank calendar
      setScheduleType("specific_dates");
      setSelectedDates([]);
      setDateAmounts({});
      notify("specific_dates", [], rangeStart, rangeEnd, rangeFreq, {});
      return;
    }
    const result = getPresetDates(presetId);
    if (!result) return;
    setScheduleType("specific_dates");
    setSelectedDates(result.dates);
    setDateAmounts({});
    notify("specific_dates", result.dates, rangeStart, rangeEnd, rangeFreq, {});
  };

  const toggleDate = (dateStr) => {
    const isSelected  = selectedDates.includes(dateStr);
    const nextDates   = isSelected ? selectedDates.filter((d) => d !== dateStr) : [...selectedDates, dateStr];
    const nextAmounts = { ...dateAmounts };
    if (isSelected) delete nextAmounts[dateStr];
    setSelectedDates(nextDates);
    setDateAmounts(nextAmounts);
    notify(scheduleType, nextDates, rangeStart, rangeEnd, rangeFreq, nextAmounts);
  };

  const handleDateAmountChange = (dateStr, val) => {
    const nextAmounts = { ...dateAmounts };
    if (val === "" || val === undefined) delete nextAmounts[dateStr];
    else nextAmounts[dateStr] = val;
    setDateAmounts(nextAmounts);
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, rangeFreq, nextAmounts);
  };

  const handleScheduleType = (val) => {
    setScheduleType(val);
    setDateAmounts({});
    notify(val, selectedDates, rangeStart, rangeEnd, rangeFreq, {});
  };

  const handleRangeStart = (val) => {
    setRangeStart(val);
    const next = Object.fromEntries(Object.entries(dateAmounts).filter(([d]) => d >= val));
    setDateAmounts(next);
    notify(scheduleType, selectedDates, val, rangeEnd, rangeFreq, next);
  };

  const handleRangeEnd = (val) => {
    setRangeEnd(val);
    const next = Object.fromEntries(Object.entries(dateAmounts).filter(([d]) => d <= val));
    setDateAmounts(next);
    notify(scheduleType, selectedDates, rangeStart, val, rangeFreq, next);
  };

  const handleRangeFreq = (val) => {
    setRangeFreq(val);
    setDateAmounts({});
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, val, {});
  };

  // Dates shown in the amount table
  const activeDates = (scheduleType === "date_range" && activePreset === "custom")
    ? generatedDates
    : [...selectedDates].sort();

  const occurrences = scheduleType === "specific_dates"
    ? selectedDates.length
    : countOccurrences(rangeStart, rangeEnd, rangeFreq);

  const calcTotal = (dates, amounts) =>
    dates.reduce((sum, d) => {
      const ov  = amounts[d] ?? "";
      const amt = ov !== "" ? Number(ov) : effectiveAmount;
      return sum + (isNaN(amt) ? effectiveAmount : amt);
    }, 0);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Quick preset pills ── */}
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

      {/* ── Preset summary chip ── */}
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

      {/* ── Full controls — Custom only ── */}
      {activePreset === "custom" && (
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
            <div className="flex flex-col gap-3">
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
                  <label className="block text-[13px] font-medium text-[#383838] mb-2">End Date</label>
                  <input
                    type="date"
                    value={rangeEnd}
                    min={rangeStart || todayStr}
                    onChange={(e) => handleRangeEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#383838] outline-none focus:border-[#EA3335] bg-white transition-colors cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#383838] mb-2">Frequency</label>
                <Select value={rangeFreq} onChange={handleRangeFreq} options={FREQ_OPTIONS} />
              </div>
              {rangeStart && rangeEnd && occurrences > 0 && (
                <p className="text-[12px] text-[#737373] bg-[#F9F9F9] rounded-xl px-4 py-2.5 border border-[#EBEBEB]">
                  {occurrences} payment{occurrences !== 1 ? "s" : ""} of {sym}{effectiveAmount} each
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Per-date amount table (all modes) ── */}
      {activeDates.length > 0 && (
        <div className="flex flex-col gap-2 border border-[#EBEBEB] rounded-xl p-3 bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-medium text-[#383838]">Amount Per Date</p>
            <p className="text-[11px] text-[#737373]">Default: {sym}{effectiveAmount}</p>
          </div>
          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
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
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] mt-1">
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

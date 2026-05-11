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

// Shared per-date amount row used in both schedule modes
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
  const [scheduleType,  setScheduleType]  = useState(initialScheduleType ?? "specific_dates");
  const [selectedDates, setSelectedDates] = useState(() =>
    (initialConfig?.dates ?? []).map((d) => d.split("T")[0])
  );
  const [dateAmounts, setDateAmounts] = useState(() => initialConfig?.dateAmounts ?? {});
  const [rangeStart,  setRangeStart]  = useState(initialConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,    setRangeEnd]    = useState(initialConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,   setRangeFreq]   = useState(initialConfig?.frequency ?? "daily");

  const todayStr = new Date().toISOString().split("T")[0];

  // All dates generated from the current date range
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
    // date_range — only keep overrides for dates actually in the generated range
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
    const occurrences    = type === "specific_dates" ? dates.length : countOccurrences(start, end, freq);
    const scheduleConfig = buildConfig(type, dates, start, end, freq, amounts);
    onChange({ scheduleType: type, scheduleConfig, occurrences });
  };

  // ── Specific-dates handlers ──────────────────────────────────────────────
  const toggleDate = (dateStr) => {
    const isSelected  = selectedDates.includes(dateStr);
    const nextDates   = isSelected
      ? selectedDates.filter((d) => d !== dateStr)
      : [...selectedDates, dateStr];
    const nextAmounts = { ...dateAmounts };
    if (isSelected) delete nextAmounts[dateStr];
    setSelectedDates(nextDates);
    setDateAmounts(nextAmounts);
    notify(scheduleType, nextDates, rangeStart, rangeEnd, rangeFreq, nextAmounts);
  };

  // ── Shared amount handler ────────────────────────────────────────────────
  const handleDateAmountChange = (dateStr, val) => {
    const nextAmounts = { ...dateAmounts };
    if (val === "" || val === undefined) delete nextAmounts[dateStr];
    else nextAmounts[dateStr] = val;
    setDateAmounts(nextAmounts);
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, rangeFreq, nextAmounts);
  };

  // ── Schedule-type switch: clears overrides since dates change entirely ───
  const handleScheduleType = (val) => {
    setScheduleType(val);
    setDateAmounts({});
    notify(val, selectedDates, rangeStart, rangeEnd, rangeFreq, {});
  };

  // ── Date-range handlers: prune stale overrides when bounds change ────────
  const handleRangeStart = (val) => {
    setRangeStart(val);
    const nextAmounts = Object.fromEntries(
      Object.entries(dateAmounts).filter(([d]) => d >= val)
    );
    setDateAmounts(nextAmounts);
    notify(scheduleType, selectedDates, val, rangeEnd, rangeFreq, nextAmounts);
  };

  const handleRangeEnd = (val) => {
    setRangeEnd(val);
    const nextAmounts = Object.fromEntries(
      Object.entries(dateAmounts).filter(([d]) => d <= val)
    );
    setDateAmounts(nextAmounts);
    notify(scheduleType, selectedDates, rangeStart, val, rangeFreq, nextAmounts);
  };

  // Frequency changes regenerate dates entirely — clear overrides
  const handleRangeFreq = (val) => {
    setRangeFreq(val);
    setDateAmounts({});
    notify(scheduleType, selectedDates, rangeStart, rangeEnd, val, {});
  };

  const occurrences = scheduleType === "specific_dates"
    ? selectedDates.length
    : countOccurrences(rangeStart, rangeEnd, rangeFreq);

  // Per-date total helper (used in both sections)
  const calcPerDateTotal = (dates, amounts) =>
    dates.reduce((sum, d) => {
      const ov  = amounts[d] ?? "";
      const amt = ov !== "" ? Number(ov) : effectiveAmount;
      return sum + (isNaN(amt) ? effectiveAmount : amt);
    }, 0);

  return (
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
          {/* Calendar */}
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
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Per-date amounts */}
          {selectedDates.length > 0 && (
            <div className="flex flex-col gap-2 border border-[#EBEBEB] rounded-xl p-3 bg-[#FAFAFA]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-medium text-[#383838]">Amount Per Date</p>
                <p className="text-[11px] text-[#737373]">Default: {sym}{effectiveAmount}</p>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                {[...selectedDates].sort().map((d) => (
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
                  Total ({occurrences} payment{occurrences !== 1 ? "s" : ""})
                </span>
                <span className="text-[14px] font-bold text-[#EA3335] tabular-nums">
                  {sym}{calcPerDateTotal([...selectedDates].sort(), dateAmounts).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Start / End date pickers */}
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

          {/* Frequency */}
          <div>
            <label className="block text-[13px] font-medium text-[#383838] mb-2">Frequency</label>
            <Select value={rangeFreq} onChange={handleRangeFreq} options={FREQ_OPTIONS} />
          </div>

          {/* Summary pill */}
          {rangeStart && rangeEnd && occurrences > 0 && (
            <p className="text-[12px] text-[#737373] bg-[#F9F9F9] rounded-xl px-4 py-2.5 border border-[#EBEBEB]">
              {occurrences} payment{occurrences !== 1 ? "s" : ""} of {sym}{effectiveAmount} each
            </p>
          )}

          {/* Per-date amounts for date range */}
          {generatedDates.length > 0 && (
            <div className="flex flex-col gap-2 border border-[#EBEBEB] rounded-xl p-3 bg-[#FAFAFA]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-medium text-[#383838]">Amount Per Date</p>
                <p className="text-[11px] text-[#737373]">Default: {sym}{effectiveAmount}</p>
              </div>

              {/* Scrollable list */}
              <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                {generatedDates.map((d) => (
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
                  Total ({generatedDates.length} payment{generatedDates.length !== 1 ? "s" : ""})
                </span>
                <span className="text-[14px] font-bold text-[#EA3335] tabular-nums">
                  {sym}{calcPerDateTotal(generatedDates, dateAmounts).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringSchedule;

"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";
import MiniCalendar from "./MiniCalendar";
import countOccurrences from "../countOccurrences";

const SCHEDULE_TYPES = [
  { value: "specific_dates", label: "Specific Dates" },
  { value: "date_range",     label: "Date Range" },
];

const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily" },
  { value: "weekly",  label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const RecurringSchedule = ({ sym, effectiveAmount, initialScheduleType, initialConfig, onChange }) => {
  const [scheduleType,  setScheduleType]  = useState(initialScheduleType ?? "specific_dates");
  const [selectedDates, setSelectedDates] = useState(() =>
    (initialConfig?.dates ?? []).map((d) => d.split("T")[0])
  );
  const [rangeStart, setRangeStart] = useState(initialConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,   setRangeEnd]   = useState(initialConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,  setRangeFreq]  = useState(initialConfig?.frequency ?? "daily");

  const todayStr = new Date().toISOString().split("T")[0];

  const buildConfig = (type, dates, start, end, freq) => {
    if (type === "specific_dates") {
      const sorted = [...dates].sort();
      return { dates: sorted.map((d) => new Date(`${d}T00:00:00.000Z`).toISOString()) };
    }
    return {
      startDate: start ? new Date(`${start}T00:00:00.000Z`).toISOString() : "",
      endDate:   end   ? new Date(`${end}T00:00:00.000Z`).toISOString()   : "",
      frequency: freq,
    };
  };

  const notify = (type, dates, start, end, freq) => {
    const occurrences    = type === "specific_dates" ? dates.length : countOccurrences(start, end, freq);
    const scheduleConfig = buildConfig(type, dates, start, end, freq);
    onChange({ scheduleType: type, scheduleConfig, occurrences });
  };

  const handleScheduleType = (val) => { setScheduleType(val);  notify(val, selectedDates, rangeStart, rangeEnd, rangeFreq); };
  const handleRangeStart   = (val) => { setRangeStart(val);    notify(scheduleType, selectedDates, val, rangeEnd, rangeFreq); };
  const handleRangeEnd     = (val) => { setRangeEnd(val);      notify(scheduleType, selectedDates, rangeStart, val, rangeFreq); };
  const handleRangeFreq    = (val) => { setRangeFreq(val);     notify(scheduleType, selectedDates, rangeStart, rangeEnd, val); };

  const toggleDate = (dateStr) => {
    const next = selectedDates.includes(dateStr)
      ? selectedDates.filter((d) => d !== dateStr)
      : [...selectedDates, dateStr];
    setSelectedDates(next);
    notify(scheduleType, next, rangeStart, rangeEnd, rangeFreq);
  };

  const occurrences = scheduleType === "specific_dates"
    ? selectedDates.length
    : countOccurrences(rangeStart, rangeEnd, rangeFreq);

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
  );
};

export default RecurringSchedule;

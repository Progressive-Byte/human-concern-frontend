"use client";

import { useMemo } from "react";
import { monthOptions, yearOptions } from "./scheduleUtils";

// Month/year pickers for the "Monthly" and "Yearly" date-range frequencies. The two selects
// emit full ISO day keys upward ("2026-03" -> "2026-03-01", "2026" -> "2026-01-01") so the
// rest of the schedule code keeps working with plain start/end dates.
const PeriodRangePicker = ({
  frequency,
  rangeStart,
  rangeEnd,
  minDateStr = null,
  maxDateStr = null,
  onRangeStart,
  onRangeEnd,
}) => {
  const isYearly = frequency === "yearly";
  const sliceLen = isYearly ? 4 : 7;

  const startValue = String(rangeStart || "").slice(0, sliceLen);
  const endValue = String(rangeEnd || "").slice(0, sliceLen);

  const startOptions = useMemo(
    () => (isYearly ? yearOptions(minDateStr, maxDateStr) : monthOptions(minDateStr, maxDateStr)),
    [isYearly, minDateStr, maxDateStr]
  );
  const allEndOptions = useMemo(
    () => (isYearly ? yearOptions(minDateStr, maxDateStr) : monthOptions(minDateStr, maxDateStr)),
    [isYearly, minDateStr, maxDateStr]
  );

  // The end period can never come before the selected start period.
  const endOptions = useMemo(
    () => (startValue ? allEndOptions.filter((o) => o.value >= startValue) : allEndOptions),
    [allEndOptions, startValue]
  );

  const toDayKey = (periodValue) => (isYearly ? `${periodValue}-01-01` : `${periodValue}-01`);

  const handleStart = (periodValue) => {
    if (!periodValue) return;
    onRangeStart?.(toDayKey(periodValue));
    // Keep the range valid: if the start moved past the end, pull the end along.
    if (!endValue || endValue < periodValue) onRangeEnd?.(toDayKey(periodValue));
  };

  const handleEnd = (periodValue) => {
    if (!periodValue) return;
    onRangeEnd?.(toDayKey(periodValue));
  };

  const selectClass =
    "w-full rounded-xl border border-[#E5E5E5] bg-white px-3 py-2.5 text-[13px] text-[#383838] outline-none transition focus:border-[#EA3335] cursor-pointer";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">
          {isYearly ? "Start year" : "Start month"}
        </label>
        <select
          value={startValue}
          onChange={(e) => handleStart(e.target.value)}
          className={selectClass}
        >
          <option value="">Select {isYearly ? "year" : "month"}</option>
          {startOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">
          {isYearly ? "End year" : "End month"}
        </label>
        <select
          value={endValue}
          onChange={(e) => handleEnd(e.target.value)}
          className={selectClass}
        >
          <option value="">Select {isYearly ? "year" : "month"}</option>
          {endOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PeriodRangePicker;

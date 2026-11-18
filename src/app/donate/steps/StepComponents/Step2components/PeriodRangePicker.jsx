"use client";

import { useMemo } from "react";
import { monthOptions, yearOptions } from "./scheduleUtils";
import PeriodCalendar from "./PeriodCalendar";

// Month/year calendar pickers for the "Monthly" and "Yearly" date-range frequencies.
// They emit full ISO day keys upward ("2026-03" -> "2026-03-01", "2026" -> "2026-01-01")
// so the rest of the schedule code keeps working with plain start/end dates.
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

  const endOptions = useMemo(
    () => (startValue ? allEndOptions.filter((o) => o.value >= startValue) : allEndOptions),
    [allEndOptions, startValue]
  );

  const startAllowed = useMemo(
    () => new Set([...startOptions.map((o) => o.value), ...(startValue ? [startValue] : [])]),
    [startOptions, startValue]
  );
  const endAllowed = useMemo(
    () => new Set([...endOptions.map((o) => o.value), ...(endValue ? [endValue] : [])]),
    [endOptions, endValue]
  );

  const firstPeriod = startOptions[0]?.value || "";
  const toDayKey = (periodValue) => (isYearly ? `${periodValue}-01-01` : `${periodValue}-01`);

  const handleStart = (periodValue) => {
    if (!periodValue) return;
    onRangeStart?.(toDayKey(periodValue));
    if (!endValue || endValue < periodValue) onRangeEnd?.(toDayKey(periodValue));
  };

  const handleEnd = (periodValue) => {
    if (!periodValue) return;
    onRangeEnd?.(toDayKey(periodValue));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">
          {isYearly ? "Start year" : "Start month"}
        </label>
        <PeriodCalendar
          kind={isYearly ? "year" : "month"}
          selected={startValue}
          defaultPeriod={startValue || firstPeriod}
          allowed={startAllowed}
          onSelect={handleStart}
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">
          {isYearly ? "End year" : "End month"}
        </label>
        <PeriodCalendar
          kind={isYearly ? "year" : "month"}
          selected={endValue}
          defaultPeriod={endValue || startValue || firstPeriod}
          allowed={endAllowed}
          onSelect={handleEnd}
        />
      </div>
    </div>
  );
};

export default PeriodRangePicker;

"use client";

import { useMemo } from "react";
import countOccurrences from "../countOccurrences";
import { FREQ_OPTIONS } from "./scheduleUtils";
import MiniCalendar from "./MiniCalendar";

const DateRangeSection = ({
  rangeStart, rangeEnd, rangeFreq, customInterval,
  effectiveAmount, sym,
  lockedInterval = null,
  onRangeStart, onRangeEnd, onRangeFreq, onCustomInterval,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const diff = Math.floor((new Date(rangeEnd) - new Date(rangeStart)) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);

  const freqDisabled = useMemo(
    () => Object.fromEntries(FREQ_OPTIONS.map(({ value, minDays }) => [value, rangeDays > 0 && rangeDays < minDays])),
    [rangeDays]
  );

  const occurrences = countOccurrences(rangeStart, rangeEnd, rangeFreq, customInterval);

  return (
    <div className="flex flex-col gap-3">

      {/* Start / end date calendars — hidden when interval is locked by preset */}
      {lockedInterval == null && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#383838] mb-2">
              Start Date
              {rangeStart && (
                <span className="ml-2 text-[12px] font-normal text-[#737373]">{rangeStart}</span>
              )}
            </label>
            <MiniCalendar
              mode="single"
              selectedDates={rangeStart ? [rangeStart] : []}
              onToggleDate={(d) => onRangeStart(d)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#383838] mb-2">
              {rangeFreq === "custom" ? "Until Date" : "End Date"}
              {rangeEnd && (
                <span className="ml-2 text-[12px] font-normal text-[#737373]">{rangeEnd}</span>
              )}
            </label>
            <MiniCalendar
              mode="single"
              selectedDates={rangeEnd ? [rangeEnd] : []}
              minDateStr={rangeStart || todayStr}
              onToggleDate={(d) => onRangeEnd(d)}
            />
          </div>
        </div>
      )}

      {/* Frequency section */}
      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">Frequency</label>
        {lockedInterval != null ? (
          // Interval locked by admin preset — read-only chip, no editable controls
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-xl border text-[12px] font-medium border-[#EA3335] bg-[#FFF5F5] text-[#EA3335] cursor-default"
          >
            Interval
          </button>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {FREQ_OPTIONS.map(({ value, label, minDays }) => {
                const disabled = freqDisabled[value];
                const active   = rangeFreq === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRangeFreq(value)}
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
            {rangeDays > 0 && freqDisabled[rangeFreq] && (
              <p className="text-[11px] text-[#EA3335] mt-1.5 px-0.5">
                {`${FREQ_OPTIONS.find((o) => o.value === rangeFreq)?.label} requires at least ${FREQ_OPTIONS.find((o) => o.value === rangeFreq)?.minDays} days — switched to Daily.`}
              </p>
            )}
            {/* Custom interval input — only when frequency is "custom" and not locked */}
            {rangeFreq === "custom" && (
              <div className="flex items-center gap-3 bg-[#F9F9F9] border border-[#EBEBEB] rounded-xl px-4 py-3 mt-3">
                <span className="text-[13px] font-medium text-[#383838] whitespace-nowrap">Every</span>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={customInterval}
                  onChange={(e) => onCustomInterval(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg border border-[#E5E5E5] text-[14px] text-[#383838] text-center outline-none focus:border-[#EA3335] bg-white"
                />
                <span className="text-[13px] font-medium text-[#383838]">
                  day{customInterval !== 1 ? "s" : ""}
                </span>
                <span className="text-[11px] text-[#AEAEAE]">(max 15)</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment count summary */}
      {rangeStart && rangeEnd && occurrences > 0 && (
        <p className="text-[12px] text-[#737373] bg-[#F9F9F9] rounded-xl px-4 py-2.5 border border-[#EBEBEB]">
          {occurrences} payment{occurrences !== 1 ? "s" : ""} of {sym}{effectiveAmount} each
          {(lockedInterval != null || rangeFreq === "custom") && (
            <span className="ml-1 text-[#AEAEAE]">
              (every {lockedInterval ?? customInterval} day{(lockedInterval ?? customInterval) !== 1 ? "s" : ""})
            </span>
          )}
        </p>
      )}

    </div>
  );
}
export default DateRangeSection;
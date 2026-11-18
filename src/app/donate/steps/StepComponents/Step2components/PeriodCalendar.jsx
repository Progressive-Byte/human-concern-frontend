"use client";

import { useEffect, useState } from "react";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad2 = (n) => String(n).padStart(2, "0");

function startOfDecade(year) {
  return year - (year % 12);
}

const PeriodCalendar = ({
  kind = "month",
  selected = "",
  allowed,
  defaultPeriod = "",
  onSelect,
}) => {
  const isYearly = kind === "year";
  const selectedYear = /^\d{4}/.test(String(selected)) ? Number(String(selected).slice(0, 4)) : null;
  const fallbackYear =
    Number(String(defaultPeriod || "").slice(0, 4)) || new Date().getFullYear();

  const [viewYear, setViewYear] = useState(selectedYear || fallbackYear);
  const [decadeStart, setDecadeStart] = useState(() => startOfDecade(selectedYear || fallbackYear));

  useEffect(() => {
    // Keep the visible year/decade on the selected period. When the end is still
    // empty, follow the start period instead of jumping back to today.
    const year = selectedYear || fallbackYear;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the picker page to the selected period
    setViewYear(year);
    setDecadeStart(startOfDecade(year));
  }, [selectedYear, fallbackYear]);

  const allowedSet = allowed instanceof Set ? allowed : new Set(Array.isArray(allowed) ? allowed : []);
  const thisYear = new Date().getFullYear();
  const thisMonth = `${thisYear}-${pad2(new Date().getMonth() + 1)}`;

  const headerButton =
    "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#737373] text-[18px] leading-none transition-colors cursor-pointer";

  const cellBase =
    "py-2 rounded-lg text-[12px] font-medium transition-all";

  if (isYearly) {
    return (
      <div className="rounded-xl border border-[#E5E5E5] px-2 py-2 bg-white select-none">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            type="button"
            onClick={() => setDecadeStart((start) => start - 12)}
            className={headerButton}
          >
            ‹
          </button>
          <span className="text-[12px] font-semibold text-[#383838]">
            {decadeStart} – {decadeStart + 11}
          </span>
          <button
            type="button"
            onClick={() => setDecadeStart((start) => start + 12)}
            className={headerButton}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 px-0.5 pb-0.5 pt-1">
          {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((year) => {
            const value = String(year);
            const active = selected === value;
            const disabled = !allowedSet.has(value);

            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onSelect?.(value)}
                className={`${cellBase} ${
                  disabled
                    ? "text-[#D5D5D5] cursor-not-allowed"
                    : active
                    ? "bg-[#EA3335] text-white cursor-pointer"
                    : year === thisYear
                    ? "text-[#EA3335] ring-1 ring-[#EA3335] hover:bg-[#FFF5F5] cursor-pointer"
                    : "text-[#383838] hover:bg-[#FFF5F5] hover:text-[#EA3335] cursor-pointer"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] px-2 py-2 bg-white select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={() => setViewYear((year) => year - 1)}
          className={headerButton}
        >
          ‹
        </button>
        <span className="text-[12px] font-semibold text-[#383838]">{viewYear}</span>
        <button
          type="button"
          onClick={() => setViewYear((year) => year + 1)}
          className={headerButton}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-0.5 pb-0.5 pt-1">
        {MONTH_SHORT.map((name, index) => {
          const value = `${viewYear}-${pad2(index + 1)}`;
          const active = selected === value;
          const disabled = !allowedSet.has(value);

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onSelect?.(value)}
              className={`${cellBase} ${
                disabled
                  ? "text-[#D5D5D5] cursor-not-allowed"
                  : active
                  ? "bg-[#EA3335] text-white cursor-pointer"
                  : value === thisMonth
                  ? "text-[#EA3335] ring-1 ring-[#EA3335] hover:bg-[#FFF5F5] cursor-pointer"
                  : "text-[#383838] hover:bg-[#FFF5F5] hover:text-[#EA3335] cursor-pointer"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodCalendar;

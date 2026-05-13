import { useState } from "react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MiniCalendar = ({ selectedDates, onToggleDate, disablePast = false }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toDateStr = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells = Array(firstDayOfWeek).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selected = Array.isArray(selectedDates) ? selectedDates : [];

  return (
    <div className="select-none rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl text-[18px] leading-none text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
        >
          ‹
        </button>
        <span className="text-[12px] font-semibold text-[#111827]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl text-[18px] leading-none text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-center text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const dateStr = toDateStr(day);
          const dateObj = new Date(year, month, day);
          const isPast = disablePast ? dateObj < today : false;
          const isSel = selected.includes(dateStr);
          const isToday = dateObj.getTime() === today.getTime();

          return (
            <div key={i} className="flex items-center justify-center py-[3px]">
              <button
                type="button"
                disabled={isPast}
                onClick={() => onToggleDate?.(dateStr)}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-all",
                  isPast ? "cursor-not-allowed text-[#D1D5DB]" : "cursor-pointer",
                  isSel
                    ? "bg-[#111827] text-white"
                    : isToday && !isPast
                      ? "ring-1 ring-[#111827]/30 text-[#111827] hover:bg-[#F9FAFB]"
                      : !isPast
                        ? "text-[#111827] hover:bg-[#F9FAFB]"
                        : "",
                ].join(" ")}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;


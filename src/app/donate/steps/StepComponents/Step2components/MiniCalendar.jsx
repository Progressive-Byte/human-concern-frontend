import { useState } from "react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const MiniCalendar = ({ selectedDates, onToggleDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();

  const toDateStr = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells = Array(firstDayOfWeek).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-xl border border-[#E5E5E5] px-2 py-2 bg-white select-none">

      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#737373] text-[18px] leading-none transition-colors cursor-pointer"
        >
          ‹
        </button>
        <span className="text-[12px] font-semibold text-[#383838]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#737373] text-[18px] leading-none transition-colors cursor-pointer"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-center text-[10px] font-semibold text-[#AEAEAE] uppercase tracking-wide">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const dateStr = toDateStr(day);
          const dateObj = new Date(year, month, day);
          const isPast  = dateObj < today;
          const isSel   = selectedDates.includes(dateStr);
          const isToday = dateObj.getTime() === today.getTime();

          return (
            <div key={i} className="flex items-center justify-center py-[3px]">
              <button
                type="button"
                disabled={isPast}
                onClick={() => onToggleDate(dateStr)}
                className={[
                  "w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-medium transition-all",
                  isPast   ? "text-[#D5D5D5] cursor-not-allowed" : "cursor-pointer",
                  isSel    ? "bg-[#EA3335] text-white"
                  : isToday && !isPast
                           ? "ring-1 ring-[#EA3335] text-[#EA3335] hover:bg-[#FFF5F5]"
                  : !isPast ? "text-[#383838] hover:bg-[#FFF5F5]"
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

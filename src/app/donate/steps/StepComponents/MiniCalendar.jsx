import { useState } from "react";

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
    <div className="rounded-2xl border border-[#E5E5E5] p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#737373] text-lg transition-colors cursor-pointer"
        >
          ‹
        </button>
        <span className="text-[14px] font-semibold text-[#383838]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#737373] text-lg transition-colors cursor-pointer"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-center text-[11px] font-medium text-[#AEAEAE] py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const dateStr = toDateStr(day);
          const dateObj = new Date(year, month, day);
          const isPast  = dateObj < today;
          const isSel   = selectedDates.includes(dateStr);
          const isToday = dateObj.getTime() === today.getTime();

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => onToggleDate(dateStr)}
              className={[
                "w-full aspect-square flex items-center justify-center rounded-lg text-[12px] font-medium transition-all",
                isPast ? "text-[#D0D0D0] cursor-not-allowed" : "cursor-pointer",
                isSel
                  ? "bg-[#EA3335] text-white"
                  : isToday && !isPast
                  ? "border border-[#EA3335] text-[#EA3335] hover:bg-[#FFF5F5]"
                  : isPast
                  ? ""
                  : "hover:bg-[#FFF5F5] text-[#383838]",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default MiniCalendar;

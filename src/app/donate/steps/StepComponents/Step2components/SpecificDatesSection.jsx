"use client";

import MiniCalendar from "./MiniCalendar";

export default function SpecificDatesSection({ selectedDates, onToggleDate }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">
          Select Donation Dates
          {selectedDates.length > 0 && (
            <span className="ml-1.5 text-[#EA3335]">({selectedDates.length} selected)</span>
          )}
        </label>
        <MiniCalendar selectedDates={selectedDates} onToggleDate={onToggleDate} />
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
                  onClick={() => onToggleDate(d)}
                  className="ml-0.5 hover:text-[#c0272a] cursor-pointer leading-none"
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

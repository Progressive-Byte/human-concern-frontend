"use client";

import { CalendarIcon, ClockIcon } from "@/components/common/SvgIcon";
import ActionButtons from "./ActionButtons";
import { formatCurrency } from "@/utils/helpers";

const frequencyLabel = { Weekly: "per week", Monthly: "per month", Daily: "per day" };

const ScheduleCard = ({ s, isActive, isPaused, isCancelled, isCompleted, onPauseResume, onCancel }) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-4 md:p-5 hover:border-red-500/30 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
          {CalendarIcon}
        </div>

        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-1.5">
              <h3 className="font-semibold text-[#111827] text-sm md:text-base leading-snug">{s.title}</h3>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isActive ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FFF8EC] text-[#B45309]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#047857] animate-pulse" : "bg-[#B45309]"}`} />
                {s.status}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              {s.frequency}&nbsp;•&nbsp;{s.cause}&nbsp;•&nbsp;Started {s.started}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 md:gap-3">
            <div className="text-right">
              <p className="text-xl md:text-2xl font-bold text-[#EA3335] leading-none">{formatCurrency(s.amount, s.currency)}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{frequencyLabel[s.frequency] ?? s.frequency.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-1">
              <ActionButtons
                isActive={isActive}
                isPaused={isPaused}
                isCancelled={isCancelled}
                isCompleted={isCompleted}
                slug={s.slug}
                onPauseResume={onPauseResume}
                onCancel={onCancel}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#6B7280]">
        <span className="inline-flex items-center gap-1.5">
          {ClockIcon}
          Next donation:&nbsp;
          <span className="font-semibold text-[#111827]">{s.next}</span>
        </span>
        <span>
          Total donated:&nbsp;
          <span className="font-semibold text-[#111827]">{formatCurrency(s.totalDonated, s.currency)}</span>
        </span>
      </div>
    </div>
  );
};

export default ScheduleCard;

"use client";

import ScheduleStatusPill from "../../components/ScheduleStatusPill";

export default function ScheduleDetailHeader({ schedule, donationId, loading = false }) {
  const formName = String(schedule?.formName || schedule?.campaignName || "—");
  const status = String(schedule?.scheduleStatus || schedule?.status || "");

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-[18px] font-semibold text-[#111827]">{loading ? "Loading..." : formName}</div>
          <div className="mt-1 text-[13px] text-[#6B7280]">{donationId ? `Schedule: ${donationId}` : ""}</div>
        </div>

        <div className="flex items-center gap-2">
          {status ? <ScheduleStatusPill status={status} /> : null}
        </div>
      </div>
    </section>
  );
}


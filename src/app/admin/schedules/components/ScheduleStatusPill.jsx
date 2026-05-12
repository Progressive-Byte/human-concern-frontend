"use client";

const styles = {
  active: "bg-[#ECFDF5] text-[#047857]",
  completed: "bg-[#EEF2FF] text-[#3730A3]",
  cancelled: "bg-[#F3F4F6] text-[#6B7280]",
};

export default function ScheduleStatusPill({ status }) {
  const key = String(status || "").toLowerCase();
  const cls = styles[key] || "bg-[#F3F4F6] text-[#6B7280]";
  const label = key || "—";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${cls}`}>{label}</span>;
}


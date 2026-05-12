"use client";

import { useMemo } from "react";

function ActionButton({ children, onClick, disabled, variant = "light" }) {
  const cls =
    variant === "dark"
      ? "bg-[#111827] text-white hover:bg-[#111827]/95"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-600/95"
        : "bg-white text-[#111827] hover:bg-[#F9FAFB]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${cls}`}
    >
      {children}
    </button>
  );
}

export default function ScheduleAdminActionsCard({ schedule, loading = false, onCancel, cancelLoading = false }) {
  const status = useMemo(() => String(schedule?.scheduleStatus || "").toLowerCase(), [schedule]);
  const canCancel = status === "active";

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6B7280]" fill="none">
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.2-2-3.5-2.3.6a7.7 7.7 0 0 0-1.7-1l-.3-2.4H11l-.3 2.4a7.7 7.7 0 0 0-1.7 1l-2.3-.6-2 3.5 2 1.2a7.9 7.9 0 0 0 .1 2l-2 1.2 2 3.5 2.3-.6c.5.4 1.1.8 1.7 1l.3 2.4h4l.3-2.4c.6-.2 1.2-.6 1.7-1l2.3.6 2-3.5-2-1.2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        Admin Actions
      </div>

      <div className="mt-4 space-y-2">
        <ActionButton disabled={true || loading} variant="dark">
          View Full Details
        </ActionButton>
        <ActionButton disabled={true || loading}>Email Donor</ActionButton>
        <ActionButton disabled={!canCancel || loading || cancelLoading} onClick={onCancel} variant="danger">
          {cancelLoading ? "Cancelling..." : "Cancel Schedule"}
        </ActionButton>
        <ActionButton disabled={true || loading}>
          Export Data
        </ActionButton>
      </div>
    </section>
  );
}

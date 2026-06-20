"use client";

import { useEffect, useState } from "react";

function toDateInputValue(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ResumeScheduleModal({ open, onClose, onConfirm, loading, error }) {
  const [resumeFromDate, setResumeFromDate] = useState("");

  useEffect(() => {
    if (open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setResumeFromDate(toDateInputValue(tomorrow));
    }
  }, [open]);

  if (!open) return null;

  const today = toDateInputValue(new Date());

  const handleConfirm = () => {
    const isoDate = resumeFromDate ? new Date(resumeFromDate).toISOString() : "";
    onConfirm(isoDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-base font-semibold text-[#111827]">Resume Schedule</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Select the date from which your future payments should resume.
        </p>

        <div className="mt-4">
          <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
            Resume from date
          </label>
          <input
            type="date"
            value={resumeFromDate}
            min={today}
            onChange={(e) => setResumeFromDate(e.target.value)}
            disabled={loading}
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#EA3335] disabled:opacity-60 cursor-pointer"
          />
        </div>

        {error ? (
          <p className="mt-3 text-[13px] text-[#EA3335]">{error}</p>
        ) : null}

        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !resumeFromDate}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Resuming…" : "Resume Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

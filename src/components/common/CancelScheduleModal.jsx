"use client";

import { useEffect, useState } from "react";

export function CancelScheduleModal({ open, onClose, onConfirm, loading, error }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-base font-semibold text-[#111827]">Cancel Schedule</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          This will permanently cancel your schedule. Future payments will stop and this action cannot be undone.
        </p>

        <div className="mt-4">
          <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
            Reason{" "}
            <span className="text-[#9CA3AF] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. No longer needed"
            disabled={loading}
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#EA3335] disabled:opacity-60"
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
            Keep Schedule
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#EA3335] text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Cancelling…" : "Cancel Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

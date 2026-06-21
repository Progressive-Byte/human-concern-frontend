"use client";

import { useEffect, useState } from "react";

const CONFIG = {
  pause: {
    title: "Pause Schedule",
    description: "Your future payments will be paused. You can resume at any time.",
    inputType: "text",
    inputLabel: "Reason",
    inputPlaceholder: "e.g. Temporary financial constraints",
    required: false,
    confirmLabel: "Pause Schedule",
    confirmingLabel: "Pausing…",
    dismissLabel: "Cancel",
    confirmClass: "bg-amber-500 hover:bg-amber-600",
  },
  resume: {
    title: "Resume Schedule",
    description: "Select the date from which your future payments should resume.",
    inputType: "date",
    inputLabel: "Resume from date",
    inputPlaceholder: "",
    required: true,
    confirmLabel: "Resume Schedule",
    confirmingLabel: "Resuming…",
    dismissLabel: "Cancel",
    confirmClass: "bg-emerald-500 hover:bg-emerald-600",
  },
  cancel: {
    title: "Cancel Schedule",
    description:
      "This will permanently cancel your schedule. Future payments will stop and this action cannot be undone.",
    inputType: "text",
    inputLabel: "Reason",
    inputPlaceholder: "e.g. No longer needed",
    required: false,
    confirmLabel: "Cancel Schedule",
    confirmingLabel: "Cancelling…",
    dismissLabel: "Keep Schedule",
    confirmClass: "bg-[#EA3335] hover:bg-red-700",
  },
};

function toDateInputValue(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ScheduleActionModal({ mode, open, onClose, onConfirm, loading, error }) {
  const [value, setValue] = useState("");
  const cfg = CONFIG[mode];

  useEffect(() => {
    if (!open) return;
    if (mode === "resume") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setValue(toDateInputValue(tomorrow));
    } else {
      setValue("");
    }
  }, [open, mode]);

  if (!open || !cfg) return null;

  const today = toDateInputValue(new Date());

  const handleConfirm = () => {
    if (mode === "resume") {
      onConfirm(value ? new Date(value).toISOString() : "");
    } else {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-base font-semibold text-[#111827]">{cfg.title}</h2>
        <p className="mt-1 text-sm text-[#6B7280]">{cfg.description}</p>

        <div className="mt-4">
          <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
            {cfg.inputLabel}
            {!cfg.required && (
              <span className="text-[#9CA3AF] font-normal"> (optional)</span>
            )}
          </label>
          <input
            type={cfg.inputType}
            value={value}
            min={cfg.inputType === "date" ? today : undefined}
            onChange={(e) => setValue(e.target.value)}
            placeholder={cfg.inputPlaceholder || undefined}
            disabled={loading}
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#EA3335] disabled:opacity-60 cursor-pointer"
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
            {cfg.dismissLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || (cfg.required && !value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed ${cfg.confirmClass}`}
          >
            {loading ? cfg.confirmingLabel : cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

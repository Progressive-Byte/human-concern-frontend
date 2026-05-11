"use client";

import { useEffect, useRef, useState } from "react";

export default function DonorRowActions({ donor, onViewDetails, onEditProfile, onToggleStatus, onSendEmail }) {
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onDocDown(e) {
      const el = wrapRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-red-500/10"
        aria-label="Row actions"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#111827]" fill="none">
          <path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="hc-animate-dropdown absolute right-0 top-[44px] z-20 w-[200px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onViewDetails?.(donor);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            View details
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEditProfile?.(donor);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onToggleStatus?.(donor);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            {String(donor?.status).toLowerCase() === "active" ? "Suspend account" : "Activate account"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSendEmail?.(donor);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Send email
          </button>
        </div>
      ) : null}
    </div>
  );
}

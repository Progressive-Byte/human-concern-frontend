"use client";

import { useEffect, useRef, useState } from "react";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 6h.01M12 12h.01M12 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 8.5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M21 10V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 13l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GatewayRowActions = ({ row, onViewDetail, onForceClose, onForceOpen, onCanary }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      setOpen(false);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const circuitStatus = String(row?.circuitStatus || "");
  const canClose = circuitStatus !== "FORCE_CLOSED";
  const canOpen = circuitStatus !== "FORCE_OPEN";

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onViewDetail?.(row)}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-transparent text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
          aria-label="View detail"
          title="View details"
        >
          <EyeIcon />
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-transparent text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
          aria-label="Row actions"
        >
          <DotsIcon />
        </button>
      </div>

      {open ? (
        <div className="hc-animate-dropdown absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-xl border border-dashed border-[#E5E7EB] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onViewDetail?.(row);
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <EyeIcon />
            View Diagnostics
          </button>
          <div className="border-t border-[#F3F4F6]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onForceOpen?.(row);
            }}
            disabled={!canOpen}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-[13px] text-sky-700 transition hover:bg-[#F0F9FF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <OpenIcon />
            Force Open
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onForceClose?.(row);
            }}
            disabled={!canClose}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-[13px] text-red-700 transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BlockIcon />
            Force Close
          </button>
          <div className="border-t border-[#F3F4F6]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCanary?.(row);
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-[13px] text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RocketIcon />
            Run Canary Probe
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default GatewayRowActions;

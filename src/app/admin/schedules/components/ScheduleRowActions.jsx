"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 6h.01M12 12h.01M12 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function ScheduleRowActions({ donationId }) {
  const router = useRouter();
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

  const id = String(donationId || "").trim();

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
        aria-label="Row actions"
      >
        <DotsIcon />
      </button>

      {open ? (
        <div className="hc-animate-dropdown absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-dashed border-[#E5E7EB] bg-white shadow-lg">
          <button
            type="button"
            disabled={!id}
            onClick={() => {
              if (!id) return;
              setOpen(false);
              router.push(`/admin/schedules/${id}`);
            }}
            className="w-full px-4 py-3 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            View Details
          </button>
        </div>
      ) : null}
    </div>
  );
}


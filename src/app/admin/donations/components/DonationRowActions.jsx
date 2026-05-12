"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 6h.01M12 12h.01M12 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

async function copyText(value) {
  const text = String(value || "");
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export default function DonationRowActions({ donation }) {
  const toast = useToast();
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

  const id = String(donation?.id || "");
  const donorEmail = String(donation?.donor?.email || "");

  async function handleCopyId() {
    try {
      const ok = await copyText(id);
      if (!ok) throw new Error("Copy not supported");
      toast.success("Transaction ID copied");
      setOpen(false);
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function handleCopyEmail() {
    try {
      const ok = await copyText(donorEmail);
      if (!ok) throw new Error("Copy not supported");
      toast.success("Donor email copied");
      setOpen(false);
    } catch {
      toast.error("Failed to copy");
    }
  }

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
        <div className="hc-animate-dropdown absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-dashed border-[#E5E7EB] bg-white shadow-lg">
          <button
            type="button"
            onClick={handleCopyId}
            disabled={!id}
            className="w-full px-4 py-3 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Copy Transaction ID
          </button>
          <button
            type="button"
            onClick={handleCopyEmail}
            disabled={!donorEmail}
            className="w-full px-4 py-3 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Copy Donor Email
          </button>
        </div>
      ) : null}
    </div>
  );
}


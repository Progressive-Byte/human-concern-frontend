"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { createAdminCause, updateAdminCause } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

const EmojiPicker = dynamic(() => import("emoji-picker-react").then((m) => m.default || m), { ssr: false });

function EmojiPickerField({ value, onChange }) {
  const wrapRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("down");
  const [pickerHeight, setPickerHeight] = useState(420);
  const [pickerPos, setPickerPos] = useState({ left: 16, top: 16 });
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocDown(e) {
      const el = wrapRef.current;
      const pop = popoverRef.current;
      if (el && el.contains(e.target)) return;
      if (pop && pop.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function recalcPosition(nextPlacement, nextHeight) {
    const rect = wrapRef.current?.getBoundingClientRect?.();
    if (!rect) return;

    const width = 360;
    const gap = 12;
    const margin = 16;

    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const left = Math.min(Math.max(rect.left, margin), maxLeft);

    const top =
      nextPlacement === "up"
        ? Math.max(margin, Math.floor(rect.top - nextHeight - gap))
        : Math.min(Math.floor(rect.bottom + gap), Math.max(margin, window.innerHeight - nextHeight - margin));

    setPickerPos({ left, top });
  }

  useEffect(() => {
    if (!open) return;
    function onResizeOrScroll() {
      recalcPosition(placement, pickerHeight);
    }
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [open, placement, pickerHeight]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white text-[18px] text-[#111827]">
          {value || "❤️"}
        </div>
        <button
          type="button"
          onClick={() => {
            const nextOpen = !open;
            if (nextOpen) {
              const rect = wrapRef.current?.getBoundingClientRect?.();
              if (rect) {
                const margin = 16;
                const maxPickerHeight = 420;
                const minPickerHeight = 260;
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const preferUp = spaceBelow < maxPickerHeight && spaceAbove > spaceBelow;
                const nextPlacement = preferUp ? "up" : "down";
                const available = Math.max(0, (preferUp ? spaceAbove : spaceBelow) - margin);
                const nextHeight = Math.max(minPickerHeight, Math.min(maxPickerHeight, Math.floor(available)));
                setPlacement(nextPlacement);
                setPickerHeight(nextHeight);
                recalcPosition(nextPlacement, nextHeight);
              } else {
                setPlacement("down");
                setPickerHeight(420);
                setPickerPos({ left: 16, top: 16 });
              }
            }
            setOpen(nextOpen);
          }}
          className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          aria-label="Pick emoji"
        >
          Choose
        </button>
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="e.g. ❤️"
          className="min-w-0 flex-1 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        />
      </div>

      {open && portalNode
        ? createPortal(
            <div
              ref={popoverRef}
              className="hc-animate-dropdown fixed z-[95] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-lg"
              style={{ left: pickerPos.left, top: pickerPos.top }}
            >
              <EmojiPicker
                width={360}
                height={pickerHeight}
                theme="light"
                lazyLoadEmojis
                searchPlaceholder="Search emoji..."
                onEmojiClick={(emojiData) => {
                  onChange?.(emojiData?.emoji || "");
                  setOpen(false);
                }}
              />
            </div>,
            portalNode
          )
        : null}
    </div>
  );
}

export default function CauseUpsertModal({ open, mode, cause, onClose, onSuccess }) {
  const toast = useToast();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [fundCode, setFundCode] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("❤️");
  const [zakatEligible, setZakatEligible] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const title = useMemo(() => (isEdit ? "Edit Cause" : "Create New Cause"), [isEdit]);
  const primaryLabel = useMemo(() => (isEdit ? "Save Changes" : "Create Cause"), [isEdit]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);

    if (!isEdit) {
      setName("");
      setFundCode("");
      setDescription("");
      setIcon("❤️");
      setZakatEligible(false);
      setEnabled(true);
      return;
    }

    setName(String(cause?.name || ""));
    setFundCode(String(cause?.fundCode || ""));
    setDescription(String(cause?.description || ""));
    setIcon(String(cause?.icon || "❤️"));
    setZakatEligible(Boolean(cause?.zakatEligible));
    setEnabled(Boolean(cause?.enabled));
  }, [open, isEdit, cause]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      name: String(name || "").trim(),
      fundCode: String(fundCode || "").trim(),
      description: String(description || "").trim(),
      iconEmoji: String(icon || "").trim() || "❤️",
      zakatEligible: Boolean(zakatEligible),
      enabled: Boolean(enabled),
    };

    if (!payload.name) {
      setError("Cause name is required.");
      return;
    }
    if (!payload.fundCode) {
      setError("Fund code is required.");
      return;
    }
    if (!payload.description) {
      setError("Description is required.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const id = String(cause?.id || "");
        if (!id) throw new Error("Missing cause id.");
        await updateAdminCause(id, payload);
        toast.success("Cause updated");
      } else {
        await createAdminCause(payload);
        toast.success("Cause created");
      }

      onSuccess?.();
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative w-full max-w-[560px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">Add a new donation cause to the platform.</div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Cause Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="e.g. Education Fund"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Fund Code</div>
              <input
                value={fundCode}
                onChange={(e) => setFundCode(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="e.g. EDU-001"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[96px] w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="Describe the cause..."
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Icon (emoji)</div>
              <EmojiPickerField value={icon} onChange={setIcon} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
                <input
                  type="checkbox"
                  checked={zakatEligible}
                  onChange={(e) => setZakatEligible(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />
                Zakat Eligible
              </label>

              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />
                Enabled
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : primaryLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

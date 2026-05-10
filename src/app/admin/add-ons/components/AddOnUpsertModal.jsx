"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { createAdminAddOn, updateAdminAddOn } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import PricingBuilder from "./PricingBuilder";

const EmojiPicker = dynamic(() => import("emoji-picker-react").then((m) => m.default || m), { ssr: false });

function EmojiPickerField({ value, onChange }) {
  const wrapRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
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

  function recalcPosition(nextHeight) {
    const rect = wrapRef.current?.getBoundingClientRect?.();
    if (!rect) return;

    const width = 360;
    const gap = 12;
    const margin = 16;

    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const left = Math.min(Math.max(rect.left, margin), maxLeft);

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const preferUp = spaceBelow < nextHeight && spaceAbove > spaceBelow;
    const top = preferUp ? Math.max(margin, Math.floor(rect.top - nextHeight - gap)) : Math.floor(rect.bottom + gap);

    setPickerPos({ left, top });
  }

  useEffect(() => {
    if (!open) return;
    function onResizeOrScroll() {
      recalcPosition(pickerHeight);
    }
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [open, pickerHeight]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white text-[18px] text-[#111827]">
          {value || "🎁"}
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
                const available = Math.max(0, Math.max(spaceAbove, spaceBelow) - margin);
                const nextHeight = Math.max(minPickerHeight, Math.min(maxPickerHeight, Math.floor(available)));
                setPickerHeight(nextHeight);
                recalcPosition(nextHeight);
              } else {
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
          placeholder="e.g. 🎁"
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

function buildPricingPayload(mode, pricingState, amountNumber) {
  if (mode !== "formula") return undefined;

  const formula = String(pricingState?.formula || "").trim();
  const inputs = Array.isArray(pricingState?.inputs) ? pricingState.inputs : [];

  const payload = { type: "formula" };

  if (Number.isFinite(amountNumber) && amountNumber > 0) payload.baseUnitAmount = amountNumber;

  payload.formula = formula;

  payload.inputs = inputs.map((inp) => {
    return {
      key: String(inp?.key || "").trim(),
      label: String(inp?.label || "").trim(),
    };
  });

  return payload;
}

function validatePricing(mode, pricingState) {
  if (mode !== "formula") return "";

  const formula = String(pricingState?.formula || "").trim();
  if (!formula) return "Formula is required when using formula pricing.";

  const inputs = Array.isArray(pricingState?.inputs) ? pricingState.inputs : [];
  if (inputs.length === 0) return "At least one pricing input is required.";

  const keyRe = /^[a-z][a-z0-9_]*$/;
  const keys = [];
  for (const inp of inputs) {
    const key = String(inp?.key || "").trim();
    const label = String(inp?.label || "").trim();
    if (!key) return "Each pricing input must have a key.";
    if (!keyRe.test(key)) return `Invalid input key: ${key}`;
    if (keys.includes(key)) return `Duplicate input key: ${key}`;
    if (!label) return `Input "${key}" must have a label.`;
    keys.push(key);
  }

  return "";
}

export default function AddOnUpsertModal({ open, mode, addOn, onClose, onSuccess }) {
  const toast = useToast();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [iconEmoji, setIconEmoji] = useState("🎁");
  const [addonName, setAddonName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [amountFieldLabel, setAmountFieldLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [labelUnderAmount, setLabelUnderAmount] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [pricingMode, setPricingMode] = useState("fixed");
  const [pricingState, setPricingState] = useState({ formula: "", inputs: [] });

  const title = useMemo(() => (isEdit ? "Edit Add-On" : "Create New Add-On"), [isEdit]);
  const primaryLabel = useMemo(() => (isEdit ? "Save Changes" : "Create Add-On"), [isEdit]);

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
      setIconEmoji("🎁");
      setAddonName("");
      setShortDescription("");
      setAmountFieldLabel("");
      setAmount("");
      setLabelUnderAmount("");
      setEnabled(true);
      setPricingMode("fixed");
      setPricingState({ formula: "", inputs: [] });
      return;
    }

    setIconEmoji(String(addOn?.iconEmoji || "🎁"));
    setAddonName(String(addOn?.addonName || ""));
    setShortDescription(String(addOn?.shortDescription || ""));
    setAmountFieldLabel(String(addOn?.amountFieldLabel || ""));
    setAmount(addOn?.amount !== undefined && addOn?.amount !== null ? String(addOn.amount) : "");
    setLabelUnderAmount(String(addOn?.labelUnderAmount || ""));
    setEnabled(Boolean(addOn?.enabled));

    const t = String(addOn?.pricing?.type || "").toLowerCase();
    if (t === "formula") {
      setPricingMode("formula");
      setPricingState({
        formula: String(addOn?.pricing?.formula || ""),
        inputs: Array.isArray(addOn?.pricing?.inputs)
          ? addOn.pricing.inputs.map((i) => ({ key: String(i?.key || ""), label: String(i?.label || "") }))
          : [],
      });
    } else {
      setPricingMode("fixed");
      setPricingState({ formula: "", inputs: [] });
    }
  }, [open, isEdit, addOn]);

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
      iconEmoji: String(iconEmoji || "").trim(),
      addonName: String(addonName || "").trim(),
      amountFieldLabel: String(amountFieldLabel || "").trim(),
      amount: Number(String(amount || "").trim()),
      enabled: Boolean(enabled),
    };

    const sd = String(shortDescription || "").trim();
    if (sd) payload.shortDescription = sd;

    const lua = String(labelUnderAmount || "").trim();
    if (lua) payload.labelUnderAmount = lua;

    if (!payload.iconEmoji) {
      setError("Icon (emoji) is required.");
      return;
    }
    if (!payload.addonName) {
      setError("Add-on name is required.");
      return;
    }
    if (!payload.amountFieldLabel) {
      setError("Amount field label is required.");
      return;
    }
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }

    const pricingError = validatePricing(pricingMode, pricingState);
    if (pricingError) {
      setError(pricingError);
      return;
    }

    const pricingPayload = buildPricingPayload(pricingMode, pricingState, payload.amount);
    if (pricingPayload) payload.pricing = pricingPayload;

    setLoading(true);
    try {
      if (isEdit) {
        const id = String(addOn?.id || "");
        if (!id) throw new Error("Missing add-on id.");
        await updateAdminAddOn(id, payload);
        toast.success("Add-on updated");
      } else {
        await createAdminAddOn(payload);
        toast.success("Add-on created");
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

      <div className="hc-animate-dropdown relative w-full max-w-[680px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">Add a donation add-on to the platform.</div>
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
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Icon (emoji)</div>
              <EmojiPickerField value={iconEmoji} onChange={setIconEmoji} />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Add-On Name</div>
              <input
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder='e.g. "Fitrana (Zakat al-Fitr)"'
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Short Description</div>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Amount Field Label</div>
                <input
                  value={amountFieldLabel}
                  onChange={(e) => setAmountFieldLabel(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                  placeholder="e.g. Amount per Person"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Amount</div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Label Under Amount</div>
              <textarea
                value={labelUnderAmount}
                onChange={(e) => setLabelUnderAmount(e.target.value)}
                className="min-h-[88px] w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
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

            <PricingBuilder
              mode={pricingMode}
              pricing={pricingState}
              baseUnitAmount={amount}
              onChangeMode={(m) => {
                if (m === "formula") {
                  setPricingMode("formula");
                  setPricingState((prev) => ({
                    formula: prev?.formula || "baseUnitAmount * persons",
                    inputs:
                      Array.isArray(prev?.inputs) && prev.inputs.length > 0
                        ? prev.inputs
                        : [{ key: "persons", label: "Number of persons" }],
                  }));
                } else {
                  setPricingMode("fixed");
                  setPricingState({ formula: "", inputs: [] });
                }
              }}
              onChangePricing={setPricingState}
            />

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

"use client";

import { useEffect, useState } from "react";
import { RESOLUTION_METHODS } from "@/utils/errorMaps";
import { postResolveDiscrepancy } from "@/services/adminReconciliation";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

const OPTIONS = [
  {
    value: RESOLUTION_METHODS.MARK_AS_VERIFIED,
    label: "Mark as verified",
    description: "Legitimate difference, no action required.",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    value: RESOLUTION_METHODS.INITIATE_REFUND,
    label: "Initiate refund",
    description: "Refund the charge from the provider side.",
    tone: "bg-red-500/10 text-red-800 border-red-200",
  },
  {
    value: RESOLUTION_METHODS.RETRY_WEBHOOK,
    label: "Retry webhook / resync",
    description: "Re-play the webhook event to the local ledger.",
    tone: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
];

const ResolveDiscrepancyDialog = ({
  open,
  reportId,
  discrepancyId,
  discrepancy,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resolution, setResolution] = useState(RESOLUTION_METHODS.MARK_AS_VERIFIED);
  const [reason, setReason] = useState("");

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
    setSubmitting(false);
    setResolution(RESOLUTION_METHODS.MARK_AS_VERIFIED);
    setReason("");

    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const reasonValid = String(reason || "").trim().length >= 5;
  const canSubmit = !submitting && reportId && discrepancyId && reasonValid;

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await postResolveDiscrepancy(reportId, discrepancyId, {
        resolution,
        reason: String(reason).trim(),
      });
      toast.success("Discrepancy resolution recorded.");
      onSuccess?.(res?.data || res);
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Failed to record discrepancy resolution.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <button type="button" aria-label="Close dialog overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative w-full max-w-[620px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Resolve Discrepancy</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              {discrepancy?.id || discrepancy?.discrepancyId ? (
                <>Discrepancy <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[11px] text-[#111827]">{String(discrepancy.id || discrepancy.discrepancyId).slice(-10)}</code></>
              ) : (
                "Record a resolution and reason for this discrepancy."
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-[#111827]">Resolution</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {OPTIONS.map((opt) => {
                const active = resolution === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      active ? opt.tone : "border-dashed border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="resolution"
                        checked={active}
                        onChange={() => setResolution(opt.value)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold">{opt.label}</div>
                        <div className="mt-0.5 text-[11px] opacity-80">{opt.description}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-[#111827]">Resolution Notes</label>
              <span className={`text-[11px] ${reasonValid ? "text-emerald-700" : "text-[#9CA3AF]"}`}>
                {String(reason || "").trim().length} / 5 minimum
              </span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Provide at least 5 characters explaining why this resolution is correct."
              className="mt-1.5 w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
            {!reasonValid ? (
              <div className="mt-1 text-[12px] text-amber-700">Notes are required (minimum 5 characters).</div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="cursor-pointer rounded-xl bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Recording..." : "Record Resolution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveDiscrepancyDialog;

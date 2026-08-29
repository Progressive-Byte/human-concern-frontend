"use client";

import { useEffect, useState } from "react";
import { postExpireStaleChallenges } from "@/services/adminReconciliation";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

const ExpireStaleChallengesModal = ({ open, onClose, onSuccess }) => {
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [force, setForce] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

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
    setForce(false);
    setConfirmed(false);

    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");
    if (!confirmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await postExpireStaleChallenges({ force: Boolean(force) });
      const expiredCount = Number(
        res?.data?.expiredCount ||
        res?.expiredCount ||
        res?.data?.count ||
        0
      );
      toast.success(
        `Expired stale auth challenges${force ? " (forced)" : ""}. Affected: ${expiredCount}.`
      );
      onSuccess?.(res?.data || res);
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Failed to expire stale challenges.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative w-full max-w-[560px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Expire Stale Auth Challenges</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Mark abandoned 3DS / auth challenges older than the threshold as expired to release pending holds.
            </div>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-dashed border-[#E5E7EB]"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#111827]">Force expire</div>
                <div className="mt-0.5 text-[12px] text-[#6B7280]">
                  Skip the staleness threshold and expire <em className="not-italic font-medium">all</em> open challenges. Use only during incident response.
                </div>
              </div>
            </label>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-dashed border-[#E5E7EB]"
            />
            <div className="text-[13px] text-[#111827]">
              I understand this action closes pending auth challenges and may interrupt in-progress donor flows.
            </div>
          </label>

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
              disabled={!confirmed || submitting}
              className="cursor-pointer rounded-xl bg-[#B91C1C] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Expiring..." : "Expire Challenges"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpireStaleChallengesModal;

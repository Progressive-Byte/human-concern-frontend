"use client";

import { useEffect, useMemo, useState } from "react";
import { sendAdminDonorEmail } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

export default function SendDonorEmailModal({ open, donor, onClose, onSent }) {
  const toast = useToast();
  const donorLabel = useMemo(() => String(donor?.name || donor?.email || "Donor"), [donor]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setError("");
    setSubject("");
    setMessage("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSend(e) {
    e.preventDefault();
    setError("");

    const donorKey = String(donor?.key || "").trim();
    if (!donorKey) {
      setError("Missing donor key.");
      return;
    }

    const s = String(subject || "").trim();
    const m = String(message || "").trim();

    if (!s) {
      setError("Subject is required.");
      return;
    }
    if (!m) {
      setError("Message is required.");
      return;
    }

    setLoading(true);
    try {
      await sendAdminDonorEmail(donorKey, { subject: s, message: m });
      toast.success("Email sent");
      onSent?.();
    } catch (e2) {
      const msg = e2?.message || "Email send failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative w-full max-w-[640px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Send Email</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">To: {donorLabel}</div>
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

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Subject</div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="e.g. Thank you for your support"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Message</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[140px] w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="Write your message..."
              />
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
                {loading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


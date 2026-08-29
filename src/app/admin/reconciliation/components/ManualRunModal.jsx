"use client";

import { useEffect, useMemo, useState } from "react";
import { postManualReconciliationRun } from "@/services/adminReconciliation";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

const PROVIDER_OPTIONS = [
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "braintree", label: "Braintree" },
  { value: "adyen", label: "Adyen" },
  { value: "checkout", label: "Checkout.com" },
];

function toYYYYMMDD(dateStr) {
  if (!dateStr) return "";
  const s = String(dateStr).replace(/[^0-9]/g, "");
  return s.slice(0, 8);
}

function isoToInputDate(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

function inputDateToYYYYMMDD(inputVal) {
  if (!inputVal) return "";
  const [y, m, d] = String(inputVal).split("-");
  if (!y || !m || !d) return toYYYYMMDD(inputVal);
  return `${y}${m}${d}`;
}

const ManualRunModal = ({ open, onClose, onQueued }) => {
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [provider, setProvider] = useState("stripe");
  const [gatewayConfigurationId, setGatewayConfigurationId] = useState("default");
  const [dateInput, setDateInput] = useState(() => isoToInputDate(new Date().toISOString()));
  const [dateStrManual, setDateStrManual] = useState("");
  const [useManualDateStr, setUseManualDateStr] = useState(false);
  const [upToHoursOverride, setUpToHoursOverride] = useState(24);

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
    setProvider("stripe");
    setGatewayConfigurationId("default");
    setDateInput(isoToInputDate(new Date().toISOString()));
    setDateStrManual("");
    setUseManualDateStr(false);
    setUpToHoursOverride(24);

    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const dateStrYYYYMMDD = useMemo(() => {
    if (useManualDateStr) return toYYYYMMDD(dateStrManual);
    return inputDateToYYYYMMDD(dateInput);
  }, [useManualDateStr, dateStrManual, dateInput]);

  const hoursValid = useMemo(() => {
    const n = Number(upToHoursOverride);
    return Number.isFinite(n) && n >= 1 && n <= 720;
  }, [upToHoursOverride]);

  const dateValid = useMemo(() => {
    const s = String(dateStrYYYYMMDD || "");
    return /^\d{8}$/.test(s);
  }, [dateStrYYYYMMDD]);

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      String(provider || "").trim() !== "" &&
      dateValid &&
      hoursValid
    );
  }, [submitting, provider, dateValid, hoursValid]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await postManualReconciliationRun({
        provider,
        gatewayConfigurationId: String(gatewayConfigurationId || "default").trim() || "default",
        dateStrYYYYMMDD,
        upToHoursOverride: Number(upToHoursOverride),
      });

      toast.success("Reconciliation run queued. It will start processing shortly.");
      onQueued?.(res?.data || res);
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Failed to queue manual reconciliation run.";
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

      <div className="hc-animate-dropdown relative w-full max-w-[620px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Manual Reconciliation Run</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Trigger an on-demand reconciliation report against a provider&rsquo;s API for a given date.
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

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#111827]">Provider</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {PROVIDER_OPTIONS.map((opt) => {
                const active = String(provider) === String(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProvider(opt.value)}
                    className={`rounded-xl border px-3 py-2 text-[12px] font-semibold transition ${
                      active
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-dashed border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#111827]">
              Gateway Configuration ID
            </label>
            <input
              type="text"
              value={gatewayConfigurationId}
              onChange={(e) => setGatewayConfigurationId(e.target.value)}
              placeholder="default"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 font-mono text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-[12px] font-semibold text-[#111827]">Date (YYYYMMDD)</label>
              <label className="inline-flex items-center gap-2 text-[12px] text-[#6B7280]">
                <input
                  type="checkbox"
                  checked={useManualDateStr}
                  onChange={(e) => setUseManualDateStr(e.target.checked)}
                  className="h-4 w-4 rounded border-dashed border-[#E5E7EB]"
                />
                Edit YYYYMMDD directly
              </label>
            </div>

            {useManualDateStr ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={dateStrManual}
                  onChange={(e) => setDateStrManual(e.target.value)}
                  placeholder="20260101"
                  maxLength={8}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 font-mono text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
                {dateStrYYYYMMDD ? (
                  <div className="text-[12px] font-mono text-[#6B7280]">Effective: {dateStrYYYYMMDD}</div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="date"
                  value={dateInput || ""}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                />
                {dateStrYYYYMMDD ? (
                  <div className="text-[12px] font-mono text-[#6B7280]">Effective: {dateStrYYYYMMDD}</div>
                ) : null}
              </div>
            )}
            {!dateValid ? (
              <div className="mt-1 text-[12px] text-amber-700">Please select or enter a valid 8-digit YYYYMMDD date.</div>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#111827]">
              Lookback hours (1 – 720)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={720}
                step={1}
                value={upToHoursOverride}
                onChange={(e) => setUpToHoursOverride(e.target.value)}
                className="w-[140px] rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              />
              <div className="text-[12px] text-[#6B7280]">
                {hoursValid ? (
                  <>Approx {Number(upToHoursOverride) / 24 >= 1 ? `${(Number(upToHoursOverride) / 24).toFixed(1)} days` : `${Number(upToHoursOverride)}h`}</>
                ) : (
                  <span className="text-amber-700">Value must be between 1 and 720.</span>
                )}
              </div>
            </div>
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
              {submitting ? "Queuing..." : "Queue Manual Run"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualRunModal;

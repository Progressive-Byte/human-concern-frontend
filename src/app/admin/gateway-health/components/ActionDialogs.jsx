"use client";

import { useEffect, useState } from "react";

function ModalShell({ open, title, subtitle, onClose, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = size === "lg" ? "max-w-xl" : "max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} rounded-2xl bg-white shadow-xl`}>
        <div className="px-6 pt-5">
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p> : null}
        </div>
        <div className="px-6 py-4 space-y-4">{children}</div>
        {footer ? <div className="border-t border-[#F3F4F6] px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

function AdminNotesTextarea({ value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
        Admin Notes
        <span className="text-[#9CA3AF] font-normal"> (optional)</span>
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder="Context for this action…"
        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827]/30 disabled:opacity-60 resize-y"
      />
    </div>
  );
}

function FooterButtons({
  cancelLabel = "Cancel",
  confirmLabel,
  confirmingLabel,
  confirming = false,
  error = "",
  disabled = false,
  danger = false,
  onCancel,
  onConfirm,
}) {
  const confirmClass = danger
    ? "bg-[#EA3335] hover:bg-red-700 text-white"
    : "bg-[#111827] hover:bg-black text-white";
  return (
    <div className="space-y-3">
      {error ? <p className="text-[13px] text-[#EA3335]">{error}</p> : null}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming || disabled}
          className={`px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${confirmClass}`}
        >
          {confirming ? confirmingLabel : confirmLabel}
        </button>
      </div>
    </div>
  );
}

export function ForceCloseDialog({ open, row = null, onClose, onConfirm, loading = false, error = "" }) {
  const [notes, setNotes] = useState("");

  return (
    <ModalShell
      open={open}
      title="Force Close Circuit"
      subtitle={row ? `Block traffic for ${row.provider} (${String(row.confId || "").slice(-8) || row.confId}) immediately.` : ""}
      onClose={loading ? undefined : onClose}
      footer={
        <FooterButtons
          cancelLabel="Keep Open"
          confirmLabel="Force Close"
          confirmingLabel="Closing…"
          confirming={loading}
          error={error}
          danger
          onCancel={onClose}
          onConfirm={() => onConfirm?.({ adminNotes: notes })}
        />
      }
    >
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
        All transactions routed to this configuration will fail with a circuit-blocked error until manually re-opened or auto-expired.
      </div>
      <AdminNotesTextarea value={notes} onChange={setNotes} disabled={loading} />
    </ModalShell>
  );
}

const OPEN_DURATION_OPTIONS = [
  { label: "Persistent (until closed)", valueMs: 0 },
  { label: "15 minutes", valueMs: 15 * 60 * 1000 },
  { label: "1 hour (default)", valueMs: 60 * 60 * 1000 },
  { label: "24 hours", valueMs: 24 * 60 * 60 * 1000 },
];

export function ForceOpenDialog({ open, row = null, onClose, onConfirm, loading = false, error = "" }) {
  const [notes, setNotes] = useState("");
  const [durationMs, setDurationMs] = useState(60 * 60 * 1000);

  return (
    <ModalShell
      open={open}
      title="Force Open Circuit"
      subtitle={row ? `Override breaker for ${row.provider} and allow traffic through.` : ""}
      onClose={loading ? undefined : onClose}
      footer={
        <FooterButtons
          cancelLabel="Cancel"
          confirmLabel="Force Open"
          confirmingLabel="Opening…"
          confirming={loading}
          error={error}
          onCancel={onClose}
          onConfirm={() => onConfirm?.({ openDurationMs: durationMs, adminNotes: notes })}
        />
      }
    >
      <div>
        <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Open Duration</label>
        <select
          value={String(durationMs)}
          onChange={(e) => setDurationMs(Number(e.target.value))}
          disabled={loading}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 px-3 text-[13px] text-[#111827] focus:outline-none focus:border-[#111827]/30 disabled:opacity-60"
        >
          {OPEN_DURATION_OPTIONS.map((o) => (
            <option key={o.valueMs} value={o.valueMs}>{o.label}</option>
          ))}
        </select>
      </div>
      <AdminNotesTextarea value={notes} onChange={setNotes} disabled={loading} />
    </ModalShell>
  );
}

export function CanaryDialog({ open, row = null, onClose, onConfirm, loading = false, error = "", result = null }) {
  const [notes, setNotes] = useState("");
  const [amountMinor, setAmountMinor] = useState(100);
  const [currency, setCurrency] = useState("USD");
  const [testMode, setTestMode] = useState(true);

  const hasResult = result && typeof result === "object";
  const resultSuccess = hasResult && (String(result.status || "").toLowerCase() === "succeeded" || Boolean(result.success));

  return (
    <ModalShell
      open={open}
      title="Run Canary Probe"
      subtitle={row ? `Send a test payment through ${row.provider} to validate end-to-end connectivity.` : ""}
      onClose={loading ? undefined : onClose}
      size="lg"
      footer={
        hasResult ? (
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              Close
            </button>
          </div>
        ) : (
          <FooterButtons
            cancelLabel="Cancel"
            confirmLabel="Run Probe"
            confirmingLabel="Running…"
            confirming={loading}
            error={error}
            onCancel={onClose}
            onConfirm={() => onConfirm?.({ amountMinor, currency, testMode, adminNotes: notes })}
          />
        )
      }
    >
      {hasResult ? (
        <div className={`rounded-2xl border-2 border-dashed p-5 ${resultSuccess ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
          <div className="flex items-center gap-3">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${resultSuccess ? "bg-emerald-500/20 text-emerald-700" : "bg-red-500/20 text-red-700"}`}>
              {resultSuccess ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <div className={`text-[15px] font-semibold ${resultSuccess ? "text-emerald-800" : "text-red-800"}`}>
                {resultSuccess ? "Canary Succeeded" : "Canary Failed"}
              </div>
              <div className={`text-[12px] ${resultSuccess ? "text-emerald-700" : "text-red-700"}`}>
                {String(result.message || result.error || result.body || "No details").slice(0, 200)}
              </div>
            </div>
          </div>
          {typeof result.durationMs !== "undefined" || typeof result.provider !== "undefined" ? (
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {typeof result.durationMs !== "undefined" ? (
                <div className="rounded-xl bg-white p-3 border border-dashed border-[#E5E7EB]">
                  <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">Duration</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold tabular-nums text-[#111827]">{Number(result.durationMs || 0).toFixed(0)} ms</dd>
                </div>
              ) : null}
              {typeof result.provider !== "undefined" && result.provider ? (
                <div className="rounded-xl bg-white p-3 border border-dashed border-[#E5E7EB]">
                  <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">Provider Reference</dt>
                  <dd className="mt-0.5 text-[12px] font-mono text-[#111827] truncate" title={String(result.provider)}>{String(result.provider)}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {result.raw ? (
            <pre className="mt-4 rounded-xl bg-[#111827] p-3 text-[11px] text-[#E5E7EB] overflow-x-auto max-h-[200px] overflow-y-auto">
              {typeof result.raw === "string" ? result.raw : JSON.stringify(result.raw, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Amount (cents)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={amountMinor}
                onChange={(e) => setAmountMinor(Number(e.target.value) || 0)}
                disabled={loading}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#111827]/30 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Currency</label>
              <input
                type="text"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                disabled={loading}
                placeholder="USD"
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm uppercase font-semibold tracking-wider text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827]/30 disabled:opacity-60"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5">
            <div>
              <div className="text-[13px] font-medium text-[#374151]">Test Mode</div>
              <div className="text-[11px] text-[#6B7280]">Use provider sandbox / auth-only when possible.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={testMode}
              onClick={() => setTestMode((v) => !v)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60 ${testMode ? "bg-[#111827]" : "bg-[#E5E7EB]"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${testMode ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
          <AdminNotesTextarea value={notes} onChange={setNotes} disabled={loading} />
        </>
      )}
    </ModalShell>
  );
}

export function ResetCountersDialog({ open, row = null, onClose, onConfirm, loading = false, error = "" }) {
  const [notes, setNotes] = useState("");

  return (
    <ModalShell
      open={open}
      title="Reset Counters"
      subtitle={row ? `Clear success/failure tallies and recent history for ${row.provider}.` : ""}
      onClose={loading ? undefined : onClose}
      footer={
        <FooterButtons
          cancelLabel="Cancel"
          confirmLabel="Reset Counters"
          confirmingLabel="Resetting…"
          confirming={loading}
          error={error}
          onCancel={onClose}
          onConfirm={() => onConfirm?.({ adminNotes: notes })}
        />
      }
    >
      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
        Rolling windows and SLO calculations will start fresh after this operation.
      </div>
      <AdminNotesTextarea value={notes} onChange={setNotes} disabled={loading} />
    </ModalShell>
  );
}

export function BulkPauseDialog({ open, provider = "", onClose, onConfirm, loading = false, error = "" }) {
  const [notes, setNotes] = useState("");

  return (
    <ModalShell
      open={open}
      title="Bulk Pause Provider"
      subtitle={`Pause all configurations for ${provider || "this provider"} across all jurisdictions.`}
      onClose={loading ? undefined : onClose}
      footer={
        <FooterButtons
          cancelLabel="Cancel"
          confirmLabel="Pause All"
          confirmingLabel="Pausing…"
          confirming={loading}
          error={error}
          danger
          onCancel={onClose}
          onConfirm={() => onConfirm?.({ adminNotes: notes })}
        />
      }
    >
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
        This will force-close every active circuit for the provider. Use for incidents, migrations, or scheduled maintenance.
      </div>
      <AdminNotesTextarea value={notes} onChange={setNotes} disabled={loading} />
    </ModalShell>
  );
}

export function BulkResumeDialog({ open, provider = "", onClose, onConfirm, loading = false, error = "" }) {
  const [notes, setNotes] = useState("");

  return (
    <ModalShell
      open={open}
      title="Bulk Resume Provider"
      subtitle={`Return all ${provider || "provider"} configurations to normal auto-tracking.`}
      onClose={loading ? undefined : onClose}
      footer={
        <FooterButtons
          cancelLabel="Cancel"
          confirmLabel="Resume All"
          confirmingLabel="Resuming…"
          confirming={loading}
          error={error}
          onCancel={onClose}
          onConfirm={() => onConfirm?.({ adminNotes: notes })}
        />
      }
    >
      <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50 p-3 text-[13px] text-sky-800">
        Force-open overrides will be lifted. Circuits will resume to TRACKING and re-arm breakers naturally.
      </div>
      <AdminNotesTextarea value={notes} onChange={setNotes} disabled={loading} />
    </ModalShell>
  );
}

export function SweepConfirmDialog({ open, onClose, onConfirm, loading = false, error = "" }) {
  return (
    <ModalShell
      open={open}
      title="Sweep Expired Open Overrides"
      subtitle="Remove any force-open circuits whose duration has elapsed."
      onClose={loading ? undefined : onClose}
      footer={
        <FooterButtons
          cancelLabel="Cancel"
          confirmLabel="Run Sweep"
          confirmingLabel="Sweeping…"
          confirming={loading}
          error={error}
          onCancel={onClose}
          onConfirm={() => onConfirm?.()}
        />
      }
    >
      <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-3 text-[13px] text-[#6B7280]">
        This is a maintenance housekeeping action and should not affect currently-healthy circuits.
      </div>
    </ModalShell>
  );
}

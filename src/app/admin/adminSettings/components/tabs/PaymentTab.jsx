"use client";

import { useEffect, useMemo, useState } from "react";
import SettingsSectionCard from "../SettingsSectionCard";

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M4 7h16v10H4V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(enabled)}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60 ${
        enabled ? "bg-[#111827]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ModalShell({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close modal overlay" />
      <div className="hc-animate-dropdown relative w-full max-w-[560px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] px-5 py-4">
          <div className="text-[15px] font-semibold text-[#111827]">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 ${props.className || ""}`.trim()}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[120px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 ${props.className || ""}`.trim()}
    />
  );
}

function ActionButton({ children, onClick, disabled, variant = "light" }) {
  const cls =
    variant === "dark"
      ? "bg-[#111827] text-white hover:bg-[#111827]/90"
      : variant === "danger"
        ? "bg-white text-[#111827] hover:bg-red-500/10 hover:text-red-700"
        : "bg-white text-[#111827] hover:bg-[#F9FAFB]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-semibold transition disabled:opacity-60 ${cls}`}
    >
      {children}
    </button>
  );
}

function ProviderLabel({ provider }) {
  const p = String(provider || "").toLowerCase();
  if (p === "bank_transfer") return "Bank Transfer";
  return p ? p[0].toUpperCase() + p.slice(1) : "Provider";
}

export default function PaymentTab({ value, loading, busy, onConfigure, onToggleEnabled, onDisconnect }) {
  const gateways = useMemo(() => {
    const arr = Array.isArray(value?.gateways) ? value.gateways : [];
    const byProvider = new Map(arr.map((g) => [String(g?.provider || g?.id || "").toLowerCase(), g]));
    const providers = ["stripe", "paypal", "bank_transfer"];
    return providers.map((p) => ({ provider: p, ...(byProvider.get(p) || {}) }));
  }, [value]);

  const [openProvider, setOpenProvider] = useState("");
  const [form, setForm] = useState({});

  const activeProvider = String(openProvider || "");

  function openConfig(provider) {
    setOpenProvider(provider);
    setForm({});
  }

  function closeConfig() {
    setOpenProvider("");
    setForm({});
  }

  async function saveConfig() {
    if (!activeProvider) return;
    const provider = activeProvider;
    const payload = { ...(form || {}) };
    await onConfigure?.(provider, payload);
    closeConfig();
  }

  function renderConfigFields() {
    if (activeProvider === "stripe") {
      return (
        <div className="space-y-4">
          <Field label="API Key">
            <TextInput value={form.apiKey || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), apiKey: e.target.value }))} placeholder="pk_live_..." />
          </Field>
          <Field label="Secret Key">
            <TextInput value={form.secretKey || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), secretKey: e.target.value }))} placeholder="sk_live_..." />
          </Field>
          <Field label="Webhook URL">
            <TextInput value={form.webhookUrl || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), webhookUrl: e.target.value }))} placeholder="https://example.com/webhook" />
          </Field>
          <Field label="Webhook Signing Secret (optional)">
            <TextInput
              value={form.webhookSigningSecret || ""}
              onChange={(e) => setForm((p) => ({ ...(p || {}), webhookSigningSecret: e.target.value }))}
              placeholder="whsec_..."
            />
          </Field>
        </div>
      );
    }

    if (activeProvider === "paypal") {
      return (
        <div className="space-y-4">
          <Field label="Client ID">
            <TextInput value={form.clientId || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), clientId: e.target.value }))} placeholder="Abcd..." />
          </Field>
          <Field label="Client Secret">
            <TextInput value={form.clientSecret || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), clientSecret: e.target.value }))} placeholder="XyZ..." />
          </Field>
          <Field label="Webhook ID (optional)">
            <TextInput value={form.webhookId || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), webhookId: e.target.value }))} placeholder="9AB123..." />
          </Field>
        </div>
      );
    }

    if (activeProvider === "bank_transfer") {
      return (
        <div className="space-y-4">
          <Field label="Instructions">
            <TextArea value={form.instructions || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), instructions: e.target.value }))} placeholder="Please transfer to ..." />
          </Field>
        </div>
      );
    }

    return null;
  }

  return (
    <SettingsSectionCard icon={<CreditCardIcon />} title="Payment" subtitle="Configure payment gateways">
      <div className="space-y-4">
        {gateways.map((g) => {
          const provider = String(g?.provider || "").toLowerCase();
          const enabled = Boolean(g?.enabled);
          const configured = Boolean(g?.configured ?? g?.isConfigured ?? g?.hasConfiguration);
          return (
            <div key={provider} className="flex flex-col gap-3 rounded-2xl border border-[#F3F4F6] p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#111827]">
                  <ProviderLabel provider={provider} />
                </div>
                <div className="mt-1 text-[12px] text-[#6B7280]">
                  {configured ? "Configured" : "Not configured"} · {enabled ? "Enabled" : "Disabled"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ActionButton onClick={() => openConfig(provider)} disabled={loading || busy} variant="light">
                  Configure
                </ActionButton>
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Enabled</div>
                  <ToggleSwitch enabled={enabled} disabled={loading || busy} onChange={(next) => onToggleEnabled?.(provider, next)} />
                </div>
                <ActionButton onClick={() => onDisconnect?.(provider)} disabled={loading || busy} variant="danger">
                  Disconnect
                </ActionButton>
              </div>
            </div>
          );
        })}

        {loading ? <div className="text-[13px] text-[#6B7280]">Loading...</div> : null}
      </div>

      <ModalShell open={Boolean(openProvider)} title={`Configure ${activeProvider}`} onClose={closeConfig}>
        {renderConfigFields()}
        <div className="mt-6 flex items-center justify-end gap-2">
          <ActionButton onClick={closeConfig} disabled={busy} variant="light">
            Cancel
          </ActionButton>
          <ActionButton onClick={saveConfig} disabled={busy} variant="dark">
            Save
          </ActionButton>
        </div>
      </ModalShell>
    </SettingsSectionCard>
  );
}


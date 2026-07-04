"use client";

import { useEffect, useMemo, useState } from "react";
import SettingsSectionCard from "../SettingsSectionCard";

const PROVIDERS = ["stripe", "paypal", "bank_transfer"];

function getProviderLabel(provider) {
  const p = String(provider || "").toLowerCase();
  if (p === "bank_transfer") return "Bank Transfer";
  return p ? p[0].toUpperCase() + p.slice(1) : "Provider";
}

function shortId(value) {
  const input = String(value || "").trim();
  if (!input) return "";
  if (input.length <= 8) return input;
  return `${input.slice(0, 4)}...${input.slice(-4)}`;
}

function getConfigId(config) {
  return String(config?.configurationId || config?.id || config?._id || "").trim();
}

function getActiveConfigurationIds(gateway) {
  const ids = Array.isArray(gateway?.activeConfigurationIds) ? gateway.activeConfigurationIds : [];
  const normalized = ids.map((id) => getConfigId({ configurationId: id })).filter(Boolean);
  if (normalized.length) return normalized;
  const activeConfigurationId = getConfigId({ configurationId: gateway?.activeConfigurationId });
  return activeConfigurationId ? [activeConfigurationId] : [];
}

function normalizeGateways(value) {
  const rawGateways = Array.isArray(value?.gateways)
    ? value.gateways
    : value?.gateways && typeof value.gateways === "object"
      ? Object.values(value.gateways)
      : [];

  const byProvider = new Map(rawGateways.map((gateway) => [String(gateway?.provider || gateway?.id || "").toLowerCase(), gateway]));

  return PROVIDERS.map((provider) => {
    const gateway = byProvider.get(provider) || {};
    const activeConfigurationIds = getActiveConfigurationIds(gateway);
    const activeConfigurationId = activeConfigurationIds[0] || "";
    const configurations = (Array.isArray(gateway?.configurations) ? gateway.configurations : []).map((config) => {
      const configurationId = getConfigId(config);
      return {
        ...config,
        configurationId,
        enabled:
          typeof config?.enabled === "boolean"
            ? config.enabled
            : Boolean(configurationId && activeConfigurationIds.includes(configurationId)),
      };
    });

    return {
      ...gateway,
      provider,
      activeConfigurationId,
      activeConfigurationIds,
      configurations,
      configured: Boolean(gateway?.configured ?? gateway?.isConfigured ?? gateway?.hasConfiguration ?? configurations.length > 0),
      enabled: Boolean(gateway?.enabled ?? configurations.some((config) => config.enabled)),
    };
  });
}

function getInitialForm(provider, config) {
  const configurationId = getConfigId(config);
  const name = String(config?.name || config?.label || config?.title || config?.displayName || "").trim();

  if (provider === "stripe") {
    return {
      configurationId,
      name,
      apiKey: String(config?.apiKey || "").trim(),
      secretKey: "",
      webhookUrl: String(config?.webhookUrl || "").trim(),
      webhookSigningSecret: "",
    };
  }

  if (provider === "paypal") {
    return {
      configurationId,
      name,
      clientId: String(config?.clientId || "").trim(),
      clientSecret: "",
      webhookId: String(config?.webhookId || "").trim(),
    };
  }

  if (provider === "bank_transfer") {
    return {
      configurationId,
      name,
      instructions: String(config?.instructions || "").trim(),
    };
  }

  return { configurationId, name };
}

function buildConfigurationPayload(provider, form) {
  const payload = {};
  const configurationId = String(form?.configurationId || "").trim();
  const name = String(form?.name || "");
  if (configurationId) payload.configurationId = configurationId;
  payload.name = name;

  if (provider === "stripe") {
    payload.apiKey = String(form?.apiKey || "");
    payload.secretKey = String(form?.secretKey || "");
    payload.webhookUrl = String(form?.webhookUrl || "");
    const webhookSigningSecret = String(form?.webhookSigningSecret || "");
    if (webhookSigningSecret.trim()) payload.webhookSigningSecret = webhookSigningSecret;
    return payload;
  }

  if (provider === "paypal") {
    payload.clientId = String(form?.clientId || "");
    payload.clientSecret = String(form?.clientSecret || "");
    const webhookId = String(form?.webhookId || "");
    if (webhookId.trim()) payload.webhookId = webhookId;
    return payload;
  }

  if (provider === "bank_transfer") {
    payload.instructions = String(form?.instructions || "");
    return payload;
  }

  return payload;
}

function getProviderSummary(gateway) {
  const count = Array.isArray(gateway?.configurations) ? gateway.configurations.length : 0;
  const parts = [count === 1 ? "1 configuration" : `${count} configurations`];

  if (!count && !gateway?.configured) parts[0] = "No saved configurations";
  parts.push(gateway?.enabled ? "1 active" : "No active configuration");

  return parts.join(" · ");
}

function getConfigSummary(provider, config) {
  const configurationId = getConfigId(config);
  const parts = [];

  if (provider === "stripe" && config?.webhookUrl) parts.push(String(config.webhookUrl));
  if (provider === "paypal" && config?.webhookId) parts.push(`Webhook ${config.webhookId}`);
  if (provider === "bank_transfer" && config?.instructions) {
    const text = String(config.instructions).trim();
    parts.push(text.length > 120 ? `${text.slice(0, 117)}...` : text);
  }
  if (!parts.length && configurationId) parts.push(`ID ${shortId(configurationId)}`);
  if (!parts.length) parts.push("Saved configuration");

  return parts.join(" · ");
}

function getConfigTitle(provider, config, index) {
  const preferred = String(config?.label || config?.name || config?.title || config?.displayName || "").trim();
  if (preferred) return preferred;

  const configurationId = getConfigId(config);
  if (configurationId) return `${getProviderLabel(provider)} ${shortId(configurationId)}`;

  return `${getProviderLabel(provider)} configuration ${index + 1}`;
}

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
      ? "bg-red-600 text-white hover:bg-red-700"
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
  return getProviderLabel(provider);
}

const PaymentTab = ({ value, loading, busy, onConfigure, onToggleEnabled, onDisconnect }) => {
  const gateways = useMemo(() => normalizeGateways(value), [value]);

  const [openProvider, setOpenProvider] = useState("");
  const [editingConfigurationId, setEditingConfigurationId] = useState("");
  const [form, setForm] = useState({});
  const [expandedProviders, setExpandedProviders] = useState({});

  const activeProvider = String(openProvider || "");

  function toggleProviderSection(provider) {
    setExpandedProviders((prev) => ({ ...(prev || {}), [provider]: !prev?.[provider] }));
  }

  function openConfig(provider, config) {
    setOpenProvider(provider);
    setEditingConfigurationId(getConfigId(config));
    setForm(getInitialForm(provider, config));
    setExpandedProviders((prev) => ({ ...(prev || {}), [provider]: true }));
  }

  function closeConfig() {
    setOpenProvider("");
    setEditingConfigurationId("");
    setForm({});
  }

  async function saveConfig() {
    if (!activeProvider) return;
    const payload = buildConfigurationPayload(activeProvider, form);
    await onConfigure?.(activeProvider, payload);
    closeConfig();
  }

  function renderConfigFields() {
    const namePlaceholder =
      activeProvider === "stripe"
        ? "Primary Stripe"
        : activeProvider === "paypal"
          ? "Primary PayPal"
          : activeProvider === "bank_transfer"
            ? "Main Bank Transfer"
            : "Configuration name";

    if (activeProvider === "stripe") {
      return (
        <div className="space-y-4">
          <Field label="Configuration Name">
            <TextInput value={form.name || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), name: e.target.value }))} placeholder={namePlaceholder} />
          </Field>
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
          <Field label="Configuration Name">
            <TextInput value={form.name || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), name: e.target.value }))} placeholder={namePlaceholder} />
          </Field>
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
          <Field label="Configuration Name">
            <TextInput value={form.name || ""} onChange={(e) => setForm((p) => ({ ...(p || {}), name: e.target.value }))} placeholder={namePlaceholder} />
          </Field>
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
        {gateways.map((gateway) => {
          const provider = String(gateway?.provider || "").toLowerCase();
          const configurations = Array.isArray(gateway?.configurations) ? gateway.configurations : [];
          const isExpanded = Boolean(expandedProviders?.[provider]);

          return (
            <div key={provider} className="rounded-2xl border border-[#F3F4F6] bg-white">
              <button
                type="button"
                onClick={() => toggleProviderSection(provider)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-[#F9FAFB]"
                aria-expanded={isExpanded}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#111827]">
                    <ProviderLabel provider={provider} />
                  </div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">{getProviderSummary(gateway)}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${gateway?.enabled ? "bg-emerald-50 text-emerald-700" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                    {gateway?.enabled ? "Active" : "Inactive"}
                  </div>
                  <svg viewBox="0 0 20 20" className={`h-5 w-5 text-[#6B7280] transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none">
                    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {isExpanded ? (
                <div className="border-t border-[#F3F4F6] p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[12px] text-[#6B7280]">
                      Saved configurations live under each provider. Enable, disable, or disconnect each saved entry separately.
                    </div>
                    <ActionButton onClick={() => openConfig(provider)} disabled={loading || busy} variant="light">
                      Add Configuration
                    </ActionButton>
                  </div>

                  {configurations.length ? (
                    <div className="space-y-3">
                      {configurations.map((config, index) => {
                        const configurationId = getConfigId(config);
                        const isEnabled = Boolean(config?.enabled ?? (configurationId && gateway?.activeConfigurationIds?.includes(configurationId)));

                        return (
                          <div key={configurationId || `${provider}-${index}`} className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-[13px] font-semibold text-[#111827]">{getConfigTitle(provider, config, index)}</div>
                                  {configurationId ? (
                                    <div className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
                                      {shortId(configurationId)}
                                    </div>
                                  ) : null}
                                  {isEnabled ? (
                                    <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Enabled</div>
                                  ) : null}
                                </div>
                                <div className="mt-1 text-[12px] text-[#6B7280]">{getConfigSummary(provider, config)}</div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <ActionButton onClick={() => openConfig(provider, config)} disabled={loading || busy} variant="light">
                                  Configure
                                </ActionButton>
                                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                                  <div className="text-[12px] font-semibold text-[#6B7280]">Enabled</div>
                                  <ToggleSwitch
                                    enabled={isEnabled}
                                    disabled={loading || busy || !configurationId}
                                    onChange={(next) => onToggleEnabled?.(provider, configurationId, next)}
                                  />
                                </div>
                                <ActionButton onClick={() => onDisconnect?.(provider, configurationId)} disabled={loading || busy || !configurationId} variant="danger">
                                  Disconnect
                                </ActionButton>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FCFCFD] px-4 py-6 text-center">
                      <div className="text-[13px] font-semibold text-[#111827]">No saved configurations yet</div>
                      <div className="mt-1 text-[12px] text-[#6B7280]">Add the first {getProviderLabel(provider).toLowerCase()} configuration to manage it here.</div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}

        {loading ? <div className="text-[13px] text-[#6B7280]">Loading...</div> : null}
      </div>

      <ModalShell
        open={Boolean(openProvider)}
        title={`${editingConfigurationId ? "Edit" : "Add"} ${getProviderLabel(activeProvider)} Configuration`}
        onClose={closeConfig}
      >
        {editingConfigurationId ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
            Saved secrets are masked by the API. Re-enter required secret fields before saving changes to this configuration.
          </div>
        ) : null}
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
};

export default PaymentTab;

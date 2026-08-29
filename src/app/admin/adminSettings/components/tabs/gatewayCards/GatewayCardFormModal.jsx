"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PROVIDERS,
  COUNTRY_LIST,
  CURRENCY_LIST,
  getProviderLabel,
  getConfigId,
  bpsToPercent,
  inferEnvironmentFromSecrets,
} from "./constants";
import CurrencyDefaultChips from "./CurrencyDefaultChips";

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
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4">
      <button type="button" className="fixed inset-0 bg-black/40" onClick={onClose} aria-label="Close modal overlay" />
      <div className="hc-animate-dropdown relative my-8 w-full max-w-[720px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-[#F3F4F6] bg-white px-5 py-4">
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
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, hint, children, required, error }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
        <span>{label}</span>
        {required ? <span className="text-red-600">*</span> : null}
        {hint ? <span className="text-[11px] font-normal text-[#6B7280]">({hint})</span> : null}
      </div>
      {children}
      {error ? <div className="mt-1 text-[11px] font-semibold text-red-600">{error}</div> : null}
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
      className={`w-full min-h-[90px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 ${props.className || ""}`.trim()}
    />
  );
}

function ActionButton({ children, onClick, disabled, variant = "light" }) {
  const cls =
    variant === "dark"
      ? "bg-[#111827] text-white hover:bg-black"
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

function getInitialForm(provider, config) {
  const configurationId = getConfigId(config);
  const name = String(config?.name || config?.label || config?.title || config?.displayName || "").trim();
  const priority = Number(config?.priority ?? 50);
  const supportedCurrencies = Array.isArray(config?.supportedCurrencies)
    ? [...config.supportedCurrencies]
    : ["USD"];
  const defaultCurrency = String(config?.defaultCurrency || supportedCurrencies[0] || "").trim();
  const feeBps = Number(config?.feeBps ?? 0);
  const merchantCountry = String(config?.merchantCountry || "").trim();
  const scaThresholdAmountMinor = config?.scaThresholdAmountMinor != null ? Number(config.scaThresholdAmountMinor) : null;
  const scaThresholdCurrency = String(config?.scaThresholdCurrency || merchantCountry === "US" ? "USD" : merchantCountry === "GB" ? "GBP" : merchantCountry === "AE" ? "AED" : merchantCountry === "SA" ? "SAR" : merchantCountry === "IN" ? "INR" : "EUR" || "").trim();
  const environment = String(config?.environment || "AUTO-INFER").toUpperCase();
  const description = String(config?.description || config?.adminNotes || "").trim();
  const isDefault = Boolean(config?.isDefault ?? config?.default ?? false);

  const base = {
    configurationId,
    name,
    priority: isNaN(priority) || priority < 0 ? 50 : Math.min(100, priority),
    supportedCurrencies,
    defaultCurrency,
    feeBps: isNaN(feeBps) || feeBps < 0 ? 0 : Math.min(5000, feeBps),
    merchantCountry,
    scaThresholdAmountMinor,
    scaThresholdCurrency,
    environment: environment === "TEST" || environment === "LIVE" || environment === "AUTO-INFER" ? environment : "AUTO-INFER",
    description,
    isDefault,
  };

  if (provider === "stripe") {
    return {
      ...base,
      apiKey: String(config?.apiKey || "").trim(),
      secretKey: "",
      webhookUrl: String(config?.webhookUrl || "").trim(),
      webhookSigningSecret: "",
    };
  }

  if (provider === "paypal") {
    return {
      ...base,
      clientId: String(config?.clientId || "").trim(),
      clientSecret: "",
      webhookId: String(config?.webhookId || "").trim(),
    };
  }

  if (provider === "bank_transfer") {
    return {
      ...base,
      instructions: String(config?.instructions || "").trim(),
    };
  }

  return base;
}

function buildConfigurationPayload(provider, form) {
  const payload = {};
  const configurationId = String(form?.configurationId || "").trim();
  const name = String(form?.name || "");
  if (configurationId) payload.configurationId = configurationId;
  payload.name = name;

  const priority = Number(form?.priority ?? 50);
  payload.priority = isNaN(priority) ? 50 : Math.min(100, Math.max(0, priority));
  payload.supportedCurrencies = Array.isArray(form?.supportedCurrencies)
    ? form.supportedCurrencies.filter(Boolean)
    : [];
  payload.defaultCurrency = String(form?.defaultCurrency || "").trim();

  const feeBps = Number(form?.feeBps ?? 0);
  payload.feeBps = isNaN(feeBps) ? 0 : Math.min(5000, Math.max(0, feeBps));
  payload.merchantCountry = String(form?.merchantCountry || "").trim();
  payload.scaThresholdAmountMinor = form?.scaThresholdAmountMinor != null && form.scaThresholdAmountMinor !== ""
    ? Number(form.scaThresholdAmountMinor)
    : null;
  payload.scaThresholdCurrency = String(form?.scaThresholdCurrency || "").trim();

  let env = String(form?.environment || "AUTO-INFER").toUpperCase();
  if (env === "AUTO-INFER") {
    const inferred = inferEnvironmentFromSecrets(form);
    if (inferred) env = inferred;
  }
  payload.environment = env.toLowerCase();
  payload.description = String(form?.description || "").trim();
  payload.adminNotes = String(form?.description || "").trim();
  payload.isDefault = Boolean(form?.isDefault);

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

function SearchableCountryDropdown({ value, onChange, placeholder = "Search country...", required }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = COUNTRY_LIST.find((c) => c.code === value);

  const filtered = COUNTRY_LIST.filter(
    (c) =>
      !search.trim() ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 40);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-left text-[13px] transition focus:border-[#111827]/30 ${
          !selected ? "text-[#9CA3AF]" : "text-[#111827]"
        } ${required && !value ? "border-red-300" : ""}`}
      >
        {selected ? (
          <span className="inline-flex items-center gap-2">
            <span>{selected.flag}</span>
            <span className="font-semibold">{selected.code}</span>
            <span className="text-[#6B7280]">{selected.name}</span>
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#6B7280]" fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-10" onClick={() => { setOpen(false); setSearch(""); }} aria-label="Close dropdown" />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
            <div className="border-b border-[#F3F4F6] p-2">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type country name or ISO code..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#111827]/30"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-[#6B7280]">No countries match.</div>
              ) : null}
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition hover:bg-[#F9FAFB] ${
                    c.code === value ? "bg-[#F3F4F6]" : ""
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="font-semibold text-[#111827]">{c.code}</span>
                  <span className="flex-1 text-[#6B7280]">{c.name}</span>
                  {c.code === value ? (
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-emerald-600" fill="none">
                      <path d="M4 10.5l3.5 3.5 8.5-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

const GatewayCardFormModal = ({
  open,
  onClose,
  onSave,
  busy,
  editing,
  allConfigs = [],
  initialProvider = "stripe",
}) => {
  const existingConfig = editing?.config;
  const provider = editing?.provider || initialProvider;
  const isEdit = Boolean(existingConfig && getConfigId(existingConfig));

  const [tracker, setTracker] = useState({
    lastOpen: false,
    lastProvider: provider,
    lastCfgId: getConfigId(existingConfig),
    form: getInitialForm(provider, existingConfig || {}),
    errors: {},
    showAdvanced: false,
  });

  const shouldReset =
    open !== tracker.lastOpen ||
    provider !== tracker.lastProvider ||
    getConfigId(existingConfig) !== tracker.lastCfgId;

  if (shouldReset) {
    setTracker({
      lastOpen: open,
      lastProvider: provider,
      lastCfgId: getConfigId(existingConfig),
      form: getInitialForm(provider, existingConfig || {}),
      errors: {},
      showAdvanced: false,
    });
  }

  const form = tracker.form;
  const errors = tracker.errors;
  const showAdvanced = tracker.showAdvanced;

  function setForm(u) {
    setTracker((p) => ({
      ...p,
      form: typeof u === "function" ? u(p.form) : { ...(p.form || {}), ...u },
    }));
  }
  function setErrors(u) {
    setTracker((p) => ({
      ...p,
      errors: typeof u === "function" ? u(p.errors) : u,
    }));
  }
  function setShowAdvanced(v) {
    setTracker((p) => ({ ...p, showAdvanced: typeof v === "function" ? v(p.showAdvanced) : v }));
  }

  const sameProviderConfigs = useMemo(() => {
    const thisId = getConfigId(existingConfig);
    return allConfigs.filter(
      (c) => String(c?.provider || "").toLowerCase() === String(provider).toLowerCase() &&
        getConfigId(c) !== thisId
    );
  }, [allConfigs, provider, existingConfig]);

  function validate() {
    const e = {};
    const name = String(form?.name || "").trim();
    if (!name) e.name = "Configuration name is required.";
    if (name && sameProviderConfigs.some((c) => String(c?.name || c?.label || "").trim().toLowerCase() === name.toLowerCase())) {
      e.name = `Name "${name}" already exists for ${getProviderLabel(provider)}. Names must be unique within a provider.`;
    }

    const env = String(form?.environment || "AUTO-INFER").toUpperCase();
    const liveEnv = env === "LIVE" || (env === "AUTO-INFER" && inferEnvironmentFromSecrets(form) === "live");
    if (liveEnv && !String(form?.merchantCountry || "").trim()) {
      e.merchantCountry = "Merchant country is REQUIRED when using LIVE environment.";
    }

    const feeBps = Number(form?.feeBps ?? 0);
    if (liveEnv && String(provider).toLowerCase() !== "bank_transfer" && feeBps === 0) {
      e.feeBps = "Warning: feeBps is 0 for a LIVE non-BankTransfer card. Verify this is intentional.";
    }

    const scaAmount = form?.scaThresholdAmountMinor;
    if (scaAmount != null && scaAmount !== "" && Number(scaAmount) < 0) {
      e.scaThresholdAmountMinor = "SCA threshold amount cannot be negative.";
    }

    setErrors(e);
    return Object.keys(e).length === 0 || Object.keys(e).every((k) => k === "feeBps");
  }

  async function handleSave() {
    const ok = validate();
    if (!ok && errors?.name) return;
    const payload = buildConfigurationPayload(provider, form);
    await onSave?.(provider, payload, { isEdit, config: existingConfig });
  }

  const isBank = String(provider).toLowerCase() === "bank_transfer";
  const envValue = String(form?.environment || "AUTO-INFER").toUpperCase();
  const effectiveEnv = envValue === "AUTO-INFER"
    ? inferEnvironmentFromSecrets(form)
    : envValue.toLowerCase();

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`${isEdit ? "Edit" : "Add"} ${getProviderLabel(provider)} Gateway Configuration`}
    >
      {isEdit ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          Saved secrets are masked by the API. Re-enter required secret fields before saving changes.
        </div>
      ) : null}

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Configuration Name" required error={errors?.name}>
            <TextInput
              value={form.name || ""}
              onChange={(e) => setForm((p) => ({ ...(p || {}), name: e.target.value }))}
              placeholder={
                provider === "stripe"
                  ? "Primary Stripe Live"
                  : provider === "paypal"
                    ? "Primary PayPal Live"
                    : "Main Bank Transfer"
              }
            />
          </Field>

          <Field
            label="Priority"
            hint="0 = lowest, 100 = highest"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Number(form.priority ?? 50)}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), priority: Number(e.target.value) }))}
                  className="h-2 w-full cursor-pointer rounded-full bg-[#E5E7EB] accent-[#111827]"
                />
                <div className="w-16 text-right">
                  <TextInput
                    type="number"
                    min={0}
                    max={100}
                    value={Number(form.priority ?? 50)}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setForm((p) => ({ ...(p || {}), priority: isNaN(n) ? 0 : Math.min(100, Math.max(0, n)) }));
                    }}
                    className="!py-1.5 !text-right"
                  />
                </div>
              </div>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Merchant Country"
            required={effectiveEnv === "live"}
            error={errors?.merchantCountry}
          >
            <SearchableCountryDropdown
              value={form.merchantCountry || ""}
              onChange={(code) => setForm((p) => ({ ...(p || {}), merchantCountry: code }))}
              placeholder="Select merchant country..."
              required={effectiveEnv === "live"}
            />
          </Field>

          <Field label="Environment">
            <div className="flex flex-wrap gap-2 rounded-xl border border-[#E5E7EB] bg-white p-1">
              {["TEST", "LIVE", "AUTO-INFER"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((p) => ({ ...(p || {}), environment: opt }))}
                  className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                    envValue === opt
                      ? "bg-[#111827] text-white"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  }`}
                >
                  {opt === "AUTO-INFER" ? "🧠 AUTO-INFER" : opt}
                </button>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-[#6B7280]">
              AUTO-INFER parses sk_test_/sk_live_ prefixes on secrets.
              {effectiveEnv ? (
                <span className="ml-1 font-semibold text-[#111827]">
                  Effective: {effectiveEnv === "live" ? "🔴 LIVE" : "🟡 TEST"}
                </span>
              ) : null}
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Processing Fee (bps)"
            hint="0-5000 bps"
            error={errors?.feeBps}
          >
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min={0}
                max={5000}
                value={Number(form.feeBps ?? 0)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setForm((p) => ({ ...(p || {}), feeBps: isNaN(n) ? 0 : Math.min(5000, Math.max(0, n)) }));
                }}
              />
              <div className="shrink-0 rounded-xl border border-[#111827]/15 bg-[#F9FAFB] px-3 py-2 text-[12px] font-semibold text-[#111827]">
                = {bpsToPercent(form.feeBps)} %
              </div>
            </div>
          </Field>

          <Field
            label="SCA Threshold (minor units + currency)"
            hint="Nullable — leave amount blank for no threshold"
            error={errors?.scaThresholdAmountMinor}
          >
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                min={0}
                placeholder="e.g. 5000 (= 50.00)"
                value={form.scaThresholdAmountMinor == null || form.scaThresholdAmountMinor === "" ? "" : Number(form.scaThresholdAmountMinor)}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((p) => ({
                    ...(p || {}),
                    scaThresholdAmountMinor: v === "" ? null : Number(v),
                  }));
                }}
              />
              <select
                value={form.scaThresholdCurrency || "USD"}
                onChange={(e) => setForm((p) => ({ ...(p || {}), scaThresholdCurrency: e.target.value }))}
                className="w-28 rounded-xl border border-[#E5E7EB] bg-white px-2 py-2.5 text-[12px] outline-none focus:border-[#111827]/30"
              >
                {CURRENCY_LIST.slice(0, 20).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-1 text-[11px] text-[#6B7280]">
              Legal default for EU/UK/EEA: ~EUR 5000 minor (€50.00). Varies by jurisdiction.
            </div>
          </Field>
        </div>

        <Field label="Supported Currencies (click chip to set default)">
          <CurrencyDefaultChips
            supportedCurrencies={form.supportedCurrencies || []}
            defaultCurrency={form.defaultCurrency || ""}
            provider={getProviderLabel(provider)}
            onChange={(nextCurrencies, nextDefault) =>
              setForm((p) => ({
                ...(p || {}),
                supportedCurrencies: nextCurrencies,
                defaultCurrency: nextDefault,
              }))
            }
          />
        </Field>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FCFCFD] p-4">
          <div className="mb-3 text-[13px] font-semibold text-[#111827]">
            Provider Secrets & Credentials
          </div>

          {String(provider).toLowerCase() === "stripe" ? (
            <div className="space-y-4">
              <Field label="Publishable API Key (pk_...)">
                <TextInput
                  value={form.apiKey || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), apiKey: e.target.value }))}
                  placeholder="pk_live_... or pk_test_..."
                />
              </Field>
              <Field label={isEdit ? "Secret Key (sk_... — re-enter to update)" : "Secret Key (sk_...)"}>
                <TextInput
                  type="password"
                  value={form.secretKey || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), secretKey: e.target.value }))}
                  placeholder="sk_live_... or sk_test_..."
                />
              </Field>
              <Field label="Webhook URL">
                <TextInput
                  value={form.webhookUrl || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), webhookUrl: e.target.value }))}
                  placeholder="https://example.com/webhook/stripe"
                />
              </Field>
              <Field label="Webhook Signing Secret (whsec_...)">
                <TextInput
                  type="password"
                  value={form.webhookSigningSecret || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), webhookSigningSecret: e.target.value }))}
                  placeholder="whsec_..."
                />
              </Field>
            </div>
          ) : null}

          {String(provider).toLowerCase() === "paypal" ? (
            <div className="space-y-4">
              <Field label="Client ID">
                <TextInput
                  value={form.clientId || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), clientId: e.target.value }))}
                  placeholder="Abcd..."
                />
              </Field>
              <Field label={isEdit ? "Client Secret — re-enter to update" : "Client Secret"}>
                <TextInput
                  type="password"
                  value={form.clientSecret || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), clientSecret: e.target.value }))}
                  placeholder="XyZ..."
                />
              </Field>
              <Field label="Webhook ID (optional)">
                <TextInput
                  value={form.webhookId || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), webhookId: e.target.value }))}
                  placeholder="9AB123..."
                />
              </Field>
            </div>
          ) : null}

          {String(provider).toLowerCase() === "bank_transfer" ? (
            <div className="space-y-4">
              <Field label="Payment Instructions">
                <TextArea
                  value={form.instructions || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), instructions: e.target.value }))}
                  placeholder="Please transfer to:\nBank: Example Bank\nAccount: 12345678\nIBAN: ...\nReference: your donation ID"
                />
              </Field>
            </div>
          ) : null}
        </div>

        <Field label="Description / Admin Notes">
          <TextArea
            value={form.description || ""}
            onChange={(e) => setForm((p) => ({ ...(p || {}), description: e.target.value }))}
            placeholder="Internal notes: business owner, reconciliation contact, cut-off times, known restrictions..."
          />
        </Field>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB]">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div className="text-[12px] font-semibold text-[#111827]">
              ⚙️ Advanced Settings
            </div>
            <svg viewBox="0 0 20 20" className={`h-4 w-4 text-[#6B7280] transition-transform ${showAdvanced ? "rotate-180" : ""}`} fill="none">
              <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showAdvanced ? (
            <div className="border-t border-[#E5E7EB] px-4 pb-4 pt-3 space-y-4">
              <Field label="Configuration ID (advanced)">
                <TextInput
                  value={form.configurationId || ""}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), configurationId: e.target.value }))}
                  placeholder={isEdit ? "(auto-generated)" : "Leave blank for auto-generated ID"}
                />
              </Field>
              <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                <input
                  id="isDefaultGtw"
                  type="checkbox"
                  checked={Boolean(form.isDefault)}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), isDefault: e.target.checked }))}
                  className="h-4 w-4 accent-[#111827]"
                />
                <label htmlFor="isDefaultGtw" className="text-[12px] font-semibold text-[#111827]">
                  Make this the default {getProviderLabel(provider)} configuration
                </label>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <div className="text-[11px] text-[#6B7280]">
          {isBank && effectiveEnv === "live" && Number(form.feeBps) === 0
            ? "ℹ️ Bank Transfer 0% fee is typical. No warning."
            : effectiveEnv === "live" && Number(form.feeBps) === 0
              ? "⚠️ Verify 0% fee on LIVE non-BankTransfer cards."
              : ""}
        </div>
        <div className="flex items-center justify-end gap-2">
          <ActionButton onClick={onClose} disabled={busy} variant="light">
            Cancel
          </ActionButton>
          <ActionButton onClick={handleSave} disabled={busy} variant="dark">
            {busy ? "Saving..." : isEdit ? "Save Changes" : "Create Configuration"}
          </ActionButton>
        </div>
      </div>
    </ModalShell>
  );
};

export default GatewayCardFormModal;

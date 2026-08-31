"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROVIDERS,
  COUNTRY_LIST,
  CURRENCY_LIST,
  getProviderLabel,
  getConfigId,
  bpsToPercent,
  inferEnvironmentFromSecrets,
} from "./constants";
import CurrencyMultiSelect from "./CurrencyDefaultChips";
import RegionMultiSelect from "./RegionMultiSelect";

const STEPS = [
  { key: "basics", label: "Basics", desc: "Name, country, fee" },
  { key: "secrets", label: "Credentials", desc: "Keys & secrets" },
  { key: "review", label: "Review", desc: "Confirm & save" },
];

function DrawerShell({ open, title, subtitle, onClose, children, footer, onPrev, onNext, currentStep, totalSteps }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-0">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close drawer overlay"
      />
      <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl animate-[fadeIn_0.2s_ease-out]" style={{ height: "calc(100vh - 32px)" }}>
        <style>{`@keyframes fadeIn { from { transform: translateY(8px) scale(.985); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }`}</style>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#111827] text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                <path d="M4 7h16v10H4V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold text-[#111827]">{title}</div>
              {subtitle ? <div className="truncate mt-0.5 text-[11.5px] text-[#6B7280]">{subtitle}</div> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                      i < currentStep
                        ? "bg-emerald-500 text-white"
                        : i === currentStep
                          ? "bg-[#111827] text-white shadow-md"
                          : "bg-[#F3F4F6] text-[#9CA3AF]"
                    }`}
                    title={`${s.label} — ${s.desc}`}
                  >
                    {i < currentStep ? (
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                        <path d="M4 10.5l3.5 3.5 8.5-9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < totalSteps - 1 ? (
                    <div className={`h-[2.5px] w-10 shrink-0 rounded-full ${i < currentStep ? "bg-emerald-500" : "bg-[#E5E7EB]"}`} />
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#E5E7EB] hover:text-[#111827]"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F6F6F6] px-4 py-4">
          <div className="w-full">{children}</div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5E7EB] bg-white px-4 py-2.5 shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6B7280]">
                Step {currentStep + 1} / {totalSteps}
              </span>
            </div>
            <span className="truncate text-[11.5px] font-semibold text-[#374151]">{STEPS[currentStep]?.label} — {STEPS[currentStep]?.desc}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentStep === 0}
              className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white"
            >
              ← Back
            </button>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children, tone = "default" }) {
  const toneCls =
    tone === "stripe"
      ? "border-[#E5E7EB]"
      : tone === "paypal"
        ? "border-[#E5E7EB]"
        : tone === "bank"
          ? "border-[#E5E7EB]"
          : "border-[#E5E7EB]";
  return (
    <section className={`overflow-visible rounded-xl border bg-white shadow-sm ${toneCls}`}>
      {title && (
        <header className="flex items-start gap-3 rounded-t-xl border-b border-[#F3F4F6] bg-gradient-to-b from-white to-[#FAFAFA] px-4 py-3">
          {icon ? <div className="mt-0.5">{icon}</div> : null}
          <div className="flex-1">
            <h3 className="text-[13.5px] font-bold text-[#111827]">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-[11.5px] text-[#6B7280]">{subtitle}</p> : null}
          </div>
        </header>
      )}
      <div className={`p-4 ${title ? "rounded-b-xl" : "rounded-xl"}`}>{children}</div>
    </section>
  );
}

function Field({ label, hint, children, required, error, compact }) {
  return (
    <label className="block">
      <div className={`flex items-baseline gap-1.5 ${compact ? "mb-1" : "mb-1.5"}`}>
        <span className="text-[12px] font-bold text-[#374151]">{label}</span>
        {required ? <span className="text-[12px] font-bold text-red-500 leading-none">*</span> : null}
        {hint ? <span className="text-[10.5px] font-medium text-[#9CA3AF]">· {hint}</span> : null}
      </div>
      {children}
      {error ? <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600">
        <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0" fill="none">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 6v5m0 3h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {error}
      </div> : null}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px] text-[#111827] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#9CA3AF] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/8 ${props.className || ""}`.trim()}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[90px] rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px] text-[#111827] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#9CA3AF] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/8 ${props.className || ""}`.trim()}
    />
  );
}

function SegmentedControl({ value, onChange, options, disabled = false }) {
  return (
    <div className={`inline-flex w-full items-stretch gap-0 rounded-xl border p-1 shadow-inner ${disabled ? "border-[#E5E7EB] bg-[#F9FAFB]" : "border-[#D1D5DB] bg-[#F3F4F6]"}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-[12.5px] font-bold transition ${
            disabled
              ? value === opt.value
                ? "bg-white text-[#374151] shadow-sm ring-1 ring-black/5 cursor-not-allowed"
                : "text-[#9CA3AF] cursor-not-allowed"
              : value === opt.value
                ? "bg-white text-[#111827] shadow-sm ring-1 ring-black/5"
                : "text-[#6B7280] hover:text-[#111827]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
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
  const regionTags = Array.isArray(config?.regionTags)
    ? config.regionTags
        .map((t) => String(t || "").trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const p = String(provider || "").toLowerCase();
  const defaultFee = p === "paypal" ? 349 : 290;
  const feeBps = Number(config?.feeBps ?? defaultFee);
  const merchantCountry = String(config?.merchantCountry || "").trim();

  let scaThresholdsByCurrency = {};
  if (config && typeof config.scaThresholdsByCurrency === "object" && config.scaThresholdsByCurrency !== null) {
    Object.entries(config.scaThresholdsByCurrency).forEach(([k, v]) => {
      const code = String(k || "").toUpperCase().trim();
      if (/^[A-Z]{3}$/.test(code)) {
        const n = Number(v);
        if (!Number.isNaN(n) && Number.isFinite(n) && n >= 0) {
          scaThresholdsByCurrency[code] = Math.trunc(n);
        }
      }
    });
  } else if (config?.scaThresholdAmountMinor != null) {
    const legacyCurrency = String(config?.scaThresholdCurrency || "").toUpperCase().trim();
    const legacyAmount = Number(config.scaThresholdAmountMinor);
    if (/^[A-Z]{3}$/.test(legacyCurrency) && !Number.isNaN(legacyAmount) && legacyAmount >= 0) {
      scaThresholdsByCurrency[legacyCurrency] = Math.trunc(legacyAmount);
    }
  }

  const environment = String(config?.environment || "AUTO-INFER").toUpperCase();
  const description = String(config?.description || "").trim();
  const adminNotes = String(config?.adminNotes || "").trim();
  const isDefault = Boolean(config?.isDefault ?? config?.default ?? false);

  const base = {
    configurationId,
    name,
    priority: isNaN(priority) || priority < 0 ? 50 : Math.min(100, priority),
    regionTags,
    supportedCurrencies,
    defaultCurrency,
    feeBps: isNaN(feeBps) || feeBps < 0 ? 0 : Math.min(5000, feeBps),
    merchantCountry,
    scaThresholdsByCurrency,
    environment: environment === "TEST" || environment === "LIVE" || environment === "AUTO-INFER" ? environment : "AUTO-INFER",
    description,
    adminNotes,
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
      webhookUrl: String(config?.webhookUrl || "").trim(),
    };
  }

  return base;
}

function cleanInput(raw, { allowNewlines = false } = {}) {
  let s = String(raw ?? "");
  if (allowNewlines) {
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  } else {
    s = s.replace(/[\u200B-\u200D\uFEFF\s]/g, " ");
  }
  s = s.replace(/^[`\s]+|[`\s]+$/g, "");
  return s;
}

function buildConfigurationPayload(provider, form) {
  const payload = {};
  const configurationId = cleanInput(form?.configurationId);
  const name = cleanInput(form?.name);
  if (configurationId) payload.configurationId = configurationId;
  payload.name = name;

  const priority = Number(form?.priority ?? 50);
  payload.priority = isNaN(priority) ? 50 : Math.min(100, Math.max(0, priority));

  const regionTagsRaw = Array.isArray(form?.regionTags) ? form.regionTags : [];
  const regionTags = regionTagsRaw
    .map((t) => cleanInput(t))
    .filter((t) => t.length > 0 && t.length <= 20)
    .slice(0, 20);
  payload.regionTags = regionTags;

  payload.supportedCurrencies = Array.isArray(form?.supportedCurrencies)
    ? form.supportedCurrencies
        .map((c) => cleanInput(c).toUpperCase())
        .filter((c) => /^[A-Z]{3}$/.test(c))
    : [];
  payload.defaultCurrency = cleanInput(form?.defaultCurrency).toUpperCase();

  const feeBps = Number(form?.feeBps ?? 0);
  payload.feeBps = isNaN(feeBps) ? 0 : Math.min(5000, Math.max(0, feeBps));
  payload.merchantCountry = cleanInput(form?.merchantCountry).toUpperCase();

  const scaMap = {};
  if (form && typeof form.scaThresholdsByCurrency === "object" && form.scaThresholdsByCurrency !== null) {
    Object.entries(form.scaThresholdsByCurrency).forEach(([k, v]) => {
      const code = cleanInput(k).toUpperCase();
      if (!/^[A-Z]{3}$/.test(code)) return;
      const n = Number(v);
      if (n === "" || n == null || Number.isNaN(n)) return;
      if (n < 0) return;
      scaMap[code] = Math.trunc(n);
    });
  }
  payload.scaThresholdsByCurrency = scaMap;

  let env = cleanInput(form?.environment || "AUTO-INFER").toUpperCase();
  if (env === "AUTO-INFER") {
    const inferred = inferEnvironmentFromSecrets(form);
    if (inferred) env = inferred;
  }
  payload.environment = env.toLowerCase();
  payload.description = cleanInput(form?.description, { allowNewlines: true }).slice(0, 500);
  const adminNotesRaw = cleanInput(form?.adminNotes, { allowNewlines: true });
  payload.adminNotes = adminNotesRaw.slice(0, 5000);
  payload.isDefault = Boolean(form?.isDefault);

  if (provider === "stripe") {
    payload.apiKey = cleanInput(form?.apiKey);
    payload.secretKey = cleanInput(form?.secretKey);
    payload.webhookUrl = cleanInput(form?.webhookUrl);
    const webhookSigningSecret = cleanInput(form?.webhookSigningSecret);
    if (webhookSigningSecret) payload.webhookSigningSecret = webhookSigningSecret;
    return payload;
  }

  if (provider === "paypal") {
    payload.clientId = cleanInput(form?.clientId);
    payload.clientSecret = cleanInput(form?.clientSecret);
    const webhookUrl = cleanInput(form?.webhookUrl);
    if (webhookUrl) payload.webhookUrl = webhookUrl;
    return payload;
  }

  return payload;
}

function ScaThresholdsMapEditor({ value, onChange, supportedCurrencies = [], errors = {} }) {
  const sanitizedMap = useMemo(() => {
    const out = {};
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([k, v]) => {
        const code = String(k || "").toUpperCase().trim();
        if (!/^[A-Z]{3}$/.test(code)) return;
        const n = Number(v);
        out[code] = Number.isNaN(n) || n < 0 ? 0 : Math.trunc(n);
      });
    }
    return out;
  }, [value]);
  const setMap = (next) => onChange(next);

  const supportedSet = useMemo(
    () => new Set((supportedCurrencies || []).map((c) => String(c || "").toUpperCase()).filter(Boolean)),
    [supportedCurrencies]
  );

  const rows = useMemo(() => {
    const arr = [];
    Object.entries(sanitizedMap).forEach(([code, amount]) => {
      arr.push({ code, amount });
    });
    arr.sort((a, b) => a.code.localeCompare(b.code));
    return arr;
  }, [sanitizedMap]);

  function updateAmount(code, rawValue) {
    const next = { ...sanitizedMap };
    if (rawValue === "" || rawValue == null) {
      next[code] = 0;
    } else {
      const n = Number(rawValue);
      next[code] = Number.isNaN(n) ? 0 : Math.max(0, Math.trunc(n));
    }
    setMap(next);
  }
  function removeRow(code) {
    const next = { ...sanitizedMap };
    delete next[code];
    setMap(next);
  }
  function addRow(code) {
    const c = String(code || "").toUpperCase().trim();
    if (!/^[A-Z]{3}$/.test(c)) return;
    if (Object.prototype.hasOwnProperty.call(sanitizedMap, c)) return;
    setMap({ ...sanitizedMap, [c]: 0 });
  }

  const addable = (() => {
    const list = [];
    supportedSet.forEach((code) => {
      if (!Object.prototype.hasOwnProperty.call(sanitizedMap, code)) list.push(code);
    });
    list.sort();
    return list;
  })();

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-4 py-5 text-center">
          <div className="text-[13px] font-semibold text-[#111827]">No SCA thresholds set</div>
          <div className="mt-1 text-[12px] text-[#6B7280]">
            All currencies fall back to LENIENT mode — no 3DS forced, issuer-bank decides.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-[#F3F4F6] bg-[#FAFAFA] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-[#6B7280]">
            <div>Currency · SCA threshold (minor units)</div>
            <div className="w-10" />
          </div>
          {rows.map(({ code, amount }, i) => {
            const info = CURRENCY_LIST.find((c) => c.code === code) || { flag: "💱", symbol: "", name: code };
            const decimalized = (() => {
              const n = Number(amount);
              if (Number.isNaN(n)) return "—";
              return (n / 100).toFixed(2);
            })();
            const rowError = errors[`sca_${code}`];
            return (
              <div key={code + i} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-[#F3F4F6] last:border-b-0 odd:bg-white even:bg-[#FCFCFD] px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{info.flag || "💱"}</span>
                  <div className="flex w-12 shrink-0 items-center gap-1">
                    <span className="text-[12.5px] font-bold text-[#111827]">{code}</span>
                    {supportedSet.has(code) ? null : (
                      <span title="Warning: this currency is NOT ticked in Supported Currencies (above) — it will be ignored by routing until added." className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-700">!</span>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={amount == null || amount === "" ? "" : Number(amount)}
                      onChange={(e) => updateAmount(code, e.target.value)}
                      placeholder="e.g. 5000 = 50.00"
                      className={`w-full rounded-md border bg-white px-3 py-2 text-[13px] tabular-nums outline-none transition focus:ring-2 ${
                        rowError
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-[#D1D5DB] focus:border-[#111827] focus:ring-[#111827]/10"
                      }`}
                    />
                  </div>
                  <div className="w-24 shrink-0 rounded-md border border-dashed border-[#D1D5DB] bg-gradient-to-b from-[#F9FAFB] to-[#F3F4F6] px-2.5 py-1.5 text-right text-[11.5px] font-semibold tabular-nums text-[#111827] shadow-inner">
                    <span className="mr-0.5 text-[#9CA3AF]">{info.symbol || ""}</span>
                    {decimalized}
                  </div>
                </div>
                <div className="flex w-10 justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(code)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${code} threshold`}
                  >
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {rowError ? (
                  <div className="col-span-[1_/_-1] -mt-1.5 pl-[calc(1.5rem+0.625rem+3rem)] text-[11px] text-red-600">
                    {rowError}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <AddScaThresholdDropdown
        addable={addable}
        alreadyInMapCount={rows.length}
        onPick={addRow}
      />
    </div>
  );
}

function AddScaThresholdDropdown({ addable, alreadyInMapCount, onPick }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    const suggestedSet = new Set(addable);
    const suggested = [];
    const others = [];
    for (const c of CURRENCY_LIST) {
      if (q && !(
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.symbol || "").toLowerCase().includes(q)
      )) continue;
      if (suggestedSet.has(c.code)) suggested.push(c);
      else others.push(c);
    }
    return { suggested, others };
  }, [search, addable]);

  const hasSuggested = options.suggested.length > 0;
  const hasOthers = options.others.length > 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex w-full items-center justify-between gap-2 rounded-lg border-dashed border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#111827] transition hover:border-[#111827] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/8"
      >
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[#111827] group-hover:scale-110 transition" fill="none">
            <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          Add SCA threshold for a currency…
        </span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 text-[#6B7280] transition ${open ? "rotate-180" : ""}`} fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-[999] mt-1.5 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
          <div className="border-b border-[#F3F4F6] bg-[#FAFAFA] p-2.5">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency, code or symbol…"
              className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
            />
          </div>
          <div className="min-h-[160px] max-h-72 overflow-y-auto">
            {!hasSuggested && !hasOthers ? (
              <div className="px-3 py-5 text-center text-[12px] text-[#6B7280]">No currencies match.</div>
            ) : null}
            {hasSuggested ? (
              <>
                <div className="sticky top-0 z-10 bg-[#FAFAFA] px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-[#6B7280] border-b border-[#F3F4F6]">
                  Suggested · from your Supported Currencies
                </div>
                {options.suggested.map((c) => (
                  <ScaCurrencyRow key={`s-${c.code}`} c={c} onPick={(code) => {
                    onPick(code); setOpen(false); setSearch("");
                  }} />
                ))}
              </>
            ) : null}
            {hasSuggested && hasOthers ? <div className="mx-3 my-1 h-px bg-[#F3F4F6]" /> : null}
            {hasOthers ? (
              <>
                <div className="sticky top-0 z-10 bg-[#FAFAFA] px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-[#9CA3AF] border-b border-[#F3F4F6]">
                  Other currencies
                </div>
                {options.others.slice(0, hasSuggested ? 40 : 60).map((c) => (
                  <ScaCurrencyRow key={`o-${c.code}`} c={c} onPick={(code) => {
                    onPick(code); setOpen(false); setSearch("");
                  }} />
                ))}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ScaCurrencyRow({ c, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(c.code)}
      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition hover:bg-[#F3F4F6]"
    >
      <span className="text-lg leading-none">{c.flag || "💱"}</span>
      <span className="w-10 shrink-0 font-bold text-[#111827]">{c.code}</span>
      <span className="flex-1 truncate text-[#374151]">{c.name}</span>
      <span className="w-6 shrink-0 text-right text-[11.5px] text-[#6B7280]">{c.symbol || ""}</span>
    </button>
  );
}

function TagInput({ value = [], onChange, placeholder, maxItems = 20, maxLen = 20, disabled = false }) {
  const [draft, setDraft] = useState("");
  const tags = Array.isArray(value) ? value.filter((t) => String(t || "").trim().length > 0) : [];

  function commitDraft(e) {
    if (e) e.preventDefault();
    const t = String(draft || "").trim();
    if (!t) return;
    if (t.length > maxLen) return;
    if (tags.includes(t)) {
      setDraft("");
      return;
    }
    if (tags.length >= maxItems) return;
    onChange([...tags, t]);
    setDraft("");
  }
  function removeAt(idx) {
    const next = [...tags];
    next.splice(idx, 1);
    onChange(next);
  }
  function onKeyDown(e) {
    if (e.key === "Enter") {
      commitDraft(e);
    } else if (e.key === "," || e.key === "Tab") {
      if (String(draft || "").trim().length > 0) {
        commitDraft(e);
      }
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeAt(tags.length - 1);
    }
  }
  function onPaste(e) {
    const pasted = (e.clipboardData || window.clipboardData || {}).getData("text") || "";
    if (pasted.length === 0) return;
    e.preventDefault();
    const parts = pasted.split(/[,\n\r\t\s]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    let next = [...tags];
    for (const p of parts) {
      if (next.length >= maxItems) break;
      const clean = p.length > maxLen ? p.slice(0, maxLen) : p;
      if (clean && !next.includes(clean)) next.push(clean);
    }
    onChange(next);
  }

  return (
    <div className="w-full rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-2 text-[13px] transition focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/10 hover:border-[#9CA3AF]">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E5E7EB] bg-gradient-to-b from-[#F9FAFB] to-[#F3F4F6] px-2.5 py-1 text-[11.5px] font-semibold text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          >
            <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 text-[#9CA3AF]" fill="none">
              <path d="M6 12.5L14 7.5M6 7.5l8 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="max-w-[120px] truncate">{t}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeAt(i)}
              className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#9CA3AF]"
              aria-label={`Remove ${t}`}
            >
              <svg viewBox="0 0 20 20" className="h-2.5 w-2.5" fill="none">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        {!disabled && tags.length < maxItems ? (
          <input
            className="min-w-[140px] flex-1 bg-transparent py-1 outline-none placeholder:text-[#9CA3AF]"
            value={draft}
            placeholder={tags.length === 0 ? (placeholder || "Type a tag, press Enter or comma to add…") : "Add another…"}
            onChange={(e) => {
              let v = e.target.value;
              if (v.endsWith(",") || v.endsWith("\n")) {
                const t = v.slice(0, -1).trim();
                if (t) {
                  setDraft(t);
                  setTimeout(() => commitDraft(null), 0);
                  return;
                }
              }
              if (v.length > maxLen) v = v.slice(0, maxLen);
              setDraft(v);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => commitDraft(null)}
            onPaste={onPaste}
          />
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between text-[10.5px] text-[#9CA3AF]">
        <span>Enter, comma, tab, or paste split by whitespace/comma/newlines.</span>
        <span className="tabular-nums">{tags.length}/{maxItems}</span>
      </div>
    </div>
  );
}

function SearchableCountryDropdown({ value, onChange, placeholder = "Select country", required }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = COUNTRY_LIST.find((c) => c.code === value);

  const filtered = COUNTRY_LIST.filter(
    (c) =>
      !search.trim() ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-left text-[13.5px] transition hover:border-[#9CA3AF] focus:ring-4 focus:ring-[#111827]/8 ${
          !selected ? "text-[#9CA3AF]" : "text-[#111827]"
        } ${required && !value ? "border-red-300 focus:ring-red-200" : "border-[#D1D5DB] focus:border-[#111827]"}`}
      >
        {selected ? (
          <span className="inline-flex items-center gap-2.5">
            <span className="text-base leading-none">{selected.flag}</span>
            <span className="font-bold">{selected.code}</span>
            <span className="text-[#6B7280]">— {selected.name}</span>
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
        <svg viewBox="0 0 20 20" className={`h-4 w-4 text-[#6B7280] transition ${open ? "rotate-180" : ""}`} fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-[998]" onClick={() => { setOpen(false); setSearch(""); }} aria-label="Close dropdown" />
          <div className="absolute left-0 right-0 top-full z-[999] mt-1.5 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
            <div className="border-b border-[#F3F4F6] bg-[#FAFAFA] p-2.5">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country, code or name…"
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>
            <div className="min-h-[160px] max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center text-[12px] text-[#6B7280]">No countries match.</div>
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
                  className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] transition hover:bg-[#F3F4F6] ${
                    c.code === value ? "bg-[#F3F4F6]" : ""
                  }`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="w-10 shrink-0 font-bold text-[#111827]">{c.code}</span>
                  <span className="flex-1 truncate text-[#374151]">{c.name}</span>
                  {c.code === value ? (
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-emerald-600" fill="none">
                      <path d="M4 10.5l3.5 3.5 8.5-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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

function Stat({ label, value, tone }) {
  const toneCls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-white text-[#111827] border-[#E5E7EB]";
  return (
    <div className={`rounded-lg border px-4 py-3 shadow-sm ${toneCls}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{label}</div>
      <div className="mt-0.5 text-[14px] font-bold">{value}</div>
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
  const isEdit = Boolean(existingConfig && getConfigId(existingConfig));
  const providerLocked = isEdit;
  const lockedProvider = editing?.provider || initialProvider;

  const [tracker, setTracker] = useState({
    lastOpen: false,
    lastProvider: lockedProvider,
    lastCfgId: getConfigId(existingConfig),
    selectedProvider: lockedProvider,
    form: getInitialForm(lockedProvider, existingConfig || {}),
    errors: {},
    step: 0,
  });

  const selectedProvider = providerLocked ? lockedProvider : tracker.selectedProvider;
  const provider = selectedProvider;

  const shouldReset =
    open !== tracker.lastOpen ||
    lockedProvider !== tracker.lastProvider ||
    getConfigId(existingConfig) !== tracker.lastCfgId;

  if (shouldReset) {
    setTracker({
      lastOpen: open,
      lastProvider: lockedProvider,
      lastCfgId: getConfigId(existingConfig),
      selectedProvider: lockedProvider,
      form: getInitialForm(lockedProvider, existingConfig || {}),
      errors: {},
      step: 0,
    });
  }

  const form = tracker.form;
  const errors = tracker.errors;
  const step = tracker.step;

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
  function setStep(v) {
    setTracker((p) => ({ ...p, step: typeof v === "function" ? v(p.step) : v }));
  }
  function switchProvider(nextProvider) {
    if (providerLocked) return;
    const p = String(nextProvider || "").toLowerCase();
    if (!PROVIDERS.includes(p)) return;
    setTracker((prev) => ({
      ...prev,
      selectedProvider: p,
      form: getInitialForm(p, {}),
      errors: {},
    }));
  }

  const sameProviderConfigs = useMemo(() => {
    const thisId = getConfigId(existingConfig);
    return allConfigs.filter(
      (c) => String(c?.provider || "").toLowerCase() === String(provider).toLowerCase() &&
        getConfigId(c) !== thisId
    );
  }, [allConfigs, provider, existingConfig]);

  const envValue = String(form?.environment || "AUTO-INFER").toUpperCase();
  const effectiveEnv = envValue === "AUTO-INFER"
    ? inferEnvironmentFromSecrets(form)
    : envValue.toLowerCase();

  function validate(scope) {
    const e = {};
    if (scope === "basics" || scope === "all") {
      const name = String(form?.name || "").trim();
      if (!name) e.name = "Configuration name is required.";
      if (name && sameProviderConfigs.some((c) => String(c?.name || c?.label || "").trim().toLowerCase() === name.toLowerCase())) {
        e.name = `Name "${name}" already exists. Names must be unique within a provider.`;
      }
      if (effectiveEnv === "live" && !String(form?.merchantCountry || "").trim()) {
        e.merchantCountry = "Required for LIVE environments.";
      }
      if (Array.isArray(form?.regionTags) && form.regionTags.length > 20) {
        e.regionTags = "Maximum 20 region tags allowed.";
      }
      if (form && typeof form.scaThresholdsByCurrency === "object" && form.scaThresholdsByCurrency !== null) {
        Object.entries(form.scaThresholdsByCurrency).forEach(([k, v]) => {
          const code = String(k || "").toUpperCase().trim();
          if (!/^[A-Z]{3}$/.test(code)) return;
          const n = Number(v);
          if (v !== "" && v != null && !Number.isNaN(n) && n < 0) {
            e[`sca_${code}`] = `${code} threshold cannot be negative.`;
          }
        });
      }
    }
    if (scope === "secrets" || scope === "all") {
      if (provider === "stripe" && !isEdit) {
        if (!cleanInput(form?.apiKey)) e.apiKey = "Publishable key required.";
        if (!cleanInput(form?.secretKey)) e.secretKey = "Secret key required.";
      }
      if (provider === "stripe") {
        const wss = cleanInput(form?.webhookSigningSecret);
        if (wss && !wss.startsWith("whsec_")) {
          e.webhookSigningSecret = 'Stripe webhook signing secrets must start with "whsec_".';
        }
      }
      if (provider === "paypal" && !isEdit) {
        if (!cleanInput(form?.clientId)) e.clientId = "Client ID required.";
        if (!cleanInput(form?.clientSecret)) e.clientSecret = "Client secret required.";
      }
      if (provider === "paypal") {
        const webhookUrl = cleanInput(form?.webhookUrl);
        if (!webhookUrl) {
          e.webhookUrl = "PayPal webhook URL is required.";
        } else if (webhookUrl.length > 2000) {
          e.webhookUrl = "Webhook URL is too long. Max 2,000 characters.";
        } else if (!/^https?:\/\//i.test(webhookUrl)) {
          e.webhookUrl = "Webhook URL must start with http:// or https://.";
        } else {
          try {
            const u = new URL(webhookUrl);
            if (u.protocol !== "http:" && u.protocol !== "https:") {
              e.webhookUrl = "Webhook URL protocol must be http:// or https://.";
            }
          } catch (_err) {
            e.webhookUrl = "Webhook URL is not a valid URL. Check for typos or missing http(s):// prefix.";
          }
        }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    const scopes = ["basics", "secrets"];
    if (step < STEPS.length - 1) {
      const ok = validate(scopes[step]);
      if (!ok) return;
      setStep((s) => s + 1);
    }
  }

  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSave() {
    const ok = validate("all");
    if (!ok) {
      const hasBlocking = Object.keys(errors).some((k) => k !== "feeBps");
      if (hasBlocking) return;
    }
    const payload = buildConfigurationPayload(provider, form);
    await onSave?.(provider, payload, { isEdit, config: existingConfig });
  }

  const providerLabel = getProviderLabel(provider);
  const title = `${isEdit ? "Edit" : "Add"} ${providerLabel} Configuration`;

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={isEdit ? "Update settings for this gateway card" : "Configure a new gateway card in 3 steps"}
      onPrev={prevStep}
      onNext={nextStep}
      currentStep={step}
      totalSteps={STEPS.length}
      footer={
        step === STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="rounded-lg bg-[#111827] px-5 py-2 text-[12.5px] font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
          >
            {busy ? "Saving…" : isEdit ? "Save Changes" : "Create Configuration"}
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            disabled={busy}
            className="rounded-lg bg-[#111827] px-5 py-2 text-[12.5px] font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
          >
            Continue →
          </button>
        )
      }
    >
      {isEdit && step === 0 ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5">
          <div className="mt-0.5 shrink-0 text-amber-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M12 8v5m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-[12.5px] text-amber-800">
            <span className="font-bold">Note:</span> Saved secrets are masked by the API. Re-enter required secret fields on <span className="font-bold">Step 2</span> before saving changes.
          </div>
        </div>
      ) : null}

      {step === 0 && (
        <div className="space-y-4">
          <SectionCard
            title="Payment Provider"
            subtitle={providerLocked ? "Provider is locked when editing. Create a new card to switch." : "Choose which payment network this card connects to."}
            icon={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827]/5 text-[#111827]">
                {provider === "stripe" ? (
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                    <path d="M13.48 2H4.5a1 1 0 00-.97 1.24L6.98 21a1 1 0 001 .76h2.9a1 1 0 001-.77l.39-2.1a1 1 0 011-.77h1.02c2 0 3.37-1.06 4-3.04L20.5 5c.68-2.07-.5-3-2.99-3h-4.03z" />
                  </svg>
                ) : provider === "paypal" ? (
                  <span className="font-black text-[15px]">P</span>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                    <path d="M3 21h18M4 10v7m5-7v7m5-7v7m5-7v7M2 8l10-5 10 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            }
          >
            <SegmentedControl
              value={provider}
              onChange={switchProvider}
              disabled={providerLocked}
              options={[
                { value: "stripe", label: "⚡ Stripe" },
                { value: "paypal", label: "🅿️ PayPal" },
              ]}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 text-[11.5px] md:grid-cols-2">
              <div className={`rounded-lg border p-2.5 ${provider === "stripe" ? "border-[#635BFF]/40 bg-[#635BFF]/5" : "border-[#E5E7EB] bg-[#FAFAFA]"}`}>
                <div className={`font-bold ${provider === "stripe" ? "text-[#635BFF]" : "text-[#6B7280]"}`}>⚡ Stripe</div>
                <div className="mt-0.5 text-[#9CA3AF]">Card + Apple Pay / Google Pay. Default fee: <span className="font-bold tabular-nums text-[#111827]">2.90%</span></div>
              </div>
              <div className={`rounded-lg border p-2.5 ${provider === "paypal" ? "border-[#003087]/40 bg-[#003087]/5" : "border-[#E5E7EB] bg-[#FAFAFA]"}`}>
                <div className={`font-bold ${provider === "paypal" ? "text-[#003087]" : "text-[#6B7280]"}`}>🅿️ PayPal</div>
                <div className="mt-0.5 text-[#9CA3AF]">Wallet + Card. Default fee: <span className="font-bold tabular-nums text-[#111827]">3.49%</span></div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Gateway Identity"
            subtitle="Basic information about this gateway card"
            icon={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827]/5 text-[#111827]">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px]">
              <div className="grid grid-cols-1 gap-4">
                <Field label="Configuration Name" required error={errors?.name}>
                  <TextInput
                    value={form.name || ""}
                    onChange={(e) => setForm((p) => ({ ...(p || {}), name: e.target.value }))}
                    placeholder={
                      provider === "stripe"
                        ? "Primary Stripe Live"
                        : "Primary PayPal Live"
                    }
                  />
                </Field>

                <Field label="Environment" hint="Override or auto-detect from keys">
                  <SegmentedControl
                    value={envValue}
                    onChange={(v) => setForm((p) => ({ ...(p || {}), environment: v }))}
                    options={[
                      { value: "TEST", label: "🧪 Test" },
                      { value: "LIVE", label: "🔴 Live" },
                      { value: "AUTO-INFER", label: "🧠 Auto" },
                    ]}
                  />
                  <div className="mt-2.5 flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <span>Detected:</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                      effectiveEnv === "live"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : effectiveEnv === "test"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}>
                      {effectiveEnv === "live" ? "🔴 LIVE mode" : effectiveEnv === "test" ? "🟡 TEST mode" : "⚪ Not yet detected — add keys on step 2"}
                    </span>
                  </div>
                </Field>
              </div>

              <Field label="Priority" hint="0 lowest, 100 highest" compact>
                <div className="flex items-center gap-2">
                  <TextInput
                    type="number"
                    min={0}
                    max={100}
                    value={Number(form.priority ?? 50)}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setForm((p) => ({ ...(p || {}), priority: isNaN(n) ? 0 : Math.min(100, Math.max(0, n)) }));
                    }}
                    className="!text-center font-bold tabular-nums"
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Jurisdiction & SCA Rules"
            subtitle="Merchant country + per-currency 3DS exemption thresholds"
            icon={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Merchant Country"
                required={effectiveEnv === "live"}
                hint={effectiveEnv === "live" ? "Required for LIVE" : null}
                error={errors?.merchantCountry}
              >
                <SearchableCountryDropdown
                  value={form.merchantCountry || ""}
                  onChange={(code) => setForm((p) => ({ ...(p || {}), merchantCountry: code }))}
                  placeholder="Select your registered merchant country"
                  required={effectiveEnv === "live"}
                />
              </Field>

              <Field
                label="SCA Thresholds"
                hint="Per-currency Strong Customer Authentication exemption. Currencies not listed here use LENIENT fallback (no 3DS forced, bank decides). Values are MINOR UNITS (no decimals): e.g. EUR 50.00 = 5000."
                error={Object.keys(errors || {}).find((k) => k.startsWith("sca_")) ? "See row errors above." : undefined}
              >
                <ScaThresholdsMapEditor
                  supportedCurrencies={form.supportedCurrencies || []}
                  value={form.scaThresholdsByCurrency || {}}
                  errors={errors || {}}
                  onChange={(nextMap) =>
                    setForm((p) => ({
                      ...(p || {}),
                      scaThresholdsByCurrency: nextMap,
                    }))
                  }
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Pricing & Rules"
            subtitle="Processing fee, routing tags & accepted currencies"
            icon={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Processing Fee"
                hint="0 to 5000 bps (100 bps = 1%)"
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
                    className="!font-bold tabular-nums"
                  />
                  <div className="shrink-0 rounded-lg border border-[#D1D5DB] bg-gradient-to-b from-[#F9FAFB] to-[#F3F4F6] px-4 py-2.5 text-[13px] font-bold text-[#111827] tabular-nums shadow-inner">
                    {bpsToPercent(form.feeBps)}%
                  </div>
                </div>
              </Field>

              <Field
                label="Region Tags"
                hint="Fixed routing labels from a standard region list. Used by order-region rules, fraud-signals, and ops dashboards to slice traffic by jurisdiction."
                error={errors?.regionTags}
              >
                <RegionMultiSelect
                  value={form.regionTags || []}
                  onChange={(next) => setForm((p) => ({ ...(p || {}), regionTags: next }))}
                />
              </Field>
            </div>

            <div className="mt-6">
              <Field label="Supported Currencies" hint="Tick to include, click Make Default to set the settlement default">
                <CurrencyMultiSelect
                  supportedCurrencies={form.supportedCurrencies || []}
                  defaultCurrency={form.defaultCurrency || ""}
                  provider={providerLabel}
                  onChange={(nextCurrencies, nextDefault) =>
                    setForm((p) => ({
                      ...(p || {}),
                      supportedCurrencies: nextCurrencies,
                      defaultCurrency: nextDefault,
                    }))
                  }
                />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {provider === "stripe" && (
            <SectionCard
              tone="stripe"
              title="Stripe API Credentials"
              subtitle="Copy from Stripe Dashboard → Developers → API keys"
              icon={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635BFF]/10 text-[#635BFF]">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                    <path d="M13.48 2H4.5a1 1 0 00-.97 1.24L6.98 21a1 1 0 001 .76h2.9a1 1 0 001-.77l.39-2.1a1 1 0 011-.77h1.02c2 0 3.37-1.06 4-3.04L20.5 5c.68-2.07-.5-3-2.99-3h-4.03z" />
                  </svg>
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Publishable Key" hint="starts with pk_..." required={!isEdit} error={errors?.apiKey}>
                  <TextInput
                    value={form.apiKey || ""}
                    onChange={(e) => setForm((p) => ({ ...(p || {}), apiKey: e.target.value }))}
                    placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </Field>
                <Field label="Secret Key" hint="starts with sk_..." required={!isEdit} error={errors?.secretKey}>
                  <TextInput
                    type="password"
                    value={form.secretKey || ""}
                    onChange={(e) => setForm((p) => ({ ...(p || {}), secretKey: e.target.value }))}
                    placeholder={isEdit ? "•••••••••••• (re-enter to change)" : "Enter Stripe secret key"}
                  />
                </Field>
              </div>

              <div className="mt-6 border-t border-[#F3F4F6] pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    🔗 Webhook (optional)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Webhook URL" error={errors?.webhookUrl}>
                    <TextInput
                      value={form.webhookUrl || ""}
                      onChange={(e) => setForm((p) => ({ ...(p || {}), webhookUrl: e.target.value }))}
                      placeholder="https://your-domain.com/api/webhook/stripe"
                    />
                  </Field>
                  <Field label="Signing Secret" hint="Must start with whsec_" error={errors?.webhookSigningSecret}>
                    <TextInput
                      type="password"
                      value={form.webhookSigningSecret || ""}
                      onChange={(e) => setForm((p) => ({ ...(p || {}), webhookSigningSecret: e.target.value }))}
                      placeholder="whsec_xxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>
          )}

          {provider === "paypal" && (
            <SectionCard
              tone="paypal"
              title="PayPal App Credentials"
              subtitle="Copy from PayPal Developer → Apps & Credentials"
              icon={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003087]/10 text-[#003087] font-black text-[15px]">
                  P
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Client ID" required={!isEdit} error={errors?.clientId}>
                  <TextInput
                    value={form.clientId || ""}
                    onChange={(e) => setForm((p) => ({ ...(p || {}), clientId: e.target.value }))}
                    placeholder="AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"
                  />
                </Field>
                <Field label="Client Secret" required={!isEdit} error={errors?.clientSecret}>
                  <TextInput
                    type="password"
                    value={form.clientSecret || ""}
                    onChange={(e) => setForm((p) => ({ ...(p || {}), clientSecret: e.target.value }))}
                    placeholder={isEdit ? "•••••••••••• (re-enter to change)" : "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"}
                  />
                </Field>
              </div>

              <div className="mt-6 border-t border-[#F3F4F6] pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    🔗 Webhook (required)
                  </span>
                </div>
                <Field
                  label="Webhook URL"
                  required
                  error={errors?.webhookUrl}
                  hint="Full PayPal webhook endpoint URL. HTTPS required. Max 2,000 chars. Include the gwConfId= query param if your backend uses it."
                >
                  <TextInput
                    value={form.webhookUrl || ""}
                    onChange={(e) => setForm((p) => ({ ...(p || {}), webhookUrl: e.target.value }))}
                    placeholder="https://donation.api.sagsio.com/api/v1/donations/webhook/paypal?gwConfId=paypal_cfg_ae_live_2025"
                  />
                </Field>
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Advanced Options"
            subtitle="Defaults + operator notes (never exposed public)"
            icon={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            }
          >
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <input
                  id="isDefaultGtw"
                  type="checkbox"
                  checked={Boolean(form.isDefault)}
                  onChange={(e) => setForm((p) => ({ ...(p || {}), isDefault: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[#111827]"
                />
                <label htmlFor="isDefaultGtw" className="block">
                  <div className="text-[13px] font-bold text-[#111827]">Default configuration</div>
                  <div className="mt-0.5 text-[12px] text-[#6B7280]">
                    This {providerLabel} card will be used when no explicit default is set.
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Description (donor-facing)" hint="Optional. Max 500 chars. May appear on donor receipts.">
                  <TextArea
                    value={form.description || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((p) => ({
                        ...(p || {}),
                        description: v.length > 500 ? v.slice(0, 500) : v,
                      }));
                    }}
                    placeholder="e.g. Primary card for EU donors via Stripe Payments Europe GmbH"
                  />
                  <div className="mt-1 text-[10.5px] text-right text-[#9CA3AF] tabular-nums">
                    {String(form.description || "").length} / 500
                  </div>
                </Field>

                <Field label="Admin Notes (internal only)" hint="Optional. Max 5,000 chars. Never shown public.">
                  <TextArea
                    value={form.adminNotes || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((p) => ({
                        ...(p || {}),
                        adminNotes: v.length > 5000 ? v.slice(0, 5000) : v,
                      }));
                    }}
                    placeholder="e.g. Owned by Finance team (John). Ops contact: ops@example.com. EU cut-off 4:30pm CET. SLA for refunds is T+1."
                  />
                  <div className="mt-1 text-[10.5px] text-right text-[#9CA3AF] tabular-nums">
                    {String(form.adminNotes || "").length} / 5000
                  </div>
                </Field>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <SectionCard
            title="Review & Confirm"
            subtitle="Double-check everything below. Click Create when ready."
            icon={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827]/5 text-[#111827]">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                  <path d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Name" value={form.name || "—"} />
              <Stat
                label="Environment"
                value={effectiveEnv === "live" ? "🔴 Live" : effectiveEnv === "test" ? "🟡 Test" : "🧠 Auto"}
                tone={effectiveEnv === "live" ? "warn" : "good"}
              />
              <Stat label="Priority" value={String(form.priority ?? 50) + " / 100"} />
              <Stat label="Fee" value={bpsToPercent(form.feeBps) + "%"} />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard title="Jurisdiction">
              <dl className="space-y-3">
                <Row label="Merchant Country" ok={Boolean(form.merchantCountry)}>
                  {form.merchantCountry ? (
                    (() => {
                      const c = COUNTRY_LIST.find((x) => x.code === form.merchantCountry);
                      return c ? <span className="inline-flex items-center gap-2 font-bold text-[#111827]"><span className="text-base leading-none">{c.flag}</span>{c.name} <span className="text-[#9CA3AF]">({c.code})</span></span> : <span className="font-bold">{form.merchantCountry}</span>;
                    })()
                  ) : <span className="text-[#9CA3AF]">Not set</span>}
                </Row>
                <Row label="SCA Threshold" ok>
                  {form.scaThresholdAmountMinor != null && form.scaThresholdAmountMinor !== ""
                    ? <span className="font-bold tabular-nums text-[#111827]">
                        {form.scaThresholdCurrency ? <span className="mr-1">{form.scaThresholdCurrency}</span> : null}
                        {(Number(form.scaThresholdAmountMinor) / 100).toFixed(2)}
                        {!form.scaThresholdCurrency ? <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700">no currency</span> : null}
                      </span>
                    : <span className="text-[#9CA3AF]">No threshold</span>}
                </Row>
                <Row label="Default card" ok>
                  <span className={`font-bold ${form.isDefault ? "text-emerald-600" : "text-[#9CA3AF]"}`}>
                    {form.isDefault ? "✓ Yes — this will be the default" : "No"}
                  </span>
                </Row>
              </dl>
            </SectionCard>

            <SectionCard title={`Currencies (${form.supportedCurrencies?.length || 0})`}>
              <div className="flex flex-wrap gap-2">
                {(form.supportedCurrencies || []).length === 0 ? (
                  <span className="text-[12px] text-[#9CA3AF]">No currencies added yet</span>
                ) : (
                  (form.supportedCurrencies || []).map((cc) => {
                    const cur = CURRENCY_LIST.find((c) => c.code === cc);
                    const isDefault = cc === form.defaultCurrency;
                    return (
                      <span
                        key={cc}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ${
                          isDefault
                            ? "bg-[#111827] text-white border-[#111827]"
                            : "bg-[#F9FAFB] text-[#374151] border-[#D1D5DB]"
                        }`}
                      >
                        <span className="text-sm leading-none">{cur?.flag || "🏳️"}</span>
                        {cc}
                        {isDefault ? <span className="opacity-75">· DEFAULT</span> : ""}
                      </span>
                    );
                  })
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Credentials Summary">
            <dl className="space-y-3.5">
              {provider === "stripe" && (
                <>
                  <Row label="Publishable Key" ok={Boolean(form.apiKey)}>
                    {form.apiKey ? <span className="font-mono text-[12px] font-bold text-[#111827]">{mask(form.apiKey, 8)}</span> : <span className="text-red-500 font-bold">Missing</span>}
                  </Row>
                  <Row label="Secret Key" ok={Boolean(form.secretKey) || isEdit}>
                    {form.secretKey || isEdit ? (
                      <span className="font-bold text-emerald-700">
                        {form.secretKey ? <span className="font-mono text-[12px]">{mask(form.secretKey, 6)}</span> : isEdit ? "✓ Will preserve existing value" : ""}
                      </span>
                    ) : <span className="text-red-500 font-bold">Missing</span>}
                  </Row>
                  {form.webhookUrl ? (
                    <Row label="Webhook URL" ok>
                      <span className="font-mono text-[12px] font-bold text-[#374151] truncate">{mask(form.webhookUrl, 12)}</span>
                    </Row>
                  ) : null}
                </>
              )}
              {provider === "paypal" && (
                <>
                  <Row label="Client ID" ok={Boolean(form.clientId)}>
                    {form.clientId ? <span className="font-mono text-[12px] font-bold text-[#111827]">{mask(form.clientId, 6)}</span> : <span className="text-red-500 font-bold">Missing</span>}
                  </Row>
                  <Row label="Client Secret" ok={Boolean(form.clientSecret) || isEdit}>
                  {form.clientSecret || isEdit ? (
                      <span className="font-bold text-emerald-700">
                        {form.clientSecret ? <span className="font-mono text-[12px]">{mask(form.clientSecret, 6)}</span> : "✓ Will preserve existing value"}
                      </span>
                    ) : <span className="text-red-500 font-bold">Missing</span>}
                  </Row>
                  <Row label="Webhook URL" ok={Boolean(cleanInput(form.webhookUrl))}>
                    {form.webhookUrl ? (
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#F3F4F6] px-2 py-0.5 align-middle">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[#6B7280]" fill="none">
                          <path d="M14 3h4a3 3 0 013 3v4M10 21H6a3 3 0 01-3-3v-4M10 14l7-7a2.12 2.12 0 013 3l-7 7-3 1 1-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="max-w-[280px] truncate font-mono text-[12px] text-[#111827]" title={String(form.webhookUrl || "")}>
                          {String(form.webhookUrl || "")}
                        </span>
                      </span>
                    ) : <span className="text-red-500 font-bold">Missing</span>}
                  </Row>
                </>
              )}
            </dl>
          </SectionCard>

          {form.description ? (
            <SectionCard title="Donor-Facing Description">
              <div className="whitespace-pre-wrap rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 text-[13px] text-[#374151]">
                {form.description}
              </div>
            </SectionCard>
          ) : null}

          {form.adminNotes ? (
            <SectionCard title="Internal Admin Notes">
              <div className="whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
                {form.adminNotes}
              </div>
            </SectionCard>
          ) : null}

          {effectiveEnv === "live" && Number(form.feeBps) === 0 ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none">
                <path d="M12 8v5m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-[12.5px] text-amber-800">
                <span className="font-bold">⚠ LIVE mode with 0% processing fee —</span> confirm this is intentional before saving.
              </div>
            </div>
          ) : null}
        </div>
      )}
    </DrawerShell>
  );
};

function Row({ label, value, children, ok }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
      <dt className="text-[12.5px] font-semibold text-[#6B7280]">{label}</dt>
      <dd className="text-right">
        {children ?? (
          <span className={`font-bold ${ok ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
            {value}
          </span>
        )}
      </dd>
    </div>
  );
}

function mask(str, keepStart = 6) {
  if (!str) return "";
  const s = String(str);
  if (s.length <= keepStart + 4) return s.slice(0, keepStart) + "•".repeat(Math.max(0, s.length - keepStart));
  return s.slice(0, keepStart) + "••••••" + s.slice(-4);
}

export default GatewayCardFormModal;

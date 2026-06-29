"use client";

import { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { getAdminFormGoalsDates, getAdminSettingsExchangeRates, getAdminSettingsPayment, updateAdminFormGoalsDates } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import FieldError from "./FieldError";
import WizardFooterNav from "./WizardFooterNav";
import SuggestedAmountsEditor from "./goalsDates/SuggestedAmountsEditor";
import CustomNotesEditor from "./goalsDates/CustomNotesEditor";
import RecurringPresetsEditor from "./goalsDates/RecurringPresetsEditor";
import { getSupportedCurrencyOptionsForCodes, normalizeSupportedCurrencyCodes, SUPPORTED_FORM_CURRENCY_OPTIONS } from "@/utils/currencies";

function normalizeGoalsDatesResponse(res) {
  return res?.data?.data || res?.data?.item || res?.data?.goalsDates || res?.data || {};
}

function normalizePaymentSettingsResponse(res) {
  return res?.data?.data || res?.data || {};
}

function normalizeExchangeRatesResponse(res) {
  console.log("normalizeExchangeRatesResponse", res);
  return Array.isArray(res?.data?.exchangeRates) ? res.data.exchangeRates : [];
}

function buildCurrencyOptionsFromRates(rates) {
  const codes = normalizeSupportedCurrencyCodes(["USD", ...(Array.isArray(rates) ? rates : []).map((item) => item?.currency)]);
  return getSupportedCurrencyOptionsForCodes(codes);
}

function toCurrencyCodeList(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") return item.split(",");
      if (item && typeof item === "object") {
        const code = item.code ?? item.currency ?? item.value;
        return code ? [code] : [];
      }
      return [];
    });
  }
  if (typeof value === "string") return value.split(",");
  if (value && typeof value === "object") {
    const code = value.code ?? value.currency ?? value.value;
    return code ? [code] : [];
  }
  return [];
}

function normalizeSelectedCurrencies(value, availableCodes = []) {
  const raw = value?.currencies !== undefined ? toCurrencyCodeList(value.currencies) : value?.currency ? toCurrencyCodeList(value.currency) : toCurrencyCodeList(value);
  const normalized = normalizeSupportedCurrencyCodes(raw);
  if (!availableCodes.length) return normalized;
  const filtered = normalized.filter((code) => availableCodes.includes(code));
  return filtered.length ? filtered : availableCodes[0] ? [availableCodes[0]] : [];
}

function toDateInputValue(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  const t = Date.parse(s);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseNumberOrEmpty(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "";
  return String(n);
}

function enforceSingleDefaultSuggested(items) {
  const list = Array.isArray(items) ? items.map((x) => ({ ...(x || {}) })) : [];
  let found = false;
  for (let i = 0; i < list.length; i++) {
    const isDefault = Boolean(list[i]?.isDefault);
    if (!isDefault) continue;
    if (!found) {
      found = true;
      list[i].isDefault = true;
    } else {
      list[i].isDefault = false;
    }
  }
  if (list.length && !found) {
    list[0].isDefault = true;
  }
  return list;
}

function normalizeSuggestedAmountsState(value) {
  if (Array.isArray(value)) {
    const list = value
      .map((it) => ({
        id: it?.id,
        value: it?.value === null || it?.value === undefined ? "" : String(it.value),
        description: String(it?.description ?? ""),
        isDefault: Boolean(it?.isDefault),
      }))
      .filter((it) => String(it.value).trim() || String(it.description).trim());
    return enforceSingleDefaultSuggested(list);
  }
  if (typeof value === "string" && value.trim()) {
    const list = value
      .split(",")
      .map((s) => String(s).trim())
      .filter(Boolean)
      .map((v) => ({ value: v, description: "", isDefault: false }));
    return enforceSingleDefaultSuggested(list);
  }
  return [];
}

function normalizeRecurringPresetsState(value) {
  if (!Array.isArray(value)) return [];
  return value.map((p) => ({
    id: p?.id,
    name: String(p?.name ?? ""),
    enabled: p?.enabled === undefined ? true : Boolean(p.enabled),
    sortOrder: p?.sortOrder === null || p?.sortOrder === undefined ? "" : String(p.sortOrder),
    scheduleType: String(p?.scheduleType || "date_range"),
    scheduleConfig: p?.scheduleConfig && typeof p.scheduleConfig === "object" ? p.scheduleConfig : {},
  }));
}

function normalizeCustomNotesState(value) {
  if (!Array.isArray(value)) return [];
  return value.map((n) => ({
    id: n?.id,
    type: String(n?.type || "input"),
    key: String(n?.key ?? ""),
    label: String(n?.label ?? ""),
    required: Boolean(n?.required),
    helpText: String(n?.helpText ?? ""),
    placeholder: String(n?.placeholder ?? ""),
    defaultValue: n?.defaultValue,
    options: Array.isArray(n?.options)
      ? n.options.map((o) => ({ id: o?.id, label: String(o?.label ?? ""), value: String(o?.value ?? "") }))
      : [],
  }));
}

function getPaymentProviderLabel(provider) {
  const p = String(provider || "").toLowerCase();
  if (p === "bank_transfer") return "Bank Transfer";
  if (p === "paypal") return "PayPal";
  if (p === "stripe") return "Stripe";
  return p ? p[0].toUpperCase() + p.slice(1) : "Provider";
}

function normalizePaymentMethodsState(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((m) => ({
      provider: String(m?.provider || "").toLowerCase(),
      configurationId: String(m?.configurationId || "").trim(),
      name: String(m?.name || "").trim(),
    }))
    .filter((m) => (m.provider === "stripe" || m.provider === "paypal" || m.provider === "bank_transfer") && m.configurationId);
}

function buildEnabledPaymentMethodOptions(paymentSettings) {
  const gateways = Array.isArray(paymentSettings?.gateways)
    ? paymentSettings.gateways
    : paymentSettings?.gateways && typeof paymentSettings.gateways === "object"
      ? Object.values(paymentSettings.gateways)
      : [];

  const out = [];
  gateways.forEach((gateway) => {
    const provider = String(gateway?.provider || "").toLowerCase();
    if (!(provider === "stripe" || provider === "paypal" || provider === "bank_transfer")) return;
    const activeId = String(gateway?.activeConfigurationId || "").trim();
    const providerEnabled = Boolean(gateway?.enabled);
    const configs = Array.isArray(gateway?.configurations) ? gateway.configurations : [];
    configs.forEach((cfg) => {
      const configurationId = String(cfg?.configurationId || cfg?.id || "").trim();
      if (!configurationId) return;
      const enabled =
        typeof cfg?.enabled === "boolean"
          ? cfg.enabled
          : Boolean(providerEnabled && activeId && configurationId === activeId);
      if (!enabled) return;
      const name = String(cfg?.name || "").trim();
      out.push({ provider, configurationId, name });
    });
  });

  const seen = new Set();
  return out.filter((m) => {
    const key = `${m.provider}:${m.configurationId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterPaymentMethodsToOptions(selected, options) {
  const normalized = normalizePaymentMethodsState(selected);
  const map = new Map((Array.isArray(options) ? options : []).map((o) => [`${o.provider}:${o.configurationId}`, o]));
  return normalized
    .map((m) => map.get(`${m.provider}:${m.configurationId}`) || null)
    .filter(Boolean);
}

function toIsoDateString(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00.000Z`).toISOString();
  const t = Date.parse(s);
  if (Number.isNaN(t)) return "";
  return new Date(t).toISOString();
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="h-6 w-1/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
        </div>
      </div>

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="h-5 w-1/4 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6] md:col-span-2" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-[#F3F4F6]" />
          <div className="h-16 animate-pulse rounded-2xl bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

const WizardStepGoalsDates = ({ campaignId, formId, onExit, onSaved }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [suggestedAmountsErrors, setSuggestedAmountsErrors] = useState([]);
  const [recurringPresetsErrors, setRecurringPresetsErrors] = useState([]);
  const [customNotesErrors, setCustomNotesErrors] = useState([]);

  const [currencies, setCurrencies] = useState(["USD"]);
  const [currencyOptions, setCurrencyOptions] = useState(SUPPORTED_FORM_CURRENCY_OPTIONS);
  const [goalAmount, setGoalAmount] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const [minimumDonation, setMinimumDonation] = useState("");
  const [maximumDonation, setMaximumDonation] = useState("");
  const [suggestedAmounts, setSuggestedAmounts] = useState([]);
  const [customNotes, setCustomNotes] = useState([]);

  const [allowOneTimeDonations, setAllowOneTimeDonations] = useState(true);
  const [allowRecurringDonations, setAllowRecurringDonations] = useState(false);
  const [recurringPresets, setRecurringPresets] = useState([]);
  const [enableTipping, setEnableTipping] = useState(false);
  const [allowAnonymousDonations, setAllowAnonymousDonations] = useState(false);
  const [showGlobalNote, setShowGlobalNote] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setTopError("");
    (async () => {
      try {
        const [res, exchangeRatesRes, paymentRes] = await Promise.all([getAdminFormGoalsDates(formId), getAdminSettingsExchangeRates(), getAdminSettingsPayment()]);
        if (!alive) return;
        const d = normalizeGoalsDatesResponse(res);
        const exchangeRates = normalizeExchangeRatesResponse(exchangeRatesRes);
        const nextCurrencyOptions = buildCurrencyOptionsFromRates(exchangeRates);
        const availableCurrencyCodes = nextCurrencyOptions.map((item) => item.code);
        const paymentSettings = normalizePaymentSettingsResponse(paymentRes);
        const enabledMethods = buildEnabledPaymentMethodOptions(paymentSettings);

        setCurrencyOptions(nextCurrencyOptions);
        setCurrencies(availableCurrencyCodes.length ? normalizeSelectedCurrencies(d, availableCurrencyCodes) : []);
        setGoalAmount(parseNumberOrEmpty(d?.goalAmount));
        setStartAt(toDateInputValue(d?.startAt));
        setEndAt(toDateInputValue(d?.endAt));

        setMinimumDonation(parseNumberOrEmpty(d?.minimumDonation));
        setMaximumDonation(parseNumberOrEmpty(d?.maximumDonation));
        setSuggestedAmounts(normalizeSuggestedAmountsState(d?.suggestedAmounts));
        setCustomNotes(normalizeCustomNotesState(d?.customNotes));

        setAllowOneTimeDonations(d?.allowOneTimeDonations === undefined ? true : Boolean(d?.allowOneTimeDonations));
        setAllowRecurringDonations(Boolean(d?.allowRecurringDonations));
        setRecurringPresets(normalizeRecurringPresetsState(d?.recurringPresets));
        setEnableTipping(Boolean(d?.enableTipping));
        setAllowAnonymousDonations(Boolean(d?.allowAnonymousDonations));
        setShowGlobalNote(Boolean(d?.showGlobalNote));
        setPaymentMethodOptions(enabledMethods);
        setPaymentMethods(filterPaymentMethodsToOptions(d?.paymentMethods, enabledMethods));
      } catch (e) {
        if (!alive) return;
        setTopError(e?.message || "Failed to load goals & dates.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  function validate() {
    const errors = {};
    const suggErrors = [];
    const presetsErrors = [];
    const availableCurrencyCodes = currencyOptions.map((item) => item.code);
    const nextCurrencies = availableCurrencyCodes.length ? normalizeSelectedCurrencies(currencies, availableCurrencyCodes) : [];
    const nextCurrency = nextCurrencies[0] || "";
    const nextStartAt = String(startAt || "").trim();
    const nextEndAt = String(endAt || "").trim();

    const goal = String(goalAmount ?? "").trim();
    const min = String(minimumDonation ?? "").trim();
    const max = String(maximumDonation ?? "").trim();

    if (!nextCurrencies.length) errors.currencies = "Select at least 1 currency";

    if (!nextStartAt) errors.startAt = "Required";
    else if (Number.isNaN(Date.parse(nextStartAt))) errors.startAt = "Invalid date";

    if (nextEndAt) {
      if (Number.isNaN(Date.parse(nextEndAt))) errors.endAt = "Invalid date";
      else if (!errors.startAt) {
        const s = new Date(Date.parse(nextStartAt));
        const e = new Date(Date.parse(nextEndAt));
        if (!(s.getTime() < e.getTime())) errors.endAt = "End date must be after start date";
      }
    }

    function validatePositiveNumber(fieldKey, raw) {
      if (!raw) return null;
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        errors[fieldKey] = "Must be a number";
        return null;
      }
      if (!(n > 0)) {
        errors[fieldKey] = "Must be greater than 0";
        return null;
      }
      return n;
    }

    const goalN = validatePositiveNumber("goalAmount", goal);
    if (!min) errors.minimumDonation = "Required";
    const minN = validatePositiveNumber("minimumDonation", min);
    const maxN = validatePositiveNumber("maximumDonation", max);

    if (minN !== null && maxN !== null && minN > maxN) {
      errors.maximumDonation = "Maximum must be greater than or equal to minimum";
    }

    const normalizedSuggested = [];
    const oneTimeEnabled = Boolean(allowOneTimeDonations);
    const recurringEnabled = Boolean(allowRecurringDonations);
    if (!oneTimeEnabled && !recurringEnabled) {
      const msg = "Enable one-time or recurring donations";
      errors.allowOneTimeDonations = msg;
      errors.allowRecurringDonations = msg;
    }

    if (oneTimeEnabled) {
      const suggestedItems = Array.isArray(suggestedAmounts) ? suggestedAmounts : [];
      const seenValues = new Set();
      let defaultAssigned = false;
      suggestedItems.forEach((it, idx) => {
        const row = it || {};
        const rawValue = String(row.value ?? "").trim();
        const desc = String(row.description ?? "").trim();
        const rowErr = {};
        const hasAny = Boolean(rawValue) || Boolean(desc);
        if (!hasAny) {
          suggErrors[idx] = {};
          return;
        }
        const n = Number(rawValue);
        if (!rawValue) rowErr.value = "Required";
        else if (!Number.isFinite(n)) rowErr.value = "Must be a number";
        else if (!(n > 0)) rowErr.value = "Must be greater than 0";
        if (!desc) rowErr.description = "Required";

        const key = Number.isFinite(n) ? String(n) : rawValue;
        if (!rowErr.value) {
          if (seenValues.has(key)) rowErr.value = "Must be unique";
          else seenValues.add(key);
        }

        suggErrors[idx] = rowErr;
        if (Object.keys(rowErr).length) return;
        const wantsDefault = Boolean(row.isDefault) && !defaultAssigned;
        if (wantsDefault) defaultAssigned = true;
        normalizedSuggested.push({
          ...(row.id ? { id: row.id } : {}),
          value: n,
          description: desc,
          ...(wantsDefault ? { isDefault: true } : {}),
        });
      });

      if (normalizedSuggested.length && !defaultAssigned) {
        normalizedSuggested[0] = { ...(normalizedSuggested[0] || {}), isDefault: true };
        defaultAssigned = true;
      }

      if (suggErrors.some((e) => e && Object.keys(e).length)) {
        errors.suggestedAmounts = "Fix suggested amounts";
      }
    }

    const presets = Array.isArray(recurringPresets) ? recurringPresets : [];
    const normalizedPresets = [];
    if (recurringEnabled) {
      presets.forEach((p, idx) => {
        const preset = p || {};
        const perr = {};
        const name = String(preset.name ?? "").trim();
        const enabled = preset.enabled === undefined ? true : Boolean(preset.enabled);
        const scheduleType = String(preset.scheduleType || "").trim();
        const sortOrderRaw = String(preset.sortOrder ?? "").trim();
        const sortOrderNum = sortOrderRaw ? Number(sortOrderRaw) : (idx + 1) * 10;
        if (!name) perr.name = "Required";
        if (sortOrderRaw && !Number.isFinite(sortOrderNum)) perr.sortOrder = "Must be a number";
        if (scheduleType !== "date_range" && scheduleType !== "specific_dates") perr.scheduleType = "Invalid";

        const cfg = preset.scheduleConfig && typeof preset.scheduleConfig === "object" ? preset.scheduleConfig : {};
        const cfgErrors = {};
        let cfgOut = {};

        if (scheduleType === "date_range") {
          const startDate = String(cfg.startDate || "").trim();
          const endDate = String(cfg.endDate || "").trim();
          const frequency = String(cfg.frequency || "").trim();
          const intervalRaw = cfg.intervalValue === null || cfg.intervalValue === undefined ? "" : String(cfg.intervalValue).trim();

          if (enabled && !startDate) cfgErrors.startDate = "Required";
          if (enabled && !endDate) cfgErrors.endDate = "Required";
          if (enabled && startDate && endDate) {
            const sT = Date.parse(startDate);
            const eT = Date.parse(endDate);
            if (Number.isNaN(sT)) cfgErrors.startDate = "Invalid date";
            if (Number.isNaN(eT)) cfgErrors.endDate = "Invalid date";
            if (!cfgErrors.startDate && !cfgErrors.endDate && !(sT < eT)) cfgErrors.endDate = "End must be after start";
          }
          if (enabled && !frequency) cfgErrors.frequency = "Required";
          const freqOk = frequency === "daily" || frequency === "weekly" || frequency === "monthly" || frequency === "yearly" || frequency === "custom";
          if (frequency && !freqOk) cfgErrors.frequency = "Invalid";

          let intervalValue = undefined;
          if (frequency === "custom") {
            const n = Number(intervalRaw);
            if (!intervalRaw) cfgErrors.intervalValue = "Required";
            else if (!Number.isFinite(n) || !Number.isInteger(n)) cfgErrors.intervalValue = "Must be an integer";
            else if (n < 2) cfgErrors.intervalValue = "Min 2";
            else intervalValue = n;
          } else if (intervalRaw) {
            const n = Number(intervalRaw);
            if (!Number.isFinite(n) || !Number.isInteger(n)) cfgErrors.intervalValue = "Must be an integer";
            else if (n < 2) cfgErrors.intervalValue = "Min 2";
            else intervalValue = n;
          }

          const startIso = toIsoDateString(startDate);
          const endIso = toIsoDateString(endDate);
          if (enabled && startDate && !startIso) cfgErrors.startDate = "Invalid date";
          if (enabled && endDate && !endIso) cfgErrors.endDate = "Invalid date";

          cfgOut = {
            startDate: startIso || startDate,
            endDate: endIso || endDate,
            frequency: frequency === "custom" ? "daily" : frequency,
            ...(intervalValue !== undefined ? { intervalValue } : {}),
          };
        }

        if (scheduleType === "specific_dates") {
          const dates = Array.isArray(cfg.dates) ? cfg.dates : [];
          const normalizedDates = dates
            .map((d) => String(d || "").trim())
            .filter(Boolean)
            .map((d) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(`${d}T00:00:00.000Z`).toISOString();
              const t = Date.parse(d);
              return Number.isNaN(t) ? "" : new Date(t).toISOString();
            })
            .filter(Boolean);
          const unique = Array.from(new Set(normalizedDates));
          if (enabled && unique.length === 0) cfgErrors.dates = "Add at least one date";
          cfgOut = { dates: unique };
        }

        if (Object.keys(cfgErrors).length) perr.scheduleConfig = cfgErrors;
        presetsErrors[idx] = perr;

        if (Object.keys(perr).length) return;
        normalizedPresets.push({
          ...(preset.id ? { id: preset.id } : {}),
          name,
          enabled,
          sortOrder: Number.isFinite(sortOrderNum) ? sortOrderNum : (idx + 1) * 10,
          scheduleType,
          scheduleConfig: cfgOut,
        });
      });

      if (presetsErrors.some((e) => e && Object.keys(e).length)) {
        errors.recurringPresets = "Fix recurring presets";
      }
    }

    const notes = Array.isArray(customNotes) ? customNotes : [];
    const normalizedNotes = [];
    const notesErrors = [];
    const keySet = new Set();
    notes.forEach((raw, idx) => {
      const n = raw || {};
      const type = String(n.type || "").trim();
      const key = String(n.key || "").trim();
      const label = String(n.label || "").trim();
      const required = Boolean(n.required);
      const helpText = String(n.helpText || "").trim();
      const placeholder = String(n.placeholder || "").trim();
      const defaultValue = n.defaultValue;
      const rowErr = {};

      const hasAny = Boolean(type) || Boolean(key) || Boolean(label) || Boolean(helpText) || Boolean(placeholder) || defaultValue !== undefined;
      const allowedTypes = new Set(["input", "textarea", "select", "radio", "checkbox"]);
      if (!hasAny) {
        notesErrors[idx] = {};
        return;
      }

      if (!allowedTypes.has(type)) rowErr.type = "Invalid";
      if (!key) rowErr.key = "Required";
      if (!label) rowErr.label = "Required";
      if (key) {
        if (keySet.has(key)) rowErr.key = "Must be unique";
        else keySet.add(key);
      }

      const out = {
        ...(n.id ? { id: n.id } : {}),
        type,
        key,
        label,
        ...(required ? { required: true } : {}),
        ...(helpText ? { helpText } : {}),
      };

      if (type === "input" || type === "textarea") {
        if (placeholder) out.placeholder = placeholder;
        if (typeof defaultValue === "string" && String(defaultValue).trim()) out.defaultValue = String(defaultValue);
      }

      if (type === "checkbox") {
        if (typeof defaultValue === "boolean") out.defaultValue = defaultValue;
      }

      if (type === "select" || type === "radio") {
        const options = Array.isArray(n.options) ? n.options : [];
        const optErrs = [];
        const normalizedOptions = [];
        const valueSet = new Set();
        options.forEach((oRaw, oIdx) => {
          const o = oRaw || {};
          const oLabel = String(o.label || "").trim();
          const oValue = String(o.value || "").trim();
          const oErr = {};
          if (!oLabel) oErr.label = "Required";
          if (!oValue) oErr.value = "Required";
          if (oValue) {
            if (valueSet.has(oValue)) oErr.value = "Must be unique";
            else valueSet.add(oValue);
          }
          optErrs[oIdx] = oErr;
          if (Object.keys(oErr).length) return;
          normalizedOptions.push({ ...(o.id ? { id: o.id } : {}), label: oLabel, value: oValue });
        });

        if (normalizedOptions.length < 2) {
          rowErr.optionsMessage = "Add at least 2 options";
        }
        if (optErrs.some((e) => e && Object.keys(e).length)) {
          rowErr.options = optErrs;
        }
        if (typeof defaultValue === "string" && String(defaultValue).trim()) out.defaultValue = String(defaultValue);
        out.options = normalizedOptions;
      }

      notesErrors[idx] = rowErr;
      if (Object.keys(rowErr).length) return;
      normalizedNotes.push(out);
    });

    if (notesErrors.some((e) => e && Object.keys(e).length)) {
      errors.customNotes = "Fix custom notes";
    }

    const normalizedPaymentMethods = filterPaymentMethodsToOptions(paymentMethods, paymentMethodOptions);

    const payload = {
      currency: nextCurrency,
      currencies: nextCurrencies,
      startAt: nextStartAt,
      endAt: nextEndAt ? nextEndAt : null,
      goalAmount: goalN === null ? undefined : goalN,
      minimumDonation: minN,
      maximumDonation: maxN === null ? undefined : maxN,
      paymentMethods: normalizedPaymentMethods,
      allowOneTimeDonations: Boolean(oneTimeEnabled),
      suggestedAmounts: oneTimeEnabled && normalizedSuggested.length ? normalizedSuggested : undefined,
      customNotes: normalizedNotes.length ? normalizedNotes : undefined,
      allowRecurringDonations: Boolean(recurringEnabled),
      recurringPresets: recurringEnabled && normalizedPresets.length ? normalizedPresets : undefined,
      enableTipping: Boolean(enableTipping),
      allowAnonymousDonations: Boolean(allowAnonymousDonations),
      showGlobalNote: Boolean(showGlobalNote),
    };

    return { errors, payload, suggErrors, presetsErrors, notesErrors };
  }

  async function save({ goNext } = { goNext: false }) {
    setTopError("");
    setFieldErrors({});
    setSuggestedAmountsErrors([]);
    setRecurringPresetsErrors([]);
    setCustomNotesErrors([]);

    if (!campaignId) {
      toast.error("Missing campaignId");
      return { ok: false };
    }
    if (!formId) {
      toast.error("Complete Basics first");
      return { ok: false };
    }

    const { errors, payload, suggErrors, presetsErrors, notesErrors } = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setSuggestedAmountsErrors(Array.isArray(suggErrors) ? suggErrors : []);
      setRecurringPresetsErrors(Array.isArray(presetsErrors) ? presetsErrors : []);
      setCustomNotesErrors(Array.isArray(notesErrors) ? notesErrors : []);
      toast.error("Fix the highlighted fields");
      return { ok: false };
    }

    setSaving(true);
    try {
      await updateAdminFormGoalsDates(formId, payload);
      try {
        const res = await getAdminFormGoalsDates(formId);
        const d = normalizeGoalsDatesResponse(res);
        const availableCurrencyCodes = currencyOptions.map((item) => item.code);
        setCurrencies(availableCurrencyCodes.length ? normalizeSelectedCurrencies(d, availableCurrencyCodes) : []);
        setSuggestedAmounts(normalizeSuggestedAmountsState(d?.suggestedAmounts));
        setCustomNotes(normalizeCustomNotesState(d?.customNotes));
        setAllowOneTimeDonations(d?.allowOneTimeDonations === undefined ? true : Boolean(d?.allowOneTimeDonations));
        setAllowRecurringDonations(Boolean(d?.allowRecurringDonations));
        setRecurringPresets(normalizeRecurringPresetsState(d?.recurringPresets));
        setPaymentMethods(filterPaymentMethodsToOptions(d?.paymentMethods, paymentMethodOptions));
      } catch {}
      toast.success("Goals & dates saved");
      onSaved?.();

      if (goNext) {
        onExit?.({ nextStep: "causes" });
      }
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save goals & dates.";
      setTopError(msg);
      toast.error(msg);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton />;

  if (!formId) {
    return (
      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600">
        Missing formId. Please complete Basics first to create the draft form.
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onExit?.({ nextStep: "basics" })}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Back to Basics
          </button>
        </div>
      </div>
    );
  }

  const disabled = saving;
  const availableCurrencyCodes = currencyOptions.map((item) => item.code);
  const selectedCurrencies = availableCurrencyCodes.length ? normalizeSelectedCurrencies(currencies, availableCurrencyCodes) : [];
  const primaryCurrency = selectedCurrencies[0] || "";

  return (
    <div className="space-y-6">
      {topError ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {topError}
        </div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold text-[#111827]">Fundraising Goals & Timeline</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Set the target amount and campaign duration</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Currencies <span className="text-red-600">*</span>
            </div>
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-3">
              {currencyOptions.length ? (
                <div className="flex flex-wrap gap-2">
                  {currencyOptions.map((c) => {
                    const selected = selectedCurrencies.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() =>
                          setCurrencies((prev) => {
                            const list = Array.isArray(prev) ? prev : [];
                            return list.includes(c.code) ? list.filter((item) => item !== c.code) : [...list, c.code];
                          })
                        }
                        disabled={disabled}
                        className={`rounded-xl border px-3 py-2 text-[13px] font-semibold transition ${
                          selected ? "border-[#111827] bg-[#111827] text-white" : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                        } disabled:opacity-60`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[13px] text-[#6B7280]">No exchange-rate currencies available. Add or sync currencies in admin settings first.</div>
              )}
            </div>
            <FieldError message={fieldErrors.currencies} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Fundraising Goal (Optional)</div>
            <input
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="5000"
              inputMode="decimal"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.goalAmount} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Start Date <span className="text-red-600">*</span>
            </div>
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.startAt} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">End Date (Optional)</div>
            <input
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.endAt} />
          </div>
        </div>
      </section>

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="text-[14px] font-semibold text-[#111827]">Donation Settings</div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Minimum Donation <span className="text-red-600">*</span>
            </div>
            <input
              value={minimumDonation}
              onChange={(e) => setMinimumDonation(e.target.value)}
              placeholder="5"
              inputMode="decimal"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.minimumDonation} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Maximum Donation</div>
            <input
              value={maximumDonation}
              onChange={(e) => setMaximumDonation(e.target.value)}
              placeholder="100"
              inputMode="decimal"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.maximumDonation} />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Payment Methods</div>
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-3">
            {paymentMethodOptions.length ? (
              <div className="flex flex-wrap gap-2">
                {paymentMethodOptions.map((method) => {
                  const key = `${method.provider}:${method.configurationId}`;
                  const selected = Array.isArray(paymentMethods)
                    ? paymentMethods.some((m) => String(m?.provider || "").toLowerCase() === method.provider && String(m?.configurationId || "").trim() === method.configurationId)
                    : false;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setPaymentMethods((prev) => {
                          const list = normalizePaymentMethodsState(prev);
                          const exists = list.some((m) => m.provider === method.provider && m.configurationId === method.configurationId);
                          if (exists) return list.filter((m) => !(m.provider === method.provider && m.configurationId === method.configurationId));
                          return [...list, { provider: method.provider, configurationId: method.configurationId, name: method.name }];
                        })
                      }
                      disabled={disabled}
                      className={`rounded-xl border px-3 py-2 text-[13px] font-semibold transition ${
                        selected ? "border-[#111827] bg-[#111827] text-white" : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                      } disabled:opacity-60`}
                      title={method.configurationId}
                    >
                      {getPaymentProviderLabel(method.provider)} · {method.name || "Unnamed"}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-[13px] text-[#6B7280]">No enabled payment methods available. Enable a gateway configuration in Settings → Payment first.</div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Allow One-Time Donations</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Let donors make a single payment</div>
              </div>
              <Toggle enabled={allowOneTimeDonations} onChange={disabled ? () => {} : setAllowOneTimeDonations} />
            </div>
            <FieldError message={fieldErrors.allowOneTimeDonations} />
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Enable Tipping</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Allow donors to add a platform tip</div>
              </div>
              <Toggle enabled={enableTipping} onChange={disabled ? () => {} : setEnableTipping} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Allow Anonymous Donations</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Let donors hide their name on the public donation feed</div>
              </div>
              <Toggle enabled={allowAnonymousDonations} onChange={disabled ? () => {} : setAllowAnonymousDonations} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Global Notes</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display the global custom notes configured in settings</div>
              </div>
              <Toggle enabled={showGlobalNote} onChange={disabled ? () => {} : setShowGlobalNote} />
            </div>
          </div>
        </div>
      </section>

      <SuggestedAmountsEditor
        currencyLabel={primaryCurrency || selectedCurrencies.join(", ")}
        value={suggestedAmounts}
        onChange={setSuggestedAmounts}
        disabled={disabled || !allowOneTimeDonations}
        errors={suggestedAmountsErrors}
      />

      <CustomNotesEditor value={customNotes} onChange={setCustomNotes} disabled={disabled} errors={customNotesErrors} />

      <RecurringPresetsEditor
        allowRecurringDonations={allowRecurringDonations}
        onChangeAllowRecurringDonations={setAllowRecurringDonations}
        value={recurringPresets}
        onChange={setRecurringPresets}
        disabled={disabled}
        errors={recurringPresetsErrors}
        allowError={fieldErrors.allowRecurringDonations}
      />

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "basics" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        previewHref={formId ? `/admin/forms/preview/1?formId=${encodeURIComponent(formId)}` : ""}
        nextLabel="Next"
      />
    </div>
  );
}
export default WizardStepGoalsDates;

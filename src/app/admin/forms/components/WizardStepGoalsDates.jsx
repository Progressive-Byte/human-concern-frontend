"use client";

import { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { getAdminFormById, getAdminFormGoalsDates, getAdminSettingsExchangeRates, getAdminSettingsPayment, updateAdminFormGoalsDates } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import useStepAutosave from "../hooks/useStepAutosave";
import FieldError from "./FieldError";
import StepErrorSummary from "./StepErrorSummary";
import WizardFooterNav from "./WizardFooterNav";
import SuggestedAmountsEditor from "./goalsDates/SuggestedAmountsEditor";
import CustomNotesEditor from "./goalsDates/CustomNotesEditor";
import RecurringPresetsEditor from "./goalsDates/RecurringPresetsEditor";
import { getSupportedCurrencyOptionsForCodes, normalizeSupportedCurrencyCodes, SUPPORTED_FORM_CURRENCY_OPTIONS } from "@/utils/currencies";
import { getFormErrorMessage } from "@/utils/formValidationMessages";

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

// Keeps at most ONE default but, unlike suggested amounts, never invents one when none is
// set — a form with no default deliberately leaves the donor on "Custom".
function enforceSingleDefaultPreset(items) {
  const list = Array.isArray(items) ? items : [];
  let found = false;
  return list.map((p) => {
    if (p?.isDefault && !found) {
      found = true;
      return p;
    }
    return p?.isDefault ? { ...p, isDefault: false } : p;
  });
}

function inferRecurringPresetQuickType(preset) {
  const name = String(preset?.name || "").trim();
  const frequency = String(preset?.scheduleConfig?.frequency || "").trim();
  // Quick presets keep their generated names and a concrete frequency. Anything else is treated
  // as a custom preset so its schedule controls stay editable.
  if (
    ["daily", "weekly", "monthly", "yearly"].includes(frequency) &&
    (name === "Daily" || name === "Annually" || /^Weekly – /.test(name) || /^Monthly – /.test(name))
  ) {
    return frequency;
  }
  return "";
}

function inferRecurringPresetUiMode(preset) {
  if (preset?.uiMode === "quick" || preset?.uiMode === "custom") return preset.uiMode;
  return inferRecurringPresetQuickType(preset) ? "quick" : "custom";
}

function normalizeRecurringPresetsState(value, existing = []) {
  if (!Array.isArray(value)) return [];
  const priorList = Array.isArray(existing) ? existing : [];
  const list = value.map((p, idx) => {
    const prior =
      priorList.find((item) => p?.id && item?.id && String(item.id) === String(p.id)) ||
      priorList[idx];
    return {
      id: p?.id,
      name: String(p?.name ?? ""),
      enabled: p?.enabled === undefined ? true : Boolean(p.enabled),
      sortOrder: p?.sortOrder === null || p?.sortOrder === undefined ? "" : String(p.sortOrder),
      isDefault: Boolean(p?.isDefault),
      allowMissedMakeUp: Boolean(p?.allowMissedMakeUp),
      scheduleType: String(p?.scheduleType || "date_range"),
      scheduleConfig: p?.scheduleConfig && typeof p.scheduleConfig === "object" ? p.scheduleConfig : {},
      uiMode: prior?.uiMode || inferRecurringPresetUiMode(p),
      quickType: prior?.quickType || inferRecurringPresetQuickType(p),
    };
  });
  return enforceSingleDefaultPreset(list);
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
    <div className="space-y-4 md:space-y-6">
      <div className="hc-animate-fade-up rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
        <div className="h-6 w-1/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
        </div>
      </div>

      <div className="hc-animate-fade-up rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
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
  const [isPublished, setIsPublished] = useState(false);
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
  const [allowFlexibleRecurringSchedule, setAllowFlexibleRecurringSchedule] = useState(true);
  const [recurringPresets, setRecurringPresets] = useState([]);
  const [enableTipping, setEnableTipping] = useState(false);
  const [allowAnonymousDonations, setAllowAnonymousDonations] = useState(false);
  const [showGlobalNote, setShowGlobalNote] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);

  // Autosave once the step has loaded (the draft must already exist).
  useStepAutosave({
    formId,
    deps: [
      currencies,
      goalAmount,
      startAt,
      endAt,
      minimumDonation,
      maximumDonation,
      suggestedAmounts,
      customNotes,
      recurringPresets,
      allowOneTimeDonations,
      allowRecurringDonations,
      allowFlexibleRecurringSchedule,
      enableTipping,
      allowAnonymousDonations,
      showGlobalNote,
      paymentMethods,
    ],
    ready: !loading,
    persist: () => save({ silent: true }),
  });

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
        const [res, exchangeRatesRes, paymentRes, formRes] = await Promise.all([
          getAdminFormGoalsDates(formId),
          getAdminSettingsExchangeRates(),
          getAdminSettingsPayment(),
          getAdminFormById(formId),
        ]);
        if (!alive) return;
        const form = formRes?.data?.item || formRes?.data?.data || formRes?.data || {};
        const status = String(form?.status || "").trim().toLowerCase();
        setIsPublished(Boolean(status && status !== "draft"));
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
        setAllowFlexibleRecurringSchedule(d?.allowFlexibleRecurringSchedule === undefined ? true : Boolean(d?.allowFlexibleRecurringSchedule));
        setRecurringPresets(normalizeRecurringPresetsState(d?.recurringPresets));
        setEnableTipping(Boolean(d?.enableTipping));
        setAllowAnonymousDonations(Boolean(d?.allowAnonymousDonations));
        setShowGlobalNote(Boolean(d?.showGlobalNote));
        setPaymentMethodOptions(enabledMethods);
        setPaymentMethods(filterPaymentMethodsToOptions(d?.paymentMethods, enabledMethods));
      } catch (e) {
        if (!alive) return;
        setTopError(getFormErrorMessage(e, "We couldn’t load this step. Please try again."));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  function validate({ requireEnabledPreset = false } = {}) {
    const errors = {};
    const suggErrors = [];
    const presetsErrors = [];
    const availableCurrencyCodes = currencyOptions.map((item) => item.code);
    const nextCurrencies = availableCurrencyCodes.length ? normalizeSelectedCurrencies(currencies, availableCurrencyCodes) : [];
    const nextCurrency = nextCurrencies[0] || "";
    const nextStartAt = String(startAt || "").trim();
    const nextEndAt = String(endAt || "").trim();
    const campaignStartMs = nextStartAt && !Number.isNaN(Date.parse(nextStartAt)) ? Date.parse(nextStartAt) : null;
    const campaignEndMs = nextEndAt && !Number.isNaN(Date.parse(nextEndAt)) ? Date.parse(nextEndAt) : null;

    const goal = String(goalAmount ?? "").trim();
    const min = String(minimumDonation ?? "").trim();
    const max = String(maximumDonation ?? "").trim();

    if (!nextCurrencies.length) errors.currencies = "Choose at least one currency.";

    if (!nextStartAt) errors.startAt = "Choose a start date.";
    else if (Number.isNaN(Date.parse(nextStartAt))) errors.startAt = "Enter a valid date.";

    if (nextEndAt) {
      if (Number.isNaN(Date.parse(nextEndAt))) errors.endAt = "Enter a valid date.";
      else if (!errors.startAt) {
        const s = new Date(Date.parse(nextStartAt));
        const e = new Date(Date.parse(nextEndAt));
        if (!(s.getTime() < e.getTime())) errors.endAt = "End date must be after the start date.";
      }
    }

    function validatePositiveNumber(fieldKey, raw) {
      if (!raw) return null;
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        errors[fieldKey] = "Enter a number.";
        return null;
      }
      if (!(n > 0)) {
        errors[fieldKey] = "Enter a number greater than 0.";
        return null;
      }
      return n;
    }

    const goalN = validatePositiveNumber("goalAmount", goal);
    if (!min) errors.minimumDonation = "Enter a minimum donation.";
    const minN = validatePositiveNumber("minimumDonation", min);
    const maxN = validatePositiveNumber("maximumDonation", max);

    if (minN !== null && maxN !== null && minN > maxN) {
      errors.maximumDonation = "Maximum donation must be greater than or equal to the minimum.";
    }

    const normalizedSuggested = [];
    const oneTimeEnabled = Boolean(allowOneTimeDonations);
    const recurringEnabled = Boolean(allowRecurringDonations);
    if (!oneTimeEnabled && !recurringEnabled) {
      const msg = "Turn on one-time or recurring donations.";
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
        if (!rawValue) rowErr.value = "Enter an amount.";
        else if (!Number.isFinite(n)) rowErr.value = "Enter a number.";
        else if (!(n > 0)) rowErr.value = "Enter a number greater than 0.";

        const key = Number.isFinite(n) ? String(n) : rawValue;
        if (!rowErr.value) {
          if (seenValues.has(key)) rowErr.value = "This amount is already used.";
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
        errors.suggestedAmounts = "Check the suggested amounts below.";
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
        if (!name) perr.name = "Enter a preset name.";
        if (sortOrderRaw && !Number.isFinite(sortOrderNum)) perr.sortOrder = "Enter a number.";
        if (scheduleType !== "date_range" && scheduleType !== "specific_dates") perr.scheduleType = "Choose a valid schedule type.";

        const cfg = preset.scheduleConfig && typeof preset.scheduleConfig === "object" ? preset.scheduleConfig : {};
        const cfgErrors = {};
        let cfgOut = {};

        if (scheduleType === "date_range") {
          const startDate = String(cfg.startDate || "").trim();
          const endDate = String(cfg.endDate || "").trim();
          const frequency = String(cfg.frequency || "").trim();
          const intervalRaw = cfg.intervalValue === null || cfg.intervalValue === undefined ? "" : String(cfg.intervalValue).trim();
          const daysRaw = Array.isArray(cfg.daysOfWeek) ? cfg.daysOfWeek : [];
          const daysOfWeek = Array.from(new Set(daysRaw.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))).sort((a, b) => a - b);

          if (enabled && !startDate) cfgErrors.startDate = "Choose a start date.";
          if (enabled && startDate && endDate) {
            const sT = Date.parse(startDate);
            const eT = Date.parse(endDate);
            if (Number.isNaN(sT)) cfgErrors.startDate = "Enter a valid date.";
            if (Number.isNaN(eT)) cfgErrors.endDate = "Enter a valid date.";
            if (!cfgErrors.startDate && !cfgErrors.endDate && !(sT < eT)) cfgErrors.endDate = "End date must be after the start date.";
          } else if (enabled && endDate && Number.isNaN(Date.parse(endDate))) {
            cfgErrors.endDate = "Enter a valid date.";
          }

          if (enabled && startDate && !cfgErrors.startDate) {
            const sT = Date.parse(startDate);
            if (!Number.isNaN(sT)) {
              if (campaignStartMs !== null && sT < campaignStartMs) cfgErrors.startDate = "Choose a date on or after the campaign start.";
              else if (campaignEndMs !== null && sT > campaignEndMs) cfgErrors.startDate = "Choose a date on or before the campaign end.";
            }
          }
          if (enabled && endDate && !cfgErrors.endDate) {
            const eT = Date.parse(endDate);
            if (!Number.isNaN(eT)) {
              if (campaignStartMs !== null && eT < campaignStartMs) cfgErrors.endDate = "Choose a date on or after the campaign start.";
              else if (campaignEndMs !== null && eT > campaignEndMs) cfgErrors.endDate = "Choose a date on or before the campaign end.";
            }
          }
          if (enabled && !frequency) cfgErrors.frequency = "Choose a frequency.";
          const freqOk = frequency === "daily" || frequency === "weekly" || frequency === "monthly" || frequency === "yearly" || frequency === "custom";
          if (frequency && !freqOk) cfgErrors.frequency = "Choose a valid frequency.";
          if (enabled && frequency === "weekly" && !daysOfWeek.length) cfgErrors.daysOfWeek = "Choose at least one weekday.";

          let intervalValue = undefined;
          if (frequency === "custom") {
            const n = Number(intervalRaw);
            if (!intervalRaw) cfgErrors.intervalValue = "Enter the interval.";
            else if (!Number.isFinite(n) || !Number.isInteger(n)) cfgErrors.intervalValue = "Enter a whole number.";
            else if (n < 2) cfgErrors.intervalValue = "Use 2 or more.";
            else intervalValue = n;
          } else if (intervalRaw) {
            const n = Number(intervalRaw);
            if (!Number.isFinite(n) || !Number.isInteger(n)) cfgErrors.intervalValue = "Enter a whole number.";
            else if (n < 2) cfgErrors.intervalValue = "Use 2 or more.";
            else intervalValue = n;
          }

          const startIso = toIsoDateString(startDate);
          const endIso = toIsoDateString(endDate);
          if (enabled && startDate && !startIso) cfgErrors.startDate = "Enter a valid date.";
          if (enabled && endDate && !endIso) cfgErrors.endDate = "Enter a valid date.";

          cfgOut = {
            startDate: startIso || startDate,
            ...(endIso ? { endDate: endIso } : {}),
            frequency: frequency === "custom" ? "daily" : frequency,
            ...(intervalValue !== undefined ? { intervalValue } : {}),
            ...(frequency === "weekly" && daysOfWeek.length ? { daysOfWeek } : {}),
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
          if (enabled && unique.length === 0) cfgErrors.dates = "Add at least one date.";
          else if (enabled) {
            const outOfRange = unique.some((d) => {
              const t = Date.parse(d);
              if (Number.isNaN(t)) return false;
              return (campaignStartMs !== null && t < campaignStartMs) || (campaignEndMs !== null && t > campaignEndMs);
            });
            if (outOfRange) cfgErrors.dates = "All dates must be inside the campaign dates.";
          }
          cfgOut = { dates: unique };
        }

        if (Object.keys(cfgErrors).length) perr.scheduleConfig = cfgErrors;
        presetsErrors[idx] = perr;

        if (Object.keys(perr).length) return;
        normalizedPresets.push({
          ...(preset.id ? { id: preset.id } : {}),
          name,
          enabled,
          isDefault: Boolean(preset.isDefault),
          allowMissedMakeUp: Boolean(preset.allowMissedMakeUp),
          sortOrder: Number.isFinite(sortOrderNum) ? sortOrderNum : (idx + 1) * 10,
          scheduleType,
          scheduleConfig: cfgOut,
        });
      });

      if (presetsErrors.some((e) => e && Object.keys(e).length)) {
        errors.recurringPresets = "Check the recurring presets below.";
      } else if (requireEnabledPreset && !normalizedPresets.some((p) => p.enabled !== false)) {
        errors.recurringPresets = "Turn on at least one recurring preset, or turn off monthly donations.";
      }
    }

    const notes = Array.isArray(customNotes) ? customNotes : [];
    const normalizedNotes = [];
    const notesErrors = [];
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

      if (!allowedTypes.has(type)) rowErr.type = "Choose a valid answer type.";
      if (!label) rowErr.label = "Enter a question.";

      const out = {
        ...(n.id ? { id: n.id } : {}),
        type,
        // Existing keys are preserved; new notes leave it blank for the server to derive from the label.
        ...(key ? { key } : {}),
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
          if (!oLabel) oErr.label = "Enter a choice label.";
          if (!oValue) oErr.value = "Enter a choice value.";
          if (oValue) {
            if (valueSet.has(oValue)) oErr.value = "This choice value is already used.";
            else valueSet.add(oValue);
          }
          optErrs[oIdx] = oErr;
          if (Object.keys(oErr).length) return;
          normalizedOptions.push({ ...(o.id ? { id: o.id } : {}), label: oLabel, value: oValue });
        });

        if (normalizedOptions.length < 2) {
          rowErr.optionsMessage = "Add at least two choices.";
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
      errors.customNotes = "Check the custom questions below.";
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
      // Always send the list while the feature is on, even when empty: omitting the key means
      // "leave unchanged" to the API, so deleting the last row would silently not stick (and the
      // post-save re-read would bring the rows back).
      suggestedAmounts: oneTimeEnabled ? normalizedSuggested : undefined,
      customNotes: normalizedNotes,
      allowRecurringDonations: Boolean(recurringEnabled),
      allowFlexibleRecurringSchedule: Boolean(allowFlexibleRecurringSchedule),
      recurringPresets: recurringEnabled ? normalizedPresets : undefined,
      enableTipping: Boolean(enableTipping),
      allowAnonymousDonations: Boolean(allowAnonymousDonations),
      showGlobalNote: Boolean(showGlobalNote),
    };

    return { errors, payload, suggErrors, presetsErrors, notesErrors };
  }

  async function save({ goNext = false, silent = false } = {}) {
    if (!silent) setTopError("");

    if (!campaignId) {
      if (!silent) toast.error("This form is not linked to a campaign. Go back and choose a campaign.");
      return { ok: false, error: "This form is not linked to a campaign." };
    }
    if (!formId) {
      if (!silent) toast.error("Finish Basics first.");
      return { ok: false, error: "Finish Basics first." };
    }

    /*
      A published form cannot be changed here, so skip validation and the save. The admin must
      move it back to Draft first.
    */
    if (isPublished) {
      if (goNext) onExit?.({ nextStep: "causes" });
      return { ok: true };
    }

    const { errors, payload, suggErrors, presetsErrors, notesErrors } = validate({
      requireEnabledPreset: Boolean(goNext),
    });

    const hadErrors = Boolean(
      Object.keys(fieldErrors).length ||
      suggestedAmountsErrors.some((row) => row && Object.keys(row).length) ||
      recurringPresetsErrors.some((row) => row && Object.keys(row).length) ||
      customNotesErrors.some((row) => row && Object.keys(row).length)
    );

    // Replace the error sets with the current result, so fixing one field does not erase the
    // errors that are still present elsewhere.
    if (!silent && (goNext || hadErrors)) {
      setFieldErrors(errors);
      setSuggestedAmountsErrors(Array.isArray(suggErrors) ? suggErrors : []);
      setRecurringPresetsErrors(Array.isArray(presetsErrors) ? presetsErrors : []);
      setCustomNotesErrors(Array.isArray(notesErrors) ? notesErrors : []);
    }

    /* Save Draft keeps whatever is filled in. Only Next asks for the required fields. */
    if (goNext && Object.keys(errors).length) {
      if (!silent) toast.error("Check the highlighted fields below.");
      return { ok: false, error: "Check the highlighted fields below." };
    }

    if (!silent) setSaving(true);
    try {
      await updateAdminFormGoalsDates(formId, payload);
      if (!silent) {
        try {
          const res = await getAdminFormGoalsDates(formId);
          const d = normalizeGoalsDatesResponse(res);
          const availableCurrencyCodes = currencyOptions.map((item) => item.code);
          setCurrencies(availableCurrencyCodes.length ? normalizeSelectedCurrencies(d, availableCurrencyCodes) : []);
          // A suggested-amount row that was just added but not filled in yet is intentionally never
          // persisted (blank rows are skipped by validate), so the server's copy doesn't contain it.
          // Re-applying that copy here would wipe the empty row the user is about to type into, so
          // keep any locally-added blank rows on top of the saved ones (not autosave-specific — a
          // manual save would drop them too).
          const savedSuggested = normalizeSuggestedAmountsState(d?.suggestedAmounts);
          const blankSuggestedDrafts = (Array.isArray(suggestedAmounts) ? suggestedAmounts : []).filter(
            (row) => !String(row?.value ?? "").trim() && !String(row?.description ?? "").trim()
          );
          setSuggestedAmounts(blankSuggestedDrafts.length ? [...savedSuggested, ...blankSuggestedDrafts] : savedSuggested);
          setCustomNotes(normalizeCustomNotesState(d?.customNotes));
          setAllowOneTimeDonations(d?.allowOneTimeDonations === undefined ? true : Boolean(d?.allowOneTimeDonations));
          setAllowRecurringDonations(Boolean(d?.allowRecurringDonations));
          setAllowFlexibleRecurringSchedule(d?.allowFlexibleRecurringSchedule === undefined ? true : Boolean(d?.allowFlexibleRecurringSchedule));
          setRecurringPresets(normalizeRecurringPresetsState(d?.recurringPresets, recurringPresets));
          setPaymentMethods(filterPaymentMethodsToOptions(d?.paymentMethods, paymentMethodOptions));
        } catch {}
      }
      if (!silent) toast.success("Goals & dates saved");
      onSaved?.();

      if (goNext) {
        onExit?.({ nextStep: "causes" });
      }
      return { ok: true };
    } catch (e) {
      const msg = getFormErrorMessage(e, "We couldn’t save this step. Please try again.");
      if (!silent) {
        setTopError(msg);
        toast.error(msg);
      }
      return { ok: false, error: msg };
    } finally {
      if (!silent) setSaving(false);
    }
  }

  if (loading) return <Skeleton />;

  if (!formId) {
    return (
      <div className="hc-animate-fade-up rounded-2xl border border-solid border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600">
        Finish Basics first to create the form.
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onExit?.({ nextStep: "basics" })}
            className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
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
    <div className="space-y-4 md:space-y-6">
      <StepErrorSummary
        topError={topError}
        errors={[fieldErrors, suggestedAmountsErrors, recurringPresetsErrors, customNotesErrors]}
      />

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold text-[#111827]">Fundraising Goals & Timeline</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Set the target amount and campaign duration</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Currencies <span className="text-red-600">*</span>
            </div>
            <div className="rounded-2xl border border-solid border-[#E5E7EB] bg-white p-3">
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
              className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
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
              className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
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
              className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.endAt} />
          </div>
        </div>
      </section>

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
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
              className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
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
              className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={disabled}
            />
            <FieldError message={fieldErrors.maximumDonation} />
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#F3F4F6] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Allow One-Time Donations</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Let donors make a single payment</div>
              </div>
              <Toggle enabled={allowOneTimeDonations} onChange={disabled ? () => {} : setAllowOneTimeDonations} />
            </div>
            <FieldError message={fieldErrors.allowOneTimeDonations} />
          </div>

          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Enable Tipping</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Allow donors to add a platform tip</div>
              </div>
              <Toggle enabled={enableTipping} onChange={disabled ? () => {} : setEnableTipping} />
            </div>
          </div>

          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Allow Anonymous Donations</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Let donors hide their name on the public donation feed</div>
              </div>
              <Toggle enabled={allowAnonymousDonations} onChange={disabled ? () => {} : setAllowAnonymousDonations} />
            </div>
          </div>

          <div className="px-3.5 py-3">
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
        allowFlexibleRecurringSchedule={allowFlexibleRecurringSchedule}
        onChangeAllowFlexibleRecurringSchedule={setAllowFlexibleRecurringSchedule}
        value={recurringPresets}
        onChange={setRecurringPresets}
        disabled={disabled}
        errors={recurringPresetsErrors}
        allowError={fieldErrors.allowRecurringDonations}
        sectionError={fieldErrors.recurringPresets}
        campaignStartDate={startAt}
        campaignEndDate={endAt}
      />

      <div className="mt-4">
        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Payment Methods</div>
        <div className="rounded-2xl border border-solid border-[#E5E7EB] bg-white p-3">
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

      {isPublished ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#6B7280]">
          This form is published. Move it to Draft to edit. Save Draft is turned off here.
        </div>
      ) : null}

      <WizardFooterNav
        saving={saving}
        saveDisabled={isPublished}
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

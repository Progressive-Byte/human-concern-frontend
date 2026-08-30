"use client";

import { useState } from "react";
import {
  getProviderLabel,
  getProviderIcon,
  getConfigId,
  shortId,
  getEnvironment,
  getCountryInfo,
  bpsToPercent,
  getCurrencyInfo,
  CURRENCY_LIST,
} from "./constants";
import CurrencyDefaultChips from "./CurrencyDefaultChips";
import TestConnectionResult from "./TestConnectionResult";

function ToggleSwitch({ enabled, onChange, disabled, size = "md" }) {
  const h = size === "sm" ? "h-5" : "h-6";
  const w = size === "sm" ? "w-9" : "w-11";
  const knobS = size === "sm" ? "h-[14px] w-[14px] top-[3px]" : "h-[18px] w-[18px] top-[3px]";
  const knobT = size === "sm" ? "translate-x-4" : "translate-x-5";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(enabled)}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`relative ${h} ${w} shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60 ${
        enabled ? "bg-[#111827]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`absolute ${knobS} left-[3px] rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? knobT : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ConfirmDialog({ open, title, description, confirmText, cancelText, onConfirm, onCancel, danger, inputMatch, inputPlaceholder, inputMatchHint }) {
  const matchRequired = Boolean(inputMatch);
  const [state, setState] = useState({ typed: "", lastOpen: false });
  if (open && !state.lastOpen) {
    setState({ typed: "", lastOpen: true });
  }
  if (!open && state.lastOpen) {
    setState({ typed: state.typed, lastOpen: false });
  }
  const typed = state.typed;

  if (!open) return null;

  const canConfirm = matchRequired ? typed === inputMatch : true;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button type="button" className="fixed inset-0 bg-black/50" onClick={onCancel} aria-label="Close" />
      <div className="hc-animate-dropdown relative w-full max-w-md rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-xl">
        <div className="px-5 pt-5">
          <div className={`mb-2 text-[15px] font-semibold ${danger ? "text-red-800" : "text-[#111827]"}`}>
            {title}
          </div>
          <div className="text-[12px] text-[#6B7280]">{description}</div>
        </div>

        {matchRequired ? (
          <div className="px-5 pt-4">
            <div className="mb-1.5 text-[11px] font-semibold text-[#6B7280]">
              Type the card name to confirm: <span className="font-mono text-[#111827]">{inputMatch}</span>
            </div>
            <input
              type="text"
              autoFocus
              value={typed}
              onChange={(e) => setState((p) => ({ ...p, typed: e.target.value }))}
              placeholder={inputPlaceholder || `Type: ${inputMatch}`}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[12px] font-mono outline-none focus:border-[#111827]/30"
            />
            {inputMatchHint ? (
              <div className="mt-1 text-[10px] text-[#6B7280]">{inputMatchHint}</div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
          >
            {cancelText || "Cancel"}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return;
              onConfirm?.();
            }}
            className={`rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-[#111827] hover:bg-black"
            }`}
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

const MenuButton = ({ options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
        aria-label="Gateway card menu"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <circle cx="10" cy="4.5" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="15.5" r="1.5" />
        </svg>
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
            {options.map((opt, i) => (
              opt.divider ? (
                <div key={i} className="my-1 border-t border-[#F3F4F6]" />
              ) : (
                <button
                  key={i}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    setOpen(false);
                    opt.onClick?.();
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold transition disabled:opacity-50 ${
                    opt.danger
                      ? "text-red-700 hover:bg-red-500/10"
                      : "text-[#111827] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <span className="text-sm">{opt.icon || "•"}</span>
                  <span>{opt.label}</span>
                </button>
              )
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

const GatewayCard = ({
  provider,
  config,
  isSelected,
  onToggleSelect,
  loading,
  busy,
  onToggleEnabled,
  onEdit,
  onMakeDefault,
  onDisconnect,
  onTestConnection,
  onDefaultCurrencyChange,
  isLastActiveForProvider = false,
  inFlightAuthChallenges = [],
  isDefault = false,
  index,
}) => {
  const configurationId = getConfigId(config);
  const cardName = String(config?.name || config?.label || config?.title || "").trim() || `${getProviderLabel(provider)} ${index + 1}`;
  const enabled = Boolean(config?.enabled);
  const environment = getEnvironment(config);
  const isLive = environment === "live";
  const priority = Number(config?.priority ?? 50);
  const feeBps = Number(config?.feeBps ?? 0);
  const merchantCountry = String(config?.merchantCountry || "").trim();
  const countryInfo = getCountryInfo(merchantCountry);
  const scaMap = (() => {
    const map = {};
    if (config && typeof config.scaThresholdsByCurrency === "object" && config.scaThresholdsByCurrency !== null) {
      Object.entries(config.scaThresholdsByCurrency).forEach(([k, v]) => {
        const code = String(k || "").toUpperCase().trim();
        if (!/^[A-Z]{3}$/.test(code)) return;
        const n = Number(v);
        if (!Number.isNaN(n) && Number.isFinite(n) && n >= 0) map[code] = n;
      });
    } else if (config?.scaThresholdAmountMinor != null) {
      const legacyCurrency = String(config?.scaThresholdCurrency || "").toUpperCase().trim();
      const legacyAmount = Number(config.scaThresholdAmountMinor);
      if (/^[A-Z]{3}$/.test(legacyCurrency) && !Number.isNaN(legacyAmount) && legacyAmount >= 0) {
        map[legacyCurrency] = legacyAmount;
      }
    }
    return map;
  })();
  const scaEntries = Object.entries(scaMap).sort(([a], [b]) => a.localeCompare(b));
  const regionTags = Array.isArray(config?.regionTags)
    ? config.regionTags
        .map((t) => String(t || "").trim())
        .filter((t) => t.length > 0 && t.length <= 20)
        .slice(0, 20)
    : [];
  const supportedCurrencies = Array.isArray(config?.supportedCurrencies) ? config.supportedCurrencies : [];
  const defaultCurrency = String(config?.defaultCurrency || supportedCurrencies[0] || "").trim();

  const circuitSuccesses = Number(config?.circuitSuccesses ?? config?.health?.successes ?? 0);
  const circuitFailures = Number(config?.circuitFailures ?? config?.health?.failures ?? 0);
  const lastSuccess = config?.lastSuccessAt ?? config?.health?.lastSuccess;
  const lastFailure = config?.lastFailureAt ?? config?.health?.lastFailure;
  const healthScore =
    circuitSuccesses + circuitFailures > 0
      ? Math.round((circuitSuccesses / (circuitSuccesses + circuitFailures)) * 100)
      : config?.healthScore != null
        ? Number(config.healthScore)
        : null;

  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [pendingNewState, setPendingNewState] = useState(null);

  async function handleEnabledToggle(nextState) {
    if (nextState === false && isLastActiveForProvider) {
      setPendingNewState(nextState);
      setConfirmDisable(true);
      return;
    }
    await onToggleEnabled?.(provider, configurationId, nextState);
  }

  async function runDisableConfirm() {
    setConfirmDisable(false);
    await onToggleEnabled?.(provider, configurationId, pendingNewState);
    setPendingNewState(null);
  }

  async function handleDisconnect() {
    setConfirmDisconnect(true);
  }

  async function runDisconnectConfirm() {
    setConfirmDisconnect(false);
    await onDisconnect?.(provider, configurationId);
  }

  async function handleTest() {
    setTestResult({ loading: true });
    try {
      const res = await onTestConnection?.(provider, configurationId);
      setTestResult({ loading: false, success: true, data: res || {} });
    } catch (e) {
      setTestResult({
        loading: false,
        success: false,
        error: e?.message ? { message: e.message, code: e.code } : String(e),
      });
    }
  }

  const hasInFlight = Array.isArray(inFlightAuthChallenges) && inFlightAuthChallenges.length > 0;

  return (
    <div
      className={`hc-hover-lift hc-animate-fade-up group flex flex-col rounded-2xl border bg-white transition ${
        isSelected ? "border-[#111827] ring-2 ring-[#111827]/10" : "border-[#E5E7EB] hover:border-[#111827]/30"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <label className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={Boolean(isSelected)}
            onChange={() => onToggleSelect?.(`${provider}-${configurationId}`)}
            className="h-4 w-4 accent-[#111827]"
          />
        </label>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]/5 text-lg">
              {getProviderIcon(provider)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="text-[13px] font-semibold text-[#111827] truncate">{cardName}</div>
                {isDefault ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    ⭐ DEFAULT
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#6B7280]">
                <span>{getProviderLabel(provider)}</span>
                {configurationId ? (
                  <span className="font-mono rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px]">
                    {shortId(configurationId)}
                  </span>
                ) : null}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isLive
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {isLive ? "🔴 LIVE" : "🟡 TEST"}
                </span>
                {enabled ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    Enabled
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                    Disabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <MenuButton
          options={[
            { label: "Edit configuration", icon: "⚙️", onClick: () => onEdit?.(provider, config) },
            { label: "Make default", icon: "⭐", onClick: () => onMakeDefault?.(provider, configurationId), disabled: isDefault },
            { label: "Test connection", icon: "🧪", onClick: handleTest },
            { divider: true },
            { label: "Disconnect & remove", icon: "🗑️", danger: true, onClick: handleDisconnect, disabled: !configurationId },
          ]}
        />
      </div>

      <div className="border-t border-[#F3F4F6] bg-[#FCFCFD] p-4 space-y-3 text-[12px]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-sm shrink-0">🌐</span>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Jurisdiction</div>
              <div className="text-[#111827]">
                {countryInfo ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span>{countryInfo.flag}</span>
                    <span className="font-semibold">{countryInfo.code}</span>
                    <span className="text-[#6B7280]">{countryInfo.name}</span>
                  </span>
                ) : merchantCountry ? (
                  <span className="font-semibold">{merchantCountry}</span>
                ) : (
                  <span className="text-[#6B7280]">Not set</span>
                )}
                {scaEntries.length > 0 ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-[#6B7280]">SCA:</span>
                    {scaEntries.slice(0, 4).map(([code, amt]) => {
                      const symbol = (CURRENCY_LIST.find((c) => c.code === code) || {}).symbol || "";
                      return (
                        <span
                          key={code}
                          title={`${code} threshold: ${symbol || code} ${(Number(amt) / 100).toFixed(2)} (minor units ${amt})`}
                          className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                        >
                          <span className="text-[#6B7280]">{code}</span>
                          <span className="tabular-nums">{(Number(amt) / 100).toFixed(2)}</span>
                        </span>
                      );
                    })}
                    {scaEntries.length > 4 ? (
                      <span
                        title={scaEntries.slice(4).map(([code, amt]) => `${code} ${(Number(amt) / 100).toFixed(2)}`).join(" · ")}
                        className="rounded-full border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10.5px] font-bold text-[#6B7280]"
                      >
                        +{scaEntries.length - 4}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-sm shrink-0">💱</span>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Processing Fee</div>
              <div className="text-[#111827]">
                <span className="font-semibold">{feeBps} bps</span>
                <span className="ml-2 rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-mono text-[#6B7280]">
                  = {bpsToPercent(feeBps)} %
                </span>
                <div className="mt-0.5 text-[11px] text-[#6B7280]">
                  Priority: <span className="font-semibold text-[#111827]">{priority}</span> / 100
                </div>
                {regionTags.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-[#6B7280]">Regions:</span>
                    {regionTags.slice(0, 8).map((t, i) => (
                      <span
                        key={`${t}-${i}`}
                        title={`Region tag: ${t}`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-gradient-to-b from-white to-[#F7F7F8] px-2 py-0.5 text-[10.5px] font-semibold text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                      >
                        <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 text-[#9CA3AF]" fill="none">
                          <path d="M6 12.5L14 7.5M6 7.5l8 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                        {t}
                      </span>
                    ))}
                    {regionTags.length > 8 ? (
                      <span
                        title={regionTags.slice(8).join(" · ")}
                        className="rounded-full border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10.5px] font-bold text-[#6B7280]"
                      >
                        +{regionTags.length - 8}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
            <span>💰</span> Supported Currencies
          </div>
          <CurrencyDefaultChips
            supportedCurrencies={supportedCurrencies}
            defaultCurrency={defaultCurrency}
            provider={getProviderLabel(provider)}
            disabled={busy || loading || !configurationId}
            onChange={(nextCurrencies, nextDefault) =>
              onDefaultCurrencyChange?.(provider, configurationId, nextCurrencies, nextDefault)
            }
          />
        </div>

        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-sm shrink-0">🟢</span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Circuit Health</div>
            <div className="flex flex-wrap items-center gap-3 text-[#111827]">
              <div>
                <span className="text-emerald-700 font-semibold">{circuitSuccesses}</span>
                <span className="text-[11px] text-[#6B7280]"> ok</span>
                <span className="mx-1 text-[#6B7280]">/</span>
                <span className="text-red-700 font-semibold">{circuitFailures}</span>
                <span className="text-[11px] text-[#6B7280]"> fail</span>
              </div>
              {healthScore != null ? (
                <div className="inline-flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className={`h-full ${healthScore >= 90 ? "bg-emerald-500" : healthScore >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-semibold ${
                    healthScore >= 90 ? "text-emerald-700" : healthScore >= 70 ? "text-amber-700" : "text-red-700"
                  }`}>
                    {healthScore}/100
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-[#6B7280]">No traffic yet</span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-[#6B7280]">
              {lastSuccess ? <span>Last OK: {new Date(lastSuccess).toLocaleString()}</span> : null}
              {lastFailure ? <span>Last fail: {new Date(lastFailure).toLocaleString()}</span> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F3F4F6] p-3 space-y-3">
        {testResult ? (
          <TestConnectionResult
            result={testResult}
            onClose={() => setTestResult(null)}
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={busy || loading || !configurationId}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11.5px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              🧪 Test
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(provider, config)}
              disabled={busy || loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11.5px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              ⚙️ Edit
            </button>
            <button
              type="button"
              onClick={() => onMakeDefault?.(provider, configurationId)}
              disabled={busy || loading || isDefault || !configurationId}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11.5px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              ⭐ Default
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={busy || loading || !configurationId}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-[11.5px] font-semibold text-red-700 transition hover:bg-red-500/10 disabled:opacity-60"
            >
              🗑️ Disconnect
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
            <span className="text-[11.5px] font-semibold text-[#6B7280]">Enabled</span>
            <ToggleSwitch
              enabled={enabled}
              onChange={handleEnabledToggle}
              disabled={busy || loading || !configurationId}
            />
          </div>
        </div>
      </div>

      {confirmDisable ? (
        <ConfirmDialog
          open
          danger
          title={`Disable the last active ${getProviderLabel(provider)} gateway?`}
          description={
            `This is the last ENABLED ${getProviderLabel(provider)} configuration. ` +
            `If you disable it, donors will not be able to use ${getProviderLabel(provider)} payments. ` +
            `You can re-enable it later, but any in-flight ${getProviderLabel(provider)} challenges will fail.`
          }
          confirmText={`Disable last ${getProviderLabel(provider)} gateway`}
          cancelText="Keep enabled"
          onConfirm={runDisableConfirm}
          onCancel={() => { setConfirmDisable(false); setPendingNewState(null); }}
        />
      ) : null}

      {confirmDisconnect ? (
        hasInFlight ? (
          <ConfirmDialog
            open
            danger
            title="Cannot disconnect — in-flight auth challenges"
            description={
              <>
                <p className="mb-2">The following in-flight authentication challenges are pending for this configuration:</p>
                <ul className="ml-4 list-disc space-y-1">
                  {inFlightAuthChallenges.slice(0, 5).map((ch, i) => (
                    <li key={i} className="font-mono text-[11px]">
                      {ch.donationId || ch.id} · {ch.type || "3DS"} · {ch.status}
                    </li>
                  ))}
                  {inFlightAuthChallenges.length > 5 ? (
                    <li className="font-mono text-[11px] text-[#6B7280]">
                      +{inFlightAuthChallenges.length - 5} more...
                    </li>
                  ) : null}
                </ul>
                <p className="mt-2">
                  Wait for them to complete/expire, or cancel them from the Schedules page. Hard-blocked.
                </p>
              </>
            }
            confirmText="Understood (blocked)"
            cancelText="Close"
            onConfirm={() => setConfirmDisconnect(false)}
            onCancel={() => setConfirmDisconnect(false)}
          />
        ) : (
          <ConfirmDialog
            open
            danger
            title={`Disconnect "${cardName}"?`}
            description="This permanently removes credentials for this gateway card from the server. Any secrets saved on the API will be wiped. This action cannot be undone."
            confirmText={`Yes, disconnect "${cardName}"`}
            cancelText="Cancel"
            inputMatch={cardName}
            inputPlaceholder={`Type: ${cardName}`}
            inputMatchHint="Type the exact card name to confirm."
            onConfirm={runDisconnectConfirm}
            onCancel={() => setConfirmDisconnect(false)}
          />
        )
      ) : null}
    </div>
  );
};

export default GatewayCard;

"use client";

import { useMemo, useState } from "react";
import SettingsSectionCard from "../SettingsSectionCard";
import GatewayCard from "./gatewayCards/GatewayCard";
import GatewayCardFormModal from "./gatewayCards/GatewayCardFormModal";
import BulkGatewayActionsToolbar from "./gatewayCards/BulkGatewayActionsToolbar";
import LegacyMigrationWizard from "./gatewayCards/LegacyMigrationWizard";
import {
  PROVIDERS,
  getProviderLabel,
  getConfigId,
  getEnvironment,
} from "./gatewayCards/constants";

import {
  updateAdminPaymentGatewayConfigurationExtended,
  setAdminPaymentGatewayEnabledExtended,
  setAdminPaymentGatewayDefault,
  disconnectAdminPaymentGateway,
  runGatewayHealthCanary,
} from "@/services/admin";

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M4 7h16v10H4V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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
    const activeConfigurationIds = Array.isArray(gateway?.activeConfigurationIds)
      ? gateway.activeConfigurationIds.map((id) => getConfigId({ configurationId: id })).filter(Boolean)
      : [];
    const activeConfigurationId = activeConfigurationIds[0] || (gateway?.activeConfigurationId ? getConfigId({ configurationId: gateway.activeConfigurationId }) : "");
    const defaultConfigurationId = getConfigId({ configurationId: gateway?.defaultConfigurationId });
    const configurations = (Array.isArray(gateway?.configurations) ? gateway.configurations : []).map((config) => {
      const configurationId = getConfigId(config);
      return {
        ...config,
        provider,
        configurationId,
        enabled:
          typeof config?.enabled === "boolean"
            ? config.enabled
            : Boolean(configurationId && (activeConfigurationIds.includes(configurationId) || activeConfigurationId === configurationId)),
        isDefault:
          Boolean(config?.isDefault ?? config?.default ?? configurationId === defaultConfigurationId),
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

function flattenAllConfigs(gateways) {
  const all = [];
  gateways.forEach((g) => {
    (Array.isArray(g?.configurations) ? g.configurations : []).forEach((cfg) => {
      all.push({ provider: g.provider, ...cfg });
    });
  });
  return all;
}

function keyOf(cfg) {
  return `${cfg.provider}-${getConfigId(cfg)}`;
}

const PaymentTab = ({ value, loading, busy, onConfigure, onToggleEnabled, onDisconnect, refresh }) => {
  const gateways = useMemo(() => normalizeGateways(value), [value]);
  const allConfigs = useMemo(() => flattenAllConfigs(gateways), [gateways]);

  const [providerFilter, setProviderFilter] = useState("all");
  const [enabledFilter, setEnabledFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");

  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [initialProvider, setInitialProvider] = useState("stripe");
  const [localBusy, setLocalBusy] = useState(false);
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [errors, setErrors] = useState([]);

  function pushError(msg) {
    setErrors((prev) => [...prev.slice(-4), { id: Date.now() + Math.random(), msg }]);
  }

  function isBusy() {
    return Boolean(busy || localBusy || loading);
  }

  const filteredConfigs = useMemo(() => {
    return allConfigs.filter((cfg) => {
      if (providerFilter !== "all" && String(cfg.provider).toLowerCase() !== providerFilter) return false;
      if (enabledFilter === "active" && !cfg.enabled) return false;
      if (enabledFilter === "inactive" && cfg.enabled) return false;
      const env = getEnvironment(cfg);
      if (envFilter === "test" && env !== "test") return false;
      if (envFilter === "live" && env !== "live") return false;
      return true;
    });
  }, [allConfigs, providerFilter, enabledFilter, envFilter]);

  const activeCountByProvider = useMemo(() => {
    const m = {};
    gateways.forEach((g) => {
      const provider = String(g.provider || "").toLowerCase();
      m[provider] = (Array.isArray(g.configurations) ? g.configurations : []).filter((c) => c.enabled).length;
    });
    return m;
  }, [gateways]);

  function toggleSelected(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearSelected() {
    setSelected(new Set());
  }

  function openAdd(provider = "stripe") {
    setInitialProvider(provider);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(provider, config) {
    setInitialProvider(provider);
    setEditing({ provider, config });
    setModalOpen(true);
  }

  async function saveHandler(provider, payload) {
    setLocalBusy(true);
    try {
      let res;
      if (typeof onConfigure === "function") {
        res = await onConfigure(provider, payload);
      } else {
        res = await updateAdminPaymentGatewayConfigurationExtended(provider, payload);
      }
      setModalOpen(false);
      setEditing(null);
      if (typeof refresh === "function") refresh();
      return res;
    } catch (e) {
      pushError(e?.message || String(e));
      throw e;
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleToggleEnabled(provider, configurationId, nextEnabled) {
    setLocalBusy(true);
    try {
      let res;
      if (typeof onToggleEnabled === "function") {
        res = await onToggleEnabled(provider, configurationId, nextEnabled);
      } else {
        res = await setAdminPaymentGatewayEnabledExtended(provider, nextEnabled, configurationId);
      }
      if (typeof refresh === "function") refresh();
      return res;
    } catch (e) {
      pushError(e?.message || String(e));
      throw e;
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleMakeDefault(provider, configurationId) {
    setLocalBusy(true);
    try {
      const res = await setAdminPaymentGatewayDefault(provider, configurationId);
      if (typeof refresh === "function") refresh();
      return res;
    } catch (e) {
      pushError(e?.message || String(e));
      throw e;
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleDisconnect(provider, configurationId) {
    setLocalBusy(true);
    try {
      let res;
      if (typeof onDisconnect === "function") {
        res = await onDisconnect(provider, configurationId);
      } else {
        res = await disconnectAdminPaymentGateway(provider, configurationId);
      }
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(`${provider}-${configurationId}`);
        return next;
      });
      if (typeof refresh === "function") refresh();
      return res;
    } catch (e) {
      pushError(e?.message || String(e));
      throw e;
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleTest(provider, configurationId) {
    return await runGatewayHealthCanary(provider, configurationId, {
      amountMinor: 100,
      currency: "USD",
      testMode: true,
    });
  }

  async function handleDefaultCurrencyChange(provider, configurationId, supportedCurrencies, defaultCurrency) {
    setLocalBusy(true);
    try {
      const existing = allConfigs.find((c) => c.provider === provider && getConfigId(c) === configurationId);
      const payload = {
        configurationId,
        name: existing?.name || `${getProviderLabel(provider)} config`,
        supportedCurrencies,
        defaultCurrency,
      };
      await updateAdminPaymentGatewayConfigurationExtended(provider, payload);
      if (typeof refresh === "function") refresh();
    } catch (e) {
      pushError(e?.message || String(e));
      throw e;
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleBulkEnable(keys) {
    setLocalBusy(true);
    try {
      for (const key of keys) {
        const cfg = allConfigs.find((c) => keyOf(c) === key);
        if (cfg) await setAdminPaymentGatewayEnabledExtended(cfg.provider, true, getConfigId(cfg));
      }
      clearSelected();
      if (typeof refresh === "function") refresh();
    } catch (e) {
      pushError(e?.message || String(e));
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleBulkDisable(keys) {
    setLocalBusy(true);
    try {
      for (const key of keys) {
        const cfg = allConfigs.find((c) => keyOf(c) === key);
        if (cfg) await setAdminPaymentGatewayEnabledExtended(cfg.provider, false, getConfigId(cfg));
      }
      clearSelected();
      if (typeof refresh === "function") refresh();
    } catch (e) {
      pushError(e?.message || String(e));
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleBulkDisconnect(keys) {
    setLocalBusy(true);
    try {
      for (const key of keys) {
        const cfg = allConfigs.find((c) => keyOf(c) === key);
        if (cfg && getConfigId(cfg)) await disconnectAdminPaymentGateway(cfg.provider, getConfigId(cfg));
      }
      clearSelected();
      if (typeof refresh === "function") refresh();
    } catch (e) {
      pushError(e?.message || String(e));
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleBulkSetPriority(keys, priority) {
    setLocalBusy(true);
    try {
      for (const key of keys) {
        const cfg = allConfigs.find((c) => keyOf(c) === key);
        if (cfg) {
          await updateAdminPaymentGatewayConfigurationExtended(cfg.provider, {
            configurationId: getConfigId(cfg),
            name: cfg.name || `${getProviderLabel(cfg.provider)} config`,
            priority: Number(priority),
          });
        }
      }
      if (typeof refresh === "function") refresh();
    } catch (e) {
      pushError(e?.message || String(e));
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleBulkAddCurrency(keys, currency) {
    setLocalBusy(true);
    try {
      for (const key of keys) {
        const cfg = allConfigs.find((c) => keyOf(c) === key);
        if (cfg) {
          const existing = Array.isArray(cfg.supportedCurrencies) ? [...cfg.supportedCurrencies] : [];
          const next = existing.includes(currency) ? existing : [...existing, currency];
          await updateAdminPaymentGatewayConfigurationExtended(cfg.provider, {
            configurationId: getConfigId(cfg),
            name: cfg.name || `${getProviderLabel(cfg.provider)} config`,
            supportedCurrencies: next,
            defaultCurrency: cfg.defaultCurrency || next[0] || currency,
          });
        }
      }
      if (typeof refresh === "function") refresh();
    } catch (e) {
      pushError(e?.message || String(e));
    } finally {
      setLocalBusy(false);
    }
  }

  async function handleMigration(provider, configurationId, extendedFields) {
    const existing = allConfigs.find((c) => c.provider === provider && getConfigId(c) === configurationId);
    const payload = {
      configurationId,
      name: existing?.name || `${getProviderLabel(provider)} migrated`,
      ...extendedFields,
    };
    return await updateAdminPaymentGatewayConfigurationExtended(provider, payload);
  }

  const selectedArr = Array.from(selected);

  return (
    <SettingsSectionCard icon={<CreditCardIcon />} title="Payment" subtitle="Configure payment gateways with cards grid orchestration">
      {errors.length > 0 ? (
        <div className="mb-4 space-y-2">
          {errors.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800"
            >
              <span>⚠️ {e.msg}</span>
              <button
                type="button"
                onClick={() => setErrors((prev) => prev.filter((x) => x.id !== e.id))}
                className="text-red-700 hover:text-red-900"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <label className="sr-only" htmlFor="pf-prov">Provider</label>
              <select
                id="pf-prov"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                disabled={loading || localBusy}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#111827] outline-none transition focus:border-[#111827]/30"
              >
                <option value="all">All Providers</option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>{getProviderLabel(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="sr-only" htmlFor="pf-en">Enabled</label>
              <select
                id="pf-en"
                value={enabledFilter}
                onChange={(e) => setEnabledFilter(e.target.value)}
                disabled={loading || localBusy}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#111827] outline-none transition focus:border-[#111827]/30"
              >
                <option value="all">Active + Inactive</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
            <div>
              <label className="sr-only" htmlFor="pf-env">Environment</label>
              <select
                id="pf-env"
                value={envFilter}
                onChange={(e) => setEnvFilter(e.target.value)}
                disabled={loading || localBusy}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#111827] outline-none transition focus:border-[#111827]/30"
              >
                <option value="all">Test + Live</option>
                <option value="test">Test only</option>
                <option value="live">Live only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMigrationOpen(true)}
              disabled={loading || localBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              <span>🔄</span>
              Legacy Migration
            </button>
            <button
              type="button"
              onClick={() => openAdd("stripe")}
              disabled={loading || localBusy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-[12.5px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:opacity-60"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/10">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Add New Gateway Card
            </button>
          </div>
        </div>

        <BulkGatewayActionsToolbar
          selected={selectedArr}
          allConfigs={allConfigs}
          onClear={clearSelected}
          busy={busy || localBusy}
          onBulkEnable={handleBulkEnable}
          onBulkDisable={handleBulkDisable}
          onBulkDisconnect={handleBulkDisconnect}
          onBulkSetPriority={handleBulkSetPriority}
          onBulkAddCurrency={handleBulkAddCurrency}
          onRunLegacyMigration={() => setMigrationOpen(true)}
        />
      </div>

      {filteredConfigs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredConfigs.map((cfg, idx) => {
            const provider = String(cfg.provider || "").toLowerCase();
            const key = keyOf(cfg);
            const activeForP = activeCountByProvider[provider] || 0;
            const isLastActive = cfg.enabled && activeForP <= 1;
            return (
              <GatewayCard
                key={key}
                provider={provider}
                config={cfg}
                isSelected={selected.has(key)}
                onToggleSelect={toggleSelected}
                index={idx}
                loading={loading}
                busy={busy || localBusy}
                isDefault={Boolean(cfg.isDefault)}
                isLastActiveForProvider={isLastActive}
                inFlightAuthChallenges={Array.isArray(cfg.inFlightAuthChallenges) ? cfg.inFlightAuthChallenges : []}
                onToggleEnabled={handleToggleEnabled}
                onEdit={openEdit}
                onMakeDefault={handleMakeDefault}
                onDisconnect={handleDisconnect}
                onTestConnection={handleTest}
                onDefaultCurrencyChange={handleDefaultCurrencyChange}
              />
            );
          })}
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FCFCFD] px-4 py-10 text-center">
          <div className="text-[13px] text-[#6B7280]">Loading gateway configurations...</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FCFCFD] px-4 py-10 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827]/5 text-2xl">
            💳
          </div>
          <div className="text-[14px] font-semibold text-[#111827]">No gateway cards match the current filters</div>
          <div className="mt-1 text-[12px] text-[#6B7280]">
            {allConfigs.length === 0
              ? "Add your first Stripe or PayPal gateway card to get started."
              : "Try changing the Provider, Enabled, or Environment filter."}
          </div>
          {allConfigs.length === 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => openAdd("stripe")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
              >
                ⚡ + Stripe
              </button>
              <button
                type="button"
                onClick={() => openAdd("paypal")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
              >
                🅿️ + PayPal
              </button>
            </div>
          ) : null}
        </div>
      )}

      <GatewayCardFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={saveHandler}
        busy={busy || localBusy}
        editing={editing}
        allConfigs={allConfigs}
        initialProvider={initialProvider}
      />

      <LegacyMigrationWizard
        open={migrationOpen}
        onClose={() => {
          setMigrationOpen(false);
          if (typeof refresh === "function") refresh();
        }}
        existingGateways={gateways}
        busy={busy || localBusy}
        onMigrate={handleMigration}
      />
    </SettingsSectionCard>
  );
};

export default PaymentTab;

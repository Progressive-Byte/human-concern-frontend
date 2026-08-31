"use client";

import { useEffect, useMemo, useState } from "react";
import { PROVIDERS, getProviderLabel, getProviderIcon, getConfigId } from "./constants";

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
    <div className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto p-4">
      <button type="button" className="fixed inset-0 bg-black/50" onClick={onClose} aria-label="Close modal overlay" />
      <div className="hc-animate-dropdown relative my-8 w-full max-w-[640px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-xl">
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
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const STEPS = [
  { key: "intro", title: "Overview" },
  { key: "scan", title: "2. Scan Legacy Data" },
  { key: "review", title: "3. Review & Map Fields" },
  { key: "migrate", title: "4. Run Migration" },
  { key: "done", title: "5. Done" },
];

function Stepper({ current }) {
  return (
    <div className="mb-5 flex items-center gap-1.5 overflow-x-auto">
      {STEPS.map((s, idx) => {
        const isActive = s.key === current;
        const isDone = STEPS.findIndex((x) => x.key === current) > idx;
        return (
          <div key={s.key} className="flex items-center gap-1.5 shrink-0">
            <div
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold ${
                isActive
                  ? "bg-[#111827] text-white"
                  : isDone
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#F3F4F6] text-[#6B7280]"
              }`}
            >
              {isDone ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                  <path d="M2.5 6.2l2 2 5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{idx + 1}.</span>
              )}
              <span>{s.title}</span>
            </div>
            {idx < STEPS.length - 1 ? (
              <div className="h-0.5 w-4 bg-[#E5E7EB]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const LegacyMigrationWizard = ({
  open,
  onClose,
  existingGateways = [],
  busy,
  onMigrate,
}) => {
  const [tracker, setTracker] = useState({
    lastOpen: false,
    step: "intro",
    scanResult: null,
    migrationChoices: {},
    migrateResult: null,
    simulatedProgress: 0,
  });

  if (open !== tracker.lastOpen) {
    setTracker({
      lastOpen: open,
      step: "intro",
      scanResult: null,
      migrationChoices: {},
      migrateResult: null,
      simulatedProgress: 0,
    });
  }

  const step = tracker.step;
  const scanResult = tracker.scanResult;
  const migrationChoices = tracker.migrationChoices;
  const migrateResult = tracker.migrateResult;
  const simulatedProgress = tracker.simulatedProgress;

  function setStep(v) {
    setTracker((p) => ({
      ...p,
      step: typeof v === "function" ? v(p.step) : v,
    }));
  }
  function setScanResult(v) {
    setTracker((p) => ({
      ...p,
      scanResult: typeof v === "function" ? v(p.scanResult) : v,
    }));
  }
  function setMigrationChoices(v) {
    setTracker((p) => ({
      ...p,
      migrationChoices: typeof v === "function" ? v(p.migrationChoices) : v,
    }));
  }
  function setMigrateResult(v) {
    setTracker((p) => ({
      ...p,
      migrateResult: typeof v === "function" ? v(p.migrateResult) : v,
    }));
  }
  function setSimulatedProgress(v) {
    setTracker((p) => ({
      ...p,
      simulatedProgress: typeof v === "function" ? v(p.simulatedProgress) : v,
    }));
  }

  const allConfigs = useMemo(() => {
    const list = [];
    existingGateways.forEach((g) => {
      const provider = String(g?.provider || "");
      const cfgs = Array.isArray(g?.configurations) ? g.configurations : [];
      cfgs.forEach((cfg) => {
        list.push({ provider, ...cfg, configurationId: getConfigId(cfg) });
      });
    });
    return list;
  }, [existingGateways]);

  function runScan() {
    const legacyCards = [];
    let idx = 0;
    allConfigs.forEach((cfg) => {
      idx += 1;
      const missing = [];
      if (!cfg.merchantCountry) missing.push("merchantCountry");
      if (cfg.feeBps === undefined || cfg.feeBps === null) missing.push("feeBps");
      if (!Array.isArray(cfg.supportedCurrencies) || cfg.supportedCurrencies.length === 0) missing.push("supportedCurrencies");
      if (!cfg.environment) missing.push("environment");
      if (cfg.priority === undefined || cfg.priority === null) missing.push("priority");
      legacyCards.push({
        key: `${cfg.provider}-${cfg.configurationId || idx}`,
        provider: cfg.provider,
        configurationId: cfg.configurationId || `legacy-${idx}`,
        name: cfg.name || `${getProviderLabel(cfg.provider)} ${idx}`,
        missing,
        defaults: {
          priority: cfg.priority ?? 50,
          merchantCountry: cfg.merchantCountry ?? "",
          feeBps: cfg.feeBps ?? (String(cfg.provider).toLowerCase() === "paypal" ? 349 : 290),
          supportedCurrencies: Array.isArray(cfg.supportedCurrencies) && cfg.supportedCurrencies.length
            ? [...cfg.supportedCurrencies]
            : ["USD"],
          defaultCurrency: cfg.defaultCurrency || (Array.isArray(cfg.supportedCurrencies) && cfg.supportedCurrencies[0]) || "USD",
          environment: cfg.environment || "AUTO-INFER",
          description: cfg.description || "Migrated from legacy settings.",
        },
      });
    });

    const perProvider = {};
    PROVIDERS.forEach((p) => {
      perProvider[p] = legacyCards.filter((l) => l.provider === p).length;
    });

    setScanResult({
      total: legacyCards.length,
      perProvider,
      cards: legacyCards,
      withMissing: legacyCards.filter((l) => l.missing.length > 0).length,
    });

    const choices = {};
    legacyCards.forEach((c) => {
      choices[c.key] = {
        include: true,
        ...c.defaults,
      };
    });
    setMigrationChoices(choices);
    setStep("review");
  }

  function toggleInclude(key) {
    setMigrationChoices((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), include: !(prev[key]?.include) },
    }));
  }

  function updateChoice(key, field, value) {
    setMigrationChoices((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  }

  async function runMigration() {
    setStep("migrate");
    setSimulatedProgress(0);
    const toMigrate = (scanResult?.cards || []).filter((c) => migrationChoices[c.key]?.include);
    const total = toMigrate.length || 1;
    const migrated = [];
    const errors = [];

    for (let i = 0; i < toMigrate.length; i += 1) {
      const card = toMigrate[i];
      const choice = migrationChoices[card.key];
      try {
        if (typeof onMigrate === "function") {
          await onMigrate(card.provider, card.configurationId, {
            priority: choice?.priority ?? 50,
            merchantCountry: choice?.merchantCountry || "",
            feeBps: choice?.feeBps ?? 0,
            supportedCurrencies: choice?.supportedCurrencies || ["USD"],
            defaultCurrency: choice?.defaultCurrency || "USD",
            environment: choice?.environment || "AUTO-INFER",
            description: choice?.description || "",
            adminNotes: choice?.description || "",
          });
        }
        migrated.push(card.key);
      } catch (e) {
        errors.push({ key: card.key, error: e?.message || String(e) });
      }
      setSimulatedProgress(Math.round(((i + 1) / total) * 100));
    }

    setMigrateResult({ migrated: migrated.length, errors, total: toMigrate.length });
    setStep("done");
  }

  const scan = scanResult;
  const choiceEntries = Object.entries(migrationChoices);
  const includedCount = choiceEntries.filter(([, v]) => v?.include).length;

  return (
    <ModalShell open={open} onClose={onClose} title="Legacy Configuration Migration Wizard">
      <Stepper current={step} />

      {step === "intro" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="mb-2 text-[14px] font-semibold text-[#111827]">What this wizard does</div>
            <div className="space-y-1.5 text-[12px] text-[#6B7280]">
              <p>• Scans existing legacy gateway configurations saved in the old flat format.</p>
              <p>• Detects missing required fields: <span className="font-mono text-[#111827]">merchantCountry</span>, <span className="font-mono text-[#111827]">priority</span>, <span className="font-mono text-[#111827]">feeBps</span>, <span className="font-mono text-[#111827]">supportedCurrencies</span>, <span className="font-mono text-[#111827]">environment</span>, and <span className="font-mono text-[#111827]">adminNotes</span>.</p>
              <p>• Proposes sensible per-card defaults you can review and override.</p>
              <p>• Runs bulk PUT/PATCH updates on each configuration with the 10 new S0 fields.</p>
              <p>• Reports which cards were upgraded and any that failed.</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-900">
            <div className="font-semibold mb-1">⚠️  Before you begin</div>
            <p>
              Back up your production database first. Migration runs per-card so you can safely
              retry. Any secrets will remain masked and unchanged.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[12px] text-[#6B7280]">
              {allConfigs.length} existing configuration{allConfigs.length === 1 ? "" : "s"} detected.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep("scan")}
                className="rounded-xl bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {step === "scan" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#111827]/5 text-[#111827]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path d="M10 3h4M5 8h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2zM9 13h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mb-1 text-[14px] font-semibold text-[#111827]">Analyzing legacy configurations...</div>
            <div className="text-[12px] text-[#6B7280]">Checking each saved entry for missing S0 fields.</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={runScan}
                disabled={busy}
                className="rounded-xl bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {busy ? "Scanning..." : "▶  Run Scan Now"}
              </button>
            </div>
          </div>
          <div className="flex justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep("intro")}
              className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]"
            >
              ← Back
            </button>
          </div>
        </div>
      ) : null}

      {step === "review" && scan ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
              <div className="text-[11px] text-[#6B7280]">Total cards</div>
              <div className="mt-1 text-[20px] font-semibold text-[#111827]">{scan.total}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-[11px] text-amber-800">Missing fields</div>
              <div className="mt-1 text-[20px] font-semibold text-amber-900">{scan.withMissing}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-[11px] text-emerald-800">Included</div>
              <div className="mt-1 text-[20px] font-semibold text-emerald-900">{includedCount}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PROVIDERS.filter((p) => scan.perProvider[p] > 0).map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
                <span>{getProviderIcon(p)}</span>
                {getProviderLabel(p)} × {scan.perProvider[p]}
              </span>
            ))}
          </div>

          <div className="max-h-[280px] overflow-y-auto rounded-xl border border-[#E5E7EB]">
            {scan.cards.map((card) => {
              const choice = migrationChoices[card.key] || {};
              return (
                <div
                  key={card.key}
                  className={`border-b border-[#F3F4F6] last:border-b-0 p-3 ${choice.include ? "bg-white" : "bg-[#F9FAFB] opacity-60"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#111827]">
                      <input
                        type="checkbox"
                        checked={Boolean(choice.include)}
                        onChange={() => toggleInclude(card.key)}
                        className="h-4 w-4 accent-[#111827]"
                      />
                      <span className="inline-flex items-center gap-1.5">
                        <span>{getProviderIcon(card.provider)}</span>
                        {card.name || getProviderLabel(card.provider)}
                      </span>
                    </label>
                    {card.missing.length > 0 ? (
                      <div className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        missing: {card.missing.join(", ")}
                      </div>
                    ) : (
                      <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        ✓ all S0 fields present
                      </div>
                    )}
                  </div>

                  {choice.include ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 pl-6">
                      <div>
                        <div className="mb-0.5 text-[10px] font-semibold text-[#6B7280]">Priority</div>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={Number(choice.priority ?? 50)}
                          onChange={(e) => updateChoice(card.key, "priority", Number(e.target.value))}
                          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] outline-none"
                        />
                      </div>
                      <div>
                        <div className="mb-0.5 text-[10px] font-semibold text-[#6B7280]">Fee bps</div>
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          value={Number(choice.feeBps ?? 0)}
                          onChange={(e) => updateChoice(card.key, "feeBps", Number(e.target.value))}
                          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="mb-0.5 text-[10px] font-semibold text-[#6B7280]">Merchant Country</div>
                        <select
                          value={choice.merchantCountry || ""}
                          onChange={(e) => updateChoice(card.key, "merchantCountry", e.target.value)}
                          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] outline-none"
                        >
                          <option value="">(not set)</option>
                          {["US","GB","AE","SA","KW","BH","OM","QA","IN","FR","DE","CA","AU","JP","SG","HK","MY","TH","EG","TR","ZA","NG"].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="mb-0.5 text-[10px] font-semibold text-[#6B7280]">Environment</div>
                        <select
                          value={choice.environment || "AUTO-INFER"}
                          onChange={(e) => updateChoice(card.key, "environment", e.target.value)}
                          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] outline-none"
                        >
                          <option value="AUTO-INFER">AUTO-INFER</option>
                          <option value="TEST">TEST</option>
                          <option value="LIVE">LIVE</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-0.5 text-[10px] font-semibold text-[#6B7280]">Default currency</div>
                        <select
                          value={choice.defaultCurrency || "USD"}
                          onChange={(e) => updateChoice(card.key, "defaultCurrency", e.target.value)}
                          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] outline-none"
                        >
                          {["USD","EUR","GBP","AED","SAR","INR","CAD","AUD","JPY","SGD","HKD","EGP","TRY"].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep("scan")}
              className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]"
            >
              ← Back (re-scan)
            </button>
            <button
              type="button"
              disabled={busy || includedCount === 0}
              onClick={runMigration}
              className="rounded-xl bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {busy ? "Starting migration..." : `Migrate ${includedCount} card${includedCount === 1 ? "" : "s"} →`}
            </button>
          </div>
        </div>
      ) : null}

      {step === "migrate" ? (
        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center">
            <div className="mb-3 text-[14px] font-semibold text-[#111827]">
              Migrating cards with extended S0 schema...
            </div>
            <div className="mx-auto w-full max-w-sm">
              <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full bg-[#111827] transition-all duration-300"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
              <div className="mt-2 text-[12px] font-semibold text-[#6B7280]">{simulatedProgress}%</div>
            </div>
            <div className="mt-3 text-[11px] text-[#6B7280]">
              PUT /admin/settings/payment/gateways/:provider/configuration with extended fields.
            </div>
          </div>
        </div>
      ) : null}

      {step === "done" && migrateResult ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none">
                <path d="M4 10.5l3.5 3.5 8.5-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-[16px] font-semibold text-emerald-900">Migration complete</div>
            <div className="mt-1 text-[12px] text-emerald-800">
              {migrateResult.migrated} of {migrateResult.total} card{migrateResult.total === 1 ? "" : "s"} upgraded successfully.
            </div>
          </div>

          {migrateResult.errors && migrateResult.errors.length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="mb-2 text-[12px] font-semibold text-red-800">Errors</div>
              <ul className="space-y-1 text-[11px] text-red-700">
                {migrateResult.errors.map((e, i) => (
                  <li key={i} className="font-mono">
                    • {e.key}: {e.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
            >
              Finish & Close
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
};

export default LegacyMigrationWizard;

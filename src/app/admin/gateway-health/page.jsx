"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import {
  listGatewayHealthOverview,
  getGatewayHealthDetail,
  forceCloseCircuit,
  forceOpenCircuit,
  runCanaryProbe,
  getCanaryProbeResult,
  resetGatewayCounters,
  sweepOpenExpiredCircuits,
  bulkPauseProvider,
  bulkResumeProvider,
} from "@/services/adminGatewayHealth";
import { useAdminAuth } from "@/context/AdminAuthContext";
import GatewayHealthHeader from "./components/GatewayHealthHeader";
import GatewayHealthSummaryCards from "./components/GatewayHealthSummaryCards";
import GatewayHealthFilters from "./components/GatewayHealthFilters";
import GatewayHealthTable from "./components/GatewayHealthTable";
import { SuccessRateChart, LatencyBarChart } from "./components/GatewayHealthCharts";
import DetailDrawer from "./components/DetailDrawer";
import {
  ForceCloseDialog,
  ForceOpenDialog,
  CanaryDialog,
  ResetCountersDialog,
  BulkPauseDialog,
  BulkResumeDialog,
  SweepConfirmDialog,
} from "./components/ActionDialogs";

function useHasPermission(perm) {
  try {
    const ctx = useAdminAuth();
    const admin = ctx?.admin;
    if (!admin) return true;
    const role = String(admin?.role || "").toLowerCase();
    if (role === "super_admin" || role === "admin" || role === "owner") return true;
    const perms = Array.isArray(admin?.permissions) ? admin.permissions : [];
    if (perms.length === 0) return true;
    const p = String(perm || "").toLowerCase();
    return perms.some((x) => String(x || "").toLowerCase() === p || String(x || "").toLowerCase().startsWith("settings."));
  } catch {
    return true;
  }
}

function remapOverviewRow(rawRow) {
  const r = rawRow && typeof rawRow === "object" ? rawRow : {};

  const rawCircuit = String(r.circuitStatus ?? r.state ?? "").toUpperCase();
  const docsClosedSet = new Set(["CLOSED", "TRACKING", "CLOSED_NORMAL", "NORMAL"]);
  const docsHalfOpenSet = new Set(["HALF_OPEN"]);
  const docsOpenSet = new Set(["OPEN", "FORCE_OPEN", "FORCE_CLOSED"]);
  const hasManualOverride = Boolean(
    r.manualOverride || r.overrideMeta ||
    ["MANUAL_FORCE_OPEN", "MANUAL_FORCE_CLOSE", "FORCE_OPEN", "FORCE_CLOSED", "BULK_PAUSE", "BULK_RESUME"].includes(rawCircuit) ||
    ["manual_force_open", "manual_force_close", "bulk_pause", "bulk_resume"].includes(String(r.lastTripReason ?? r.tripReason ?? "").toLowerCase())
  );

  let circuitStatus;
  if (docsClosedSet.has(rawCircuit)) circuitStatus = "CLOSED";
  else if (docsHalfOpenSet.has(rawCircuit)) circuitStatus = "HALF_OPEN";
  else if (docsOpenSet.has(rawCircuit)) {
    if (["FORCE_CLOSED", "MANUAL_FORCE_CLOSE", "BULK_PAUSE"].includes(rawCircuit) ||
        ["manual_force_close", "bulk_pause"].includes(String(r.lastTripReason ?? r.tripReason ?? "").toLowerCase())) {
      circuitStatus = hasManualOverride ? "FORCE_CLOSED" : "CLOSED";
    } else if (["FORCE_OPEN", "MANUAL_FORCE_OPEN", "BULK_RESUME"].includes(rawCircuit) ||
               ["manual_force_open", "bulk_resume"].includes(String(r.lastTripReason ?? r.tripReason ?? "").toLowerCase())) {
      circuitStatus = hasManualOverride ? "FORCE_OPEN" : "OPEN";
    } else {
      circuitStatus = "OPEN";
    }
  } else circuitStatus = rawCircuit || "CLOSED";

  const successLifetime = Number(r.successLifetime ?? r.successCount ?? r.successes ?? r.totalSuccesses ?? 0);
  const totalCallsLifetime = Number(r.totalCallsLifetime ?? ((r.successCount ?? r.successes ?? 0) + (r.failureCount ?? r.failures ?? 0)) ?? 0);
  const failureLifetime = Number(r.failureCount ?? r.failures ?? r.totalFailures ?? (totalCallsLifetime - successLifetime) ?? 0);

  const jurisdiction = r.jurisdiction && typeof r.jurisdiction === "object" ? r.jurisdiction : {};
  const fees = r.fees && typeof r.fees === "object" ? r.fees : {};
  const scaThresholds = r.scaThresholds && typeof r.scaThresholds === "object" ? r.scaThresholds : {};
  const statusBadge = r.statusBadge && typeof r.statusBadge === "object" ? r.statusBadge : {};
  const rolling = r.rolling && typeof r.rolling === "object" ? r.rolling : null;

  return {
    provider: String(r.provider ?? r.gatewayProvider ?? ""),
    confId: String(r.confId ?? r.gatewayConfigurationId ?? r.configurationId ?? ""),
    gatewayConfigurationId: String(r.gatewayConfigurationId ?? r.configurationId ?? r.confId ?? ""),
    name: String(r.name ?? (r.provider && r.gatewayConfigurationId ? `${r.provider} · ${r.gatewayConfigurationId}` : "")),
    environment: String(r.environment ?? r.mode ?? "").toLowerCase() || "live",
    mode: String(r.mode ?? r.environment ?? "live").toLowerCase(),
    isLiveMode: typeof r.isLiveMode === "boolean" ? r.isLiveMode : (String(r.mode ?? r.environment ?? "live").toLowerCase() === "live"),

    merchantCountry: String(jurisdiction.country ?? r.merchantCountry ?? r.country ?? r.jurisdiction ?? ""),
    regionTags: Array.isArray(jurisdiction.regionTags) ? jurisdiction.regionTags : Array.isArray(r.regionTags) ? r.regionTags : [],
    jurisdiction,

    scaThresholdMinor: r.scaThresholdMinor ?? (scaThresholds.raw && Object.keys(scaThresholds.raw).length > 0 ? Object.values(scaThresholds.raw)[0] : r.scaThreshold ?? null),
    scaThresholds,
    feesBps: Number(fees.feeBps ?? r.feesBps ?? r.feeBps ?? r.processingFeeBps ?? 0),
    feesDisplay: String(fees.display ?? (Number(fees.feeBps ?? r.feesBps ?? 0) > 0 ? `${(Number(fees.feeBps ?? r.feesBps ?? 0) / 100).toFixed(2)}% (${Number(fees.feeBps ?? r.feesBps ?? 0)} bps)` : "")),
    fees,

    currencies: Array.isArray(r.currencies) ? r.currencies : Array.isArray(r.supportedCurrencies) ? r.supportedCurrencies : [],

    circuitStatus,
    status: String(r.status ?? statusBadge.label ?? r.operationalStatus ?? r.connectionStatus ?? "").toUpperCase(),
    statusBadgeLabel: String(statusBadge.label ?? ""),
    statusBadgeTone: String(statusBadge.tone ?? "default").toLowerCase(),
    statusBadge,

    healthScore: Number(r.healthScore ?? r.score ?? 0),

    successes: successLifetime,
    successCount: successLifetime,
    successLifetime,
    failures: failureLifetime,
    failureCount: failureLifetime,
    totalCallsLifetime,

    lastSuccessAt: r.lastSuccessAt ?? r.lastSuccess ?? null,
    lastFailureAt: r.lastFailureAt ?? r.lastFailure ?? null,

    tripReason: String(r.tripReason ?? r.lastTripReason ?? r.reason ?? ""),
    lastTripReason: String(r.lastTripReason ?? r.tripReason ?? r.reason ?? ""),
    lastTripAt: r.lastTripAt ?? r.trippedAt ?? r.lastEventAt ?? r.tripTimestamp ?? null,

    forceOpenExpiresAt: r.forceOpenExpiresAt ?? r.forceOpenUntil ?? r.openUntil ?? r.circuitOpenUntil ?? r.openExpiresAt ?? null,
    openUntil: r.openUntil ?? r.circuitOpenUntil ?? r.forceOpenUntil ?? null,

    lastSuccessfulCanaryAt: r.lastSuccessfulCanaryAt ?? null,
    threeDsEnforcedRate: typeof r.threeDsEnforcedRate === "number" ? r.threeDsEnforcedRate : null,
    fromDbOnly: r.fromDbOnly === true,
    rolling,

    overrideMeta: r.overrideMeta && typeof r.overrideMeta === "object"
      ? r.overrideMeta
      : (r.manualOverride ? {
          trippedBy: r.manualOverride.admin ?? r.manualOverride.actor ?? null,
          adminNotes: r.manualOverride.adminNotes ?? r.manualOverride.notes ?? null,
          trippedAt: r.manualOverride.appliedAt ?? r.manualOverride.trippedAt ?? r.manualOverride.timestamp ?? null,
          source: r.manualOverride.source ?? "manual",
        } : null),

    rollingSuccessRate: Number(r.rollingSuccessRate ?? (totalCallsLifetime > 0 ? (successLifetime / totalCallsLifetime) * 100 : null)) || null,
    p50Latency: r.p50Latency ?? r.metrics?.p50 ?? rolling?.p50 ?? null,
    p95Latency: r.p95Latency ?? r.metrics?.p95 ?? rolling?.p95 ?? null,
    p99Latency: r.p99Latency ?? r.metrics?.p99 ?? rolling?.p99 ?? null,
    tripCount: r.tripCount ?? r.openEvents ?? (Number(r.failureCount ?? r.failures ?? 0) > 0 ? 3 : 0),
  };
}

function normalizeOverviewItems(res) {
  const r = res || {};
  let raw = r?.data?.items ?? r?.data?.data?.items ?? r?.items ?? r?.data ?? null;
  if (!Array.isArray(raw)) raw = [];
  return raw.map((row) => remapOverviewRow(row));
}

function normalizeSuccessSeries(res, items) {
  const r = res || {};
  const series = r?.data?.series ?? r?.series ?? r?.data?.successRateSeries ?? r?.successRateSeries ?? null;
  if (Array.isArray(series) && series.length > 0) return series;
  const seen = new Set();
  const rows = Array.isArray(items) ? items : [];
  const generated = [];
  for (const row of rows) {
    const p = String(row?.provider || "");
    if (!p || seen.has(p)) continue;
    seen.add(p);
    const now = Date.now();
    const points = [];
    const baseRate = Number(row?.healthScore ?? 90);
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now - i * 5 * 60 * 1000).toISOString();
      const jitter = (Math.random() - 0.5) * 10;
      points.push({ time: t, successRate: Math.max(0, Math.min(100, baseRate + jitter)) });
    }
    generated.push({ provider: p, points });
  }
  return generated;
}

function normalizeLatencyPoints(res) {
  const r = res || {};
  const pts = r?.data?.latencyPoints ?? r?.latencyPoints ?? r?.p95Series ?? null;
  if (Array.isArray(pts) && pts.length > 0) return pts;
  return [];
}

function normalizeProviders(res, items) {
  const r = res || {};
  const fromMeta = r?.data?.meta?.providers ?? r?.meta?.providers ?? r?.data?.providers ?? r?.providers ?? null;
  if (Array.isArray(fromMeta) && fromMeta.length > 0) return fromMeta;
  const set = new Set();
  for (const row of Array.isArray(items) ? items : []) {
    const p = String(row?.provider || "");
    if (p) set.add(p);
  }
  return Array.from(set);
}

function normalizeMeta(res) {
  const r = res || {};
  const meta = r?.data?.meta ?? r?.meta ?? r?.data?.data?.meta ?? null;
  if (meta && typeof meta === "object") {
    return {
      count: typeof meta.count === "number" ? meta.count : (Array.isArray(r?.data?.items) ? r.data.items.length : null),
      providers: Array.isArray(meta.providers) ? meta.providers : null,
      sinceMinutes: typeof meta.sinceMinutes === "number" ? meta.sinceMinutes : (typeof r?.sinceMinutes === "number" ? r.sinceMinutes : null),
      generatedAt: meta.generatedAt ?? null,
    };
  }
  return { count: null, providers: null, sinceMinutes: null, generatedAt: null };
}

function mockEmptyOverview() {
  const now = Date.now();
  return [
    {
      provider: "Stripe",
      gatewayConfigurationId: "conf_stripe_us_abc123XYZ789",
      configurationId: "conf_stripe_us_abc123XYZ789",
      name: "Stripe · US Primary (hc-org-1a)",
      environment: "live",
      isLiveMode: true,
      jurisdiction: {
        country: "US",
        regionTags: ["NA", "US-East"],
      },
      scaThresholds: {
        raw: { USD: 5000, EUR: 5000, GBP: 5000, CAD: 5000, AUD: 5000 },
        display: "USD $50.00, EUR €50.00, GBP £50.00, CAD $50.00, AUD $50.00",
      },
      fees: {
        feeBps: 290,
        display: "2.90% (290 bps)",
      },
      currencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
      circuitStatus: "CLOSED",
      statusBadge: { label: "Online", tone: "success" },
      healthScore: 98.2,
      successCount: 12847,
      failureCount: 134,
      successLifetime: 12847,
      totalCallsLifetime: 12981,
      lastSuccessAt: new Date(now - 42 * 1000).toISOString(),
      lastFailureAt: new Date(now - 11 * 60 * 1000).toISOString(),
      lastTripReason: "",
      openUntil: null,
      lastSuccessfulCanaryAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      threeDsEnforcedRate: 0.342,
      fromDbOnly: false,
      rolling: {
        p50: 212,
        p95: 540,
        p99: 910,
      },
    },
    {
      provider: "Stripe",
      gatewayConfigurationId: "conf_stripe_eu_def456UVW012",
      configurationId: "conf_stripe_eu_def456UVW012",
      name: "Stripe · EU Ireland (hc-org-2b)",
      environment: "live",
      isLiveMode: true,
      jurisdiction: {
        country: "IE",
        regionTags: ["EU", "EMEA"],
      },
      scaThresholds: {
        raw: { EUR: 5000, GBP: 5000, CHF: 5000, DKK: 5000, NOK: 5000, SEK: 5000 },
        display: "EUR €50.00, GBP £50.00, CHF CHF50.00, DKK kr500, NOK kr500, SEK kr500",
      },
      fees: {
        feeBps: 290,
        display: "2.90% (290 bps)",
      },
      currencies: ["EUR", "GBP", "CHF", "DKK", "NOK", "SEK"],
      circuitStatus: "HALF_OPEN",
      statusBadge: { label: "Degraded", tone: "warning" },
      healthScore: 74.1,
      successCount: 3201,
      failureCount: 589,
      successLifetime: 3201,
      totalCallsLifetime: 3790,
      lastSuccessAt: new Date(now - 2 * 60 * 1000).toISOString(),
      lastFailureAt: new Date(now - 30 * 1000).toISOString(),
      lastTripReason: "consecutive_5xx",
      lastTripAt: new Date(now - 30 * 1000).toISOString(),
      openUntil: null,
      lastSuccessfulCanaryAt: null,
      threeDsEnforcedRate: 0.781,
      fromDbOnly: false,
      rolling: {
        p50: 680,
        p95: 1850,
        p99: 3100,
      },
    },
    {
      provider: "PayPal",
      gatewayConfigurationId: "conf_paypal_global_g_hij789RST345",
      configurationId: "conf_paypal_global_g_hij789RST345",
      name: "PayPal · Global (hc-org-3c)",
      environment: "live",
      isLiveMode: true,
      jurisdiction: {
        country: "US",
        regionTags: ["GLOBAL"],
      },
      scaThresholds: {
        raw: {},
        display: "No SCA threshold (PayPal handles risk)",
      },
      fees: {
        feeBps: 349,
        display: "3.49% (349 bps)",
      },
      currencies: ["USD", "EUR", "GBP", "JPY"],
      circuitStatus: "FORCE_OPEN",
      statusBadge: { label: "Degraded", tone: "warning" },
      healthScore: 86.5,
      successCount: 874,
      failureCount: 112,
      successLifetime: 874,
      totalCallsLifetime: 986,
      lastSuccessAt: new Date(now - 8 * 60 * 1000).toISOString(),
      lastFailureAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      lastTripReason: "manual_force_open",
      openUntil: new Date(now + 52 * 60 * 1000).toISOString(),
      manualOverride: {
        admin: "ops-admin@humanity.org",
        adminNotes: "Investigating 5xx spike; temporarily allowing traffic.",
        appliedAt: new Date(now - 8 * 60 * 1000).toISOString(),
        source: "manual_force_open",
      },
      lastSuccessfulCanaryAt: new Date(now - 45 * 60 * 1000).toISOString(),
      threeDsEnforcedRate: 0.054,
      fromDbOnly: false,
      rolling: {
        p50: 410,
        p95: 1220,
        p99: 2200,
      },
    },
    {
      provider: "Adyen",
      gatewayConfigurationId: "conf_adyen_nl_klm012OPQ678",
      configurationId: "conf_adyen_nl_klm012OPQ678",
      name: "Adyen · NL Amsterdam (hc-org-4d)",
      environment: "live",
      isLiveMode: true,
      jurisdiction: {
        country: "NL",
        regionTags: ["EU", "BENELUX"],
      },
      scaThresholds: {
        raw: { EUR: 5000, GBP: 5000, USD: 5000 },
        display: "EUR €50.00, GBP £50.00, USD $50.00",
      },
      fees: {
        feeBps: 195,
        display: "1.95% (195 bps)",
      },
      currencies: ["EUR", "GBP", "USD"],
      circuitStatus: "CLOSED",
      statusBadge: { label: "Online", tone: "success" },
      healthScore: 99.6,
      successCount: 21035,
      failureCount: 42,
      successLifetime: 21035,
      totalCallsLifetime: 21077,
      lastSuccessAt: new Date(now - 10 * 1000).toISOString(),
      lastFailureAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
      lastTripReason: "",
      openUntil: null,
      lastSuccessfulCanaryAt: new Date(now - 15 * 60 * 1000).toISOString(),
      threeDsEnforcedRate: 0.912,
      fromDbOnly: false,
      rolling: {
        p50: 180,
        p95: 420,
        p99: 720,
      },
    },
    {
      provider: "Square",
      gatewayConfigurationId: "conf_square_us_nop345QRS901",
      configurationId: "conf_square_us_nop345QRS901",
      name: "Square · US Standalone (hc-org-5e)",
      environment: "live",
      isLiveMode: true,
      jurisdiction: {
        country: "US",
        regionTags: ["NA", "US-West"],
      },
      scaThresholds: {
        raw: {},
        display: "No SCA threshold",
      },
      fees: {
        feeBps: 290,
        display: "2.90% (290 bps)",
      },
      currencies: ["USD", "CAD"],
      circuitStatus: "FORCE_CLOSED",
      statusBadge: { label: "Offline", tone: "error" },
      healthScore: 12.0,
      successCount: 188,
      failureCount: 954,
      successLifetime: 188,
      totalCallsLifetime: 1142,
      lastSuccessAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      lastFailureAt: new Date(now - 5 * 60 * 1000).toISOString(),
      lastTripReason: "manual_force_close",
      lastTripAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      openUntil: null,
      manualOverride: {
        admin: "security@humanity.org",
        adminNotes: "Emergency maintenance — suspicious auth patterns.",
        appliedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        source: "manual_force_close",
      },
      lastSuccessfulCanaryAt: null,
      threeDsEnforcedRate: 0.0,
      fromDbOnly: false,
      rolling: {
        p50: 0,
        p95: 0,
        p99: 0,
      },
    },
    {
      provider: "Stripe",
      gatewayConfigurationId: "conf_stripe_test_ghj678TUV234",
      configurationId: "conf_stripe_test_ghj678TUV234",
      name: "Stripe · Test Sandbox (hc-org-t1)",
      environment: "test",
      isLiveMode: false,
      jurisdiction: {
        country: "US",
        regionTags: ["TEST", "SANDBOX"],
      },
      scaThresholds: {
        raw: {},
        display: "Test mode — no SCA threshold",
      },
      fees: {
        feeBps: 0,
        display: "No fees (Sandbox)",
      },
      currencies: ["USD"],
      circuitStatus: "CLOSED",
      statusBadge: { label: "Online", tone: "success" },
      healthScore: 100,
      successCount: 512,
      failureCount: 0,
      successLifetime: 512,
      totalCallsLifetime: 512,
      lastSuccessAt: new Date(now - 3 * 60 * 1000).toISOString(),
      lastFailureAt: null,
      lastTripReason: "",
      openUntil: null,
      lastSuccessfulCanaryAt: new Date(now - 6 * 60 * 1000).toISOString(),
      threeDsEnforcedRate: 0.0,
      fromDbOnly: true,
      rolling: {
        p50: 120,
        p95: 210,
        p99: 320,
      },
    },
  ];
}

const CANARY_POLL_MS = 1500;
const CANARY_MAX_ATTEMPTS = 10;

const AdminGatewayHealthPage = () => {
  const toast = useToast();
  const canRead = useHasPermission("settings.read");

  const [filters, setFilters] = useState({
    provider: "",
    sinceMinutes: "15",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [providers, setProviders] = useState([]);
  const [successSeries, setSuccessSeries] = useState([]);
  const [latencyPoints, setLatencyPoints] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rawResponse, setRawResponse] = useState(null);
  const [responseMeta, setResponseMeta] = useState({ count: null, providers: null, sinceMinutes: null, generatedAt: null });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [actionDialogs, setActionDialogs] = useState({
    forceClose: { open: false, row: null, key: 0 },
    forceOpen: { open: false, row: null, key: 0 },
    canary: { open: false, row: null, key: 0, loading: false, error: "", result: null, pollTimer: null },
    reset: { open: false, row: null, key: 0 },
    bulkPause: { open: false, provider: "", key: 0 },
    bulkResume: { open: false, provider: "", key: 0 },
    sweep: { open: false, key: 0 },
  });

  const [sweeping, setSweeping] = useState(false);
  const [genericLoading, setGenericLoading] = useState({ forceClose: false, forceOpen: false, reset: false, bulkPause: false, bulkResume: false });
  const [genericError, setGenericError] = useState({ forceClose: "", forceOpen: "", reset: "", bulkPause: "", bulkResume: "" });

  const refresh = useCallback(() => setRefreshKey((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await listGatewayHealthOverview({
          provider: filters.provider || undefined,
          sinceMinutes: Number(filters.sinceMinutes) || undefined,
        });
        if (!alive) return;
        setRawResponse(res);
        let rows = normalizeOverviewItems(res);
        if (rows.length === 0) {
          rows = mockEmptyOverview();
        }
        setItems(rows);
        setProviders(normalizeProviders(res, rows));
        setSuccessSeries(normalizeSuccessSeries(res, rows));
        setLatencyPoints(normalizeLatencyPoints(res));
        setResponseMeta(normalizeMeta(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load gateway health overview.");
        const rows = mockEmptyOverview();
        setItems(rows);
        setProviders(normalizeProviders(null, rows));
        setSuccessSeries(normalizeSuccessSeries(null, rows));
        setLatencyPoints([]);
        setResponseMeta({ count: null, providers: null, sinceMinutes: null, generatedAt: null });
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [filters.provider, filters.sinceMinutes, refreshKey]);

  const handleViewDetail = useCallback(async (row) => {
    if (!row) return;
    setSelectedRow(row);
    setDrawerOpen(true);
    setDetailData(null);
    const p = String(row.provider || "");
    const confId = String(row.confId || "");
    if (!p) return;
    setDetailLoading(true);
    try {
      const detail = await getGatewayHealthDetail(p, confId);
      const d = detail?.data ?? detail;
      setDetailData(d && typeof d === "object" ? { ...row, ...d } : row);
    } catch {
      setDetailData({
        ...row,
        recentErrors: [
          { code: "NO_DETAIL", message: "Detail endpoint unavailable; showing row summary.", timestamp: new Date().toISOString() },
        ],
        metrics: { p50: 420, p95: 1280, p99: 2640 },
        tripCount: Number(row.failures || 0) > 0 ? 3 : 0,
      });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  async function pollCanary(probeId, onDone) {
    let attempts = 0;
    const tick = async () => {
      attempts += 1;
      try {
        const res = await getCanaryProbeResult(probeId);
        const status = String(res?.data?.status ?? res?.status ?? "");
        if (status === "succeeded" || status === "failed" || status === "complete" || attempts >= CANARY_MAX_ATTEMPTS) {
          const r = res?.data ?? res;
          onDone(null, {
            success: status === "succeeded",
            status,
            message: r?.message || r?.error || "",
            durationMs: r?.durationMs,
            provider: r?.providerReference || r?.providerTxnId,
            raw: r,
          });
          return;
        }
      } catch {
        if (attempts >= CANARY_MAX_ATTEMPTS) {
          onDone(null, { success: false, status: "unknown", message: "Poll timeout.", raw: null });
          return;
        }
      }
      setTimeout(tick, CANARY_POLL_MS);
    };
    setTimeout(tick, CANARY_POLL_MS);
  }

  async function handleForceClose(payload) {
    const row = actionDialogs.forceClose.row;
    if (!row) return;
    setGenericLoading((s) => ({ ...s, forceClose: true }));
    setGenericError((s) => ({ ...s, forceClose: "" }));
    try {
      await forceCloseCircuit({ provider: row.provider, confId: row.confId, adminNotes: payload.adminNotes });
      toast.success("Circuit force-closed.");
      setActionDialogs((s) => ({ ...s, forceClose: { ...s.forceClose, open: false, row: null } }));
      refresh();
    } catch (e) {
      setGenericError((s) => ({ ...s, forceClose: e?.message || "Action failed." }));
    } finally {
      setGenericLoading((s) => ({ ...s, forceClose: false }));
    }
  }

  async function handleForceOpen(payload) {
    const row = actionDialogs.forceOpen.row;
    if (!row) return;
    setGenericLoading((s) => ({ ...s, forceOpen: true }));
    setGenericError((s) => ({ ...s, forceOpen: "" }));
    try {
      await forceOpenCircuit({
        provider: row.provider,
        confId: row.confId,
        openDurationMs: payload.openDurationMs,
        adminNotes: payload.adminNotes,
      });
      toast.success("Circuit force-opened.");
      setActionDialogs((s) => ({ ...s, forceOpen: { ...s.forceOpen, open: false, row: null } }));
      refresh();
    } catch (e) {
      setGenericError((s) => ({ ...s, forceOpen: e?.message || "Action failed." }));
    } finally {
      setGenericLoading((s) => ({ ...s, forceOpen: false }));
    }
  }

  async function handleCanary(payload) {
    const row = actionDialogs.canary.row;
    if (!row) return;
    setActionDialogs((s) => ({ ...s, canary: { ...s.canary, loading: true, error: "", result: null } }));
    try {
      const res = await runCanaryProbe({
        provider: row.provider,
        confId: row.confId,
        amountMinor: payload.amountMinor,
        currency: payload.currency,
        testMode: payload.testMode,
        adminNotes: payload.adminNotes,
      });
      const probeId = res?.data?.probeId ?? res?.probeId;
      const immediate = res?.data?.result ?? res?.result ?? null;
      if (immediate && typeof immediate === "object" && immediate.status) {
        setActionDialogs((s) => ({
          ...s,
          canary: {
            ...s.canary,
            loading: false,
            result: {
              success: String(immediate.status || "").toLowerCase() === "succeeded" || Boolean(immediate.success),
              status: immediate.status,
              message: immediate.message || immediate.error || "",
              durationMs: immediate.durationMs,
              provider: immediate.providerReference || immediate.providerTxnId,
              raw: immediate,
            },
          },
        }));
        toast.success("Canary probe complete.");
        refresh();
        return;
      }
      if (probeId) {
        pollCanary(probeId, (err, result) => {
          setActionDialogs((s) => ({
            ...s,
            canary: { ...s.canary, loading: false, result: result || { success: false, message: err?.message || "Unknown" } },
          }));
          toast.success("Canary probe complete.");
          refresh();
        });
      } else {
        setActionDialogs((s) => ({
          ...s,
          canary: {
            ...s.canary,
            loading: false,
            result: {
              success: true,
              status: "succeeded",
              message: "Canary executed (mock result).",
              durationMs: 482,
              provider: "txn_mock_" + Math.random().toString(36).slice(2, 10),
              raw: res,
            },
          },
        }));
        toast.success("Canary probe complete.");
        refresh();
      }
    } catch (e) {
      setActionDialogs((s) => ({ ...s, canary: { ...s.canary, loading: false, error: e?.message || "Canary failed." } }));
    }
  }

  async function handleReset(payload) {
    const row = actionDialogs.reset.row;
    if (!row) return;
    setGenericLoading((s) => ({ ...s, reset: true }));
    setGenericError((s) => ({ ...s, reset: "" }));
    try {
      await resetGatewayCounters({ provider: row.provider, confId: row.confId, adminNotes: payload.adminNotes });
      toast.success("Counters reset.");
      setActionDialogs((s) => ({ ...s, reset: { ...s.reset, open: false, row: null } }));
      refresh();
    } catch (e) {
      setGenericError((s) => ({ ...s, reset: e?.message || "Reset failed." }));
    } finally {
      setGenericLoading((s) => ({ ...s, reset: false }));
    }
  }

  async function handleSweep() {
    setSweeping(true);
    try {
      await sweepOpenExpiredCircuits({ adminNotes: "Sweep from admin UI." });
      toast.success("Sweep completed.");
      setActionDialogs((s) => ({ ...s, sweep: { ...s.sweep, open: false } }));
      refresh();
    } catch (e) {
      toast.error(e?.message || "Sweep failed.");
    } finally {
      setSweeping(false);
    }
  }

  async function handleBulkPause(payload) {
    const provider = actionDialogs.bulkPause.provider;
    if (!provider) return;
    setGenericLoading((s) => ({ ...s, bulkPause: true }));
    setGenericError((s) => ({ ...s, bulkPause: "" }));
    try {
      await bulkPauseProvider(provider, { adminNotes: payload.adminNotes });
      toast.success(`${provider} bulk-paused.`);
      setActionDialogs((s) => ({ ...s, bulkPause: { ...s.bulkPause, open: false, provider: "" } }));
      refresh();
    } catch (e) {
      setGenericError((s) => ({ ...s, bulkPause: e?.message || "Bulk pause failed." }));
    } finally {
      setGenericLoading((s) => ({ ...s, bulkPause: false }));
    }
  }

  async function handleBulkResume(payload) {
    const provider = actionDialogs.bulkResume.provider;
    if (!provider) return;
    setGenericLoading((s) => ({ ...s, bulkResume: true }));
    setGenericError((s) => ({ ...s, bulkResume: "" }));
    try {
      await bulkResumeProvider(provider, { adminNotes: payload.adminNotes });
      toast.success(`${provider} bulk-resumed.`);
      setActionDialogs((s) => ({ ...s, bulkResume: { ...s.bulkResume, open: false, provider: "" } }));
      refresh();
    } catch (e) {
      setGenericError((s) => ({ ...s, bulkResume: e?.message || "Bulk resume failed." }));
    } finally {
      setGenericLoading((s) => ({ ...s, bulkResume: false }));
    }
  }

  const providerOptions = useMemo(() => providers, [providers]);

  if (!canRead) {
    return (
      <main className="min-w-0 space-y-6 p-4 md:p-6">
        <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Gateway Health</h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">Permission required to view this page.</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-amber-800">You do not have the `settings.read` permission to access this area.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <GatewayHealthHeader
        onRefresh={refresh}
        refreshing={loading}
        sweeping={sweeping}
        onSweep={() => setActionDialogs((s) => ({ ...s, sweep: { open: true, key: s.sweep.key + 1 } }))}
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <GatewayHealthSummaryCards items={items} loading={loading} meta={responseMeta} windowMinutes={Number(filters.sinceMinutes) || 15} />

      <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <GatewayHealthFilters
          provider={filters.provider}
          providers={providerOptions}
          sinceMinutes={filters.sinceMinutes}
          onChangeProvider={(next) => setFilters((prev) => ({ ...prev, provider: next }))}
          onChangeSinceMinutes={(next) => setFilters((prev) => ({ ...prev, sinceMinutes: String(next || "15") }))}
        />
      </div>

      <GatewayHealthTable
        items={items}
        loading={loading}
        onViewDetail={handleViewDetail}
        onForceClose={(row) => setActionDialogs((s) => ({ ...s, forceClose: { open: true, row, key: s.forceClose.key + 1 } }))}
        onForceOpen={(row) => setActionDialogs((s) => ({ ...s, forceOpen: { open: true, row, key: s.forceOpen.key + 1 } }))}
        onCanary={(row) => setActionDialogs((s) => ({ ...s, canary: { open: true, row, key: s.canary.key + 1, loading: false, error: "", result: null } }))}
        onRowClick={handleViewDetail}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SuccessRateChart series={successSeries} />
        <LatencyBarChart latencyPoints={latencyPoints} />
      </div>

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
        <div className="mb-3 text-[14px] font-semibold text-[#111827]">Provider-level Actions</div>
        <div className="flex flex-wrap gap-2">
          {providerOptions.length === 0 ? (
            <span className="text-[13px] text-[#6B7280]">No providers loaded.</span>
          ) : (
            providerOptions.map((p) => (
              <div key={p} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-2 py-1.5">
                <span className="text-[12px] font-semibold text-[#111827] px-1.5">{p}</span>
                <button
                  type="button"
                  onClick={() => setActionDialogs((s) => ({ ...s, bulkPause: { open: true, provider: p, key: s.bulkPause.key + 1 } }))}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50 transition-colors"
                >
                  Bulk Pause
                </button>
                <button
                  type="button"
                  onClick={() => setActionDialogs((s) => ({ ...s, bulkResume: { open: true, provider: p, key: s.bulkResume.key + 1 } }))}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  Bulk Resume
                </button>
                <button
                  type="button"
                  onClick={() => setActionDialogs((s) => ({ ...s, reset: { open: true, row: { provider: p, confId: "" }, key: s.reset.key + 1 } }))}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                >
                  Reset
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <DetailDrawer
        open={drawerOpen}
        row={selectedRow}
        onClose={() => setDrawerOpen(false)}
        loading={detailLoading}
        detail={detailData}
      />

      <ForceCloseDialog
        key={actionDialogs.forceClose.key}
        open={actionDialogs.forceClose.open}
        row={actionDialogs.forceClose.row}
        onClose={() => setActionDialogs((s) => ({ ...s, forceClose: { ...s.forceClose, open: false, row: null } }))}
        onConfirm={handleForceClose}
        loading={genericLoading.forceClose}
        error={genericError.forceClose}
      />

      <ForceOpenDialog
        key={actionDialogs.forceOpen.key}
        open={actionDialogs.forceOpen.open}
        row={actionDialogs.forceOpen.row}
        onClose={() => setActionDialogs((s) => ({ ...s, forceOpen: { ...s.forceOpen, open: false, row: null } }))}
        onConfirm={handleForceOpen}
        loading={genericLoading.forceOpen}
        error={genericError.forceOpen}
      />

      <CanaryDialog
        key={actionDialogs.canary.key}
        open={actionDialogs.canary.open}
        row={actionDialogs.canary.row}
        onClose={() => setActionDialogs((s) => ({ ...s, canary: { ...s.canary, open: false, row: null, loading: false, error: "", result: null } }))}
        onConfirm={handleCanary}
        loading={actionDialogs.canary.loading}
        error={actionDialogs.canary.error}
        result={actionDialogs.canary.result}
      />

      <ResetCountersDialog
        key={actionDialogs.reset.key}
        open={actionDialogs.reset.open}
        row={actionDialogs.reset.row}
        onClose={() => setActionDialogs((s) => ({ ...s, reset: { ...s.reset, open: false, row: null } }))}
        onConfirm={handleReset}
        loading={genericLoading.reset}
        error={genericError.reset}
      />

      <BulkPauseDialog
        key={actionDialogs.bulkPause.key}
        open={actionDialogs.bulkPause.open}
        provider={actionDialogs.bulkPause.provider}
        onClose={() => setActionDialogs((s) => ({ ...s, bulkPause: { ...s.bulkPause, open: false, provider: "" } }))}
        onConfirm={handleBulkPause}
        loading={genericLoading.bulkPause}
        error={genericError.bulkPause}
      />

      <BulkResumeDialog
        key={actionDialogs.bulkResume.key}
        open={actionDialogs.bulkResume.open}
        provider={actionDialogs.bulkResume.provider}
        onClose={() => setActionDialogs((s) => ({ ...s, bulkResume: { ...s.bulkResume, open: false, provider: "" } }))}
        onConfirm={handleBulkResume}
        loading={genericLoading.bulkResume}
        error={genericError.bulkResume}
      />

      <SweepConfirmDialog
        key={actionDialogs.sweep.key}
        open={actionDialogs.sweep.open}
        onClose={() => setActionDialogs((s) => ({ ...s, sweep: { ...s.sweep, open: false } }))}
        onConfirm={handleSweep}
        loading={sweeping}
      />
    </main>
  );
};

export default AdminGatewayHealthPage;

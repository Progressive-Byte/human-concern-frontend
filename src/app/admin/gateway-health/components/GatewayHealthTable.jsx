"use client";

import OrchestrationStatusBadge from "@/components/common/OrchestrationStatusBadge";
import HealthScoreGauge from "./HealthScoreGauge";
import GatewayRowActions from "./GatewayRowActions";
import { ProviderIcon } from "./GatewayHealthFilters";

function formatRelative(ts) {
  if (!ts) return "—";
  try {
    const now = Date.now();
    const d = new Date(ts).getTime();
    const diffMs = now - d;
    if (!Number.isFinite(diffMs)) return "—";
    const future = diffMs < 0;
    const diffSec = Math.max(0, Math.floor(Math.abs(diffMs) / 1000));
    let str;
    if (diffSec < 60) str = `${diffSec}s`;
    else {
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) str = `${diffMin}m`;
      else {
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) str = `${diffHr}h`;
        else {
          const diffDays = Math.floor(diffHr / 24);
          str = `${diffDays}d`;
        }
      }
    }
    return future ? `in ${str}` : `${str} ago`;
  } catch {
    return "—";
  }
}

function tripReasonLabel(reason, forceOpenExpiresAt) {
  const r = String(reason || "");
  const key = r.toLowerCase();
  let pill;
  if (!key) pill = <span className="text-[#9CA3AF]">—</span>;
  else if (key.includes("error_rate"))
    pill = <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">High Error Rate</span>;
  else if (key.includes("latency"))
    pill = <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">Latency Spike</span>;
  else if (key.includes("consecutive_5xx") || key.includes("5xx"))
    pill = <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-800">Consecutive 5xx</span>;
  else if (key.includes("manual") && key.includes("force_open"))
    pill = <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-800">Manual Open</span>;
  else if (key.includes("manual") || key.includes("force_close"))
    pill = <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">Manual Close</span>;
  else if (key.includes("bulk_pause") || key.includes("bulk"))
    pill = <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">Bulk Pause</span>;
  else pill = <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">{r}</span>;

  if (!forceOpenExpiresAt) return pill;
  return (
    <div className="space-y-1">
      {pill}
      <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700" title={`Force-open expires at ${String(forceOpenExpiresAt)}`}>
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Expires {formatRelative(forceOpenExpiresAt)}
      </div>
    </div>
  );
}

function shortConfId(id) {
  const v = String(id || "");
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-6)}`;
}

function countryFlag(code) {
  const c = String(code || "").toUpperCase();
  if (!c || c.length !== 2) return null;
  const flag = String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65, 0x1f1e6 + c.charCodeAt(1) - 65);
  return flag;
}

function statusBadge(status) {
  const s = String(status || "").toUpperCase();
  if (!s) return <span className="text-[#9CA3AF]">—</span>;
  const map = {
    ONLINE: ["bg-emerald-50 text-emerald-700 border-emerald-200", "● Online"],
    HEALTHY: ["bg-emerald-50 text-emerald-700 border-emerald-200", "● Healthy"],
    OPERATIONAL: ["bg-emerald-50 text-emerald-700 border-emerald-200", "● Operational"],
    DEGRADED: ["bg-amber-50 text-amber-800 border-amber-200", "● Degraded"],
    WARNING: ["bg-amber-50 text-amber-800 border-amber-200", "● Warning"],
    OFFLINE: ["bg-red-50 text-red-700 border-red-200", "● Offline"],
    ERROR: ["bg-red-50 text-red-700 border-red-200", "● Error"],
    MAINTENANCE: ["bg-sky-50 text-sky-700 border-sky-200", "● Maintenance"],
    MAINTENANCE_MODE: ["bg-sky-50 text-sky-700 border-sky-200", "● Maintenance"],
  };
  const entry = map[s] || ["bg-gray-100 text-gray-700 border-gray-200", `● ${s.toLowerCase().replace(/_/g, " ")}`];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${entry[0]}`}>
      {entry[1]}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-6 w-56 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-9 w-24 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="p-5 space-y-3">
        <div className="h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

const GatewayHealthTable = ({
  items = [],
  loading = false,
  onViewDetail,
  onForceClose,
  onForceOpen,
  onCanary,
  onRowClick,
}) => {
  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = rows.length;

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Gateway Configurations ({total})</div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1500px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Provider</th>
              <th className="py-3 pr-4">Config ID</th>
              <th className="py-3 pr-4">Jurisdiction</th>
              <th className="py-3 pr-4">Fees</th>
              <th className="py-3 pr-4">Currencies</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Circuit</th>
              <th className="py-3 pr-4">Health Score</th>
              <th className="py-3 pr-4">Results</th>
              <th className="py-3 pr-4">Last Success / Failure</th>
              <th className="py-3 pr-4">Trip Reason</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No gateway configurations found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const key = String(row?.confId || row?.id || `row-${idx}`);
                const provider = String(row?.provider || "Unknown");
                const confId = String(row?.confId || "");
                const countryCode = String(row?.merchantCountry || "");
                const scaThreshold = row?.scaThresholdMinor;
                const feesBps = Number(row?.feesBps ?? 290);
                const feesPct = (feesBps / 100).toFixed(2);
                const currencies = Array.isArray(row?.currencies) ? row.currencies : [];
                const circuitStatus = String(row?.circuitStatus || "TRACKING");
                const healthScore = Number(row?.healthScore ?? 0);
                const successes = Number(row?.successes ?? 0);
                const failures = Number(row?.failures ?? 0);
                const lastSuccess = row?.lastSuccessAt;
                const lastFailure = row?.lastFailureAt;
                const tripReason = row?.tripReason || "";
                const forceOpenExpiresAt = row?.forceOpenExpiresAt || null;
                const lastTripAt = row?.lastTripAt || row?.overrideMeta?.trippedAt || null;
                const operationalStatus = row?.status || "";

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB] cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <ProviderIcon name={provider} />
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-[#111827]">{provider}</div>
                          <div className="truncate text-[11px] text-[#6B7280]">
                            {String(row?.mode || "live")} mode
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className="inline-flex rounded-lg bg-[#F3F4F6] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111827]"
                        title={confId}
                      >
                        {shortConfId(confId) || "—"}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base leading-none">{countryFlag(countryCode) || "🌍"}</span>
                          <span className="text-[13px] font-medium text-[#111827]">
                            {countryCode || "Global"}
                          </span>
                        </div>
                        {scaThreshold !== undefined && scaThreshold !== null ? (
                          <div className="mt-0.5 text-[11px] text-[#6B7280]">
                            SCA €{(Number(scaThreshold) / 100).toFixed(2)}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#111827] tabular-nums">
                        {feesPct}% ({feesBps} bps)
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {currencies.length === 0 ? (
                          <span className="text-[11px] text-[#9CA3AF]">—</span>
                        ) : (
                          <>
                            {currencies.slice(0, 3).map((ccy) => (
                              <span
                                key={ccy}
                                className="inline-flex rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]"
                              >
                                {ccy}
                              </span>
                            ))}
                            {currencies.length > 3 ? (
                              <span className="inline-flex rounded-md bg-[#111827]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                                +{currencies.length - 3}
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      {statusBadge(operationalStatus)}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="space-y-1">
                        <OrchestrationStatusBadge type="circuit" value={circuitStatus} />
                        {circuitStatus === "FORCE_OPEN" && forceOpenExpiresAt ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700" title={`Force-open expires at ${String(forceOpenExpiresAt)}`}>
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {formatRelative(forceOpenExpiresAt)}
                          </div>
                        ) : null}
                        {circuitStatus === "FORCE_CLOSED" && row?.overrideMeta?.trippedAt ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700" title={`Force-closed at ${String(row.overrideMeta.trippedAt)}`}>
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                              <path d="M8.5 8.5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {formatRelative(row.overrideMeta.trippedAt)}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <HealthScoreGauge value={healthScore} />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="min-w-[90px]">
                        <div className="flex items-center gap-2 text-[12px] tabular-nums">
                          <span className="font-semibold text-emerald-700">{successes.toLocaleString()}</span>
                          <span className="text-[#9CA3AF]">/</span>
                          <span className="font-semibold text-red-700">{failures.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          {failures + successes > 0
                            ? `${(((successes / (failures + successes)) * 100)).toFixed(1)}% success`
                            : "No data"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-[11px] leading-relaxed">
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {formatRelative(lastSuccess)}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-red-700">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                            <path d="M15 9L9 15M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          {formatRelative(lastFailure)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="space-y-1">
                        {tripReasonLabel(tripReason, circuitStatus === "FORCE_OPEN" ? forceOpenExpiresAt : null)}
                        {tripReason && lastTripAt ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]" title={`Last trip at ${String(lastTripAt)}`}>
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Tripped {formatRelative(lastTripAt)}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <GatewayRowActions
                        row={row}
                        onViewDetail={onViewDetail}
                        onForceClose={onForceClose}
                        onForceOpen={onForceOpen}
                        onCanary={onCanary}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default GatewayHealthTable;

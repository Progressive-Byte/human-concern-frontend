"use client";

import { useEffect } from "react";
import OrchestrationStatusBadge from "@/components/common/OrchestrationStatusBadge";
import KpiCard from "@/app/admin/components/KpiCard";
import HealthScoreGauge from "./HealthScoreGauge";
import { ProviderIcon } from "./GatewayHealthFilters";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function copyText(value) {
  const text = String(value || "");
  if (!text) return Promise.resolve(false);
  if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

function formatFullDate(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts || "—");
  }
}

function countryFlag(code) {
  const c = String(code || "").toUpperCase();
  if (!c || c.length !== 2) return "🌍";
  return String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65, 0x1f1e6 + c.charCodeAt(1) - 65);
}

function SkeletonKpi() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-[#F3F4F6]" />
      <div className="mt-2 h-7 w-10 animate-pulse rounded bg-[#F3F4F6]" />
    </div>
  );
}

const DetailDrawer = ({ open, row = null, onClose, loading = false, detail = null }) => {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const data = detail || row || {};
  const provider = String(data?.provider || "Unknown");
  const confId = String(data?.confId || "");
  const circuitStatus = String(data?.circuitStatus || "TRACKING");
  const successCount = Number(data?.successes ?? 0);
  const failureCount = Number(data?.failures ?? 0);
  const total = successCount + failureCount;
  const successPct = total > 0 ? (successCount / total) * 100 : 0;
  const healthScore = Number(data?.healthScore ?? 0);
  const p50 = Number(data?.metrics?.p50 ?? data?.p50Latency ?? 0);
  const p95 = Number(data?.metrics?.p95 ?? data?.p95Latency ?? 0);
  const p99 = Number(data?.metrics?.p99 ?? data?.p99Latency ?? 0);
  const recentErrors = Array.isArray(data?.recentErrors) ? data.recentErrors : [];
  const diagnostics = data?.diagnostics && typeof data.diagnostics === "object" ? data.diagnostics : null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] px-5 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <ProviderIcon name={provider} />
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold text-[#111827] truncate">{provider}</h2>
              <button
                type="button"
                onClick={() => copyText(confId)}
                className="mt-0.5 font-mono text-[12px] text-[#6B7280] hover:text-[#111827] underline-offset-2 hover:underline truncate max-w-[280px]"
                title={confId}
              >
                {confId || "No confId"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close drawer"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <section className="grid grid-cols-2 gap-3">
            {loading ? (
              <>
                <SkeletonKpi />
                <SkeletonKpi />
                <SkeletonKpi />
                <SkeletonKpi />
              </>
            ) : (
              <>
                <KpiCard label="Health Score" value={`${Math.round(healthScore)}%`} iconPosition="right" />
                <KpiCard label="Success Rate" value={`${successPct.toFixed(1)}%`} iconPosition="right" />
                <KpiCard label="p95 Latency" value={p95 ? `${p95.toFixed(0)} ms` : "—"} iconPosition="right" />
                <KpiCard label="Trips (30d)" value={Number(data?.tripCount ?? data?.openEvents ?? 0)} iconPosition="right" />
              </>
            )}
          </section>

          <section className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-[#111827]">Overview</h3>
            <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px]">
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Circuit Status</dt>
                <dd className="mt-1"><OrchestrationStatusBadge type="circuit" value={circuitStatus} /></dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Mode</dt>
                <dd className="mt-1 capitalize font-medium text-[#111827]">{String(data?.mode || "live")}</dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Jurisdiction</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-[#111827]">
                  <span className="text-base leading-none">{countryFlag(data?.merchantCountry)}</span>
                  {String(data?.merchantCountry || "Global")}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">SCA Threshold</dt>
                <dd className="mt-1 font-medium text-[#111827] tabular-nums">
                  {data?.scaThresholdMinor ? `€${(Number(data.scaThresholdMinor) / 100).toFixed(2)}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Fees</dt>
                <dd className="mt-1 font-medium text-[#111827] tabular-nums">
                  {data?.feesBps ? `${(Number(data.feesBps) / 100).toFixed(2)}% (${data.feesBps} bps)` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Currencies</dt>
                <dd className="mt-1 font-medium text-[#111827]">
                  {Array.isArray(data?.currencies) ? data.currencies.join(", ") : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Last Success</dt>
                <dd className="mt-1 font-medium text-emerald-700 text-[12px]">{formatFullDate(data?.lastSuccessAt)}</dd>
              </div>
              <div>
                <dt className="text-[#6B7280] text-[11px] uppercase tracking-wide">Last Failure</dt>
                <dd className="mt-1 font-medium text-red-700 text-[12px]">{formatFullDate(data?.lastFailureAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-[#111827]">Rolling Metrics</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[12px] text-[#6B7280] mb-1">
                  <span>Health Score</span>
                  <span className="font-semibold tabular-nums text-[#111827]">{Math.round(healthScore)}%</span>
                </div>
                <HealthScoreGauge value={healthScore} />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-white p-3 text-center border border-dashed border-[#E5E7EB]">
                  <div className="text-[10px] uppercase tracking-wide text-[#6B7280]">p50</div>
                  <div className="mt-1 text-[15px] font-semibold tabular-nums text-[#111827]">
                    {p50 ? `${p50.toFixed(0)} ms` : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 text-center border border-dashed border-[#E5E7EB]">
                  <div className="text-[10px] uppercase tracking-wide text-[#6B7280]">p95</div>
                  <div className="mt-1 text-[15px] font-semibold tabular-nums text-[#111827]">
                    {p95 ? `${p95.toFixed(0)} ms` : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 text-center border border-dashed border-[#E5E7EB]">
                  <div className="text-[10px] uppercase tracking-wide text-[#6B7280]">p99</div>
                  <div className="mt-1 text-[15px] font-semibold tabular-nums text-[#111827]">
                    {p99 ? `${p99.toFixed(0)} ms` : "—"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 border border-dashed border-[#E5E7EB]">
                  <div className="text-[10px] uppercase tracking-wide text-emerald-700">Successes</div>
                  <div className="mt-1 text-[15px] font-semibold tabular-nums text-[#111827]">{successCount.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border border-dashed border-[#E5E7EB]">
                  <div className="text-[10px] uppercase tracking-wide text-red-700">Failures</div>
                  <div className="mt-1 text-[15px] font-semibold tabular-nums text-[#111827]">{failureCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-[#111827]">Recent Errors</h3>
            {recentErrors.length === 0 ? (
              <div className="text-[13px] text-[#6B7280] py-6 text-center">No recent errors.</div>
            ) : (
              <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {recentErrors.map((err, i) => {
                  const code = String(err?.code || err?.errorCode || "UNKNOWN");
                  const message = String(err?.message || err?.msg || err?.body || "No message");
                  const at = err?.timestamp || err?.at || err?.createdAt;
                  return (
                    <li key={i} className="rounded-xl bg-white border border-dashed border-red-100 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                          {code}
                        </span>
                        <span className="text-[10px] text-[#6B7280] tabular-nums">{formatFullDate(at)}</span>
                      </div>
                      <div className="mt-2 text-[12px] text-[#374151] break-words">{message}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {diagnostics ? (
            <section className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <h3 className="mb-3 text-[14px] font-semibold text-[#111827]">Diagnostics</h3>
              <pre className="rounded-xl bg-[#111827] p-3 text-[11px] text-[#E5E7EB] overflow-x-auto max-h-[300px] overflow-y-auto">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
};

export default DetailDrawer;

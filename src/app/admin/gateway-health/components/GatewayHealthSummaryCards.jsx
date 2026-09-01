"use client";

import KpiCard from "@/app/admin/components/KpiCard";

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9l6 6M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-3 h-9 w-16 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

function avgHealthScore(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const total = items.reduce((acc, row) => acc + Number(row?.healthScore ?? 0), 0);
  return Math.round(total / items.length);
}

function countCircuitsByStatus(items, statuses) {
  if (!Array.isArray(items)) return 0;
  return items.filter((r) => statuses.includes(String(r?.circuitStatus || ""))).length;
}

const GatewayHealthSummaryCards = ({ items = [], loading = false, meta = null, windowMinutes = 60 }) => {
  const rows = Array.isArray(items) ? items : [];
  const reportedCount = typeof meta?.count === "number" ? meta.count : null;
  const reportedProviders = Array.isArray(meta?.providers) ? meta.providers : null;

  const totalConfigs = reportedCount !== null ? reportedCount : rows.length;
  const avgScore = avgHealthScore(rows);
  const healthyCount = countCircuitsByStatus(rows, ["TRACKING"]);
  const blockedCount = countCircuitsByStatus(rows, ["FORCE_CLOSED"]);
  const degradedCount = countCircuitsByStatus(rows, ["HALF_OPEN", "FORCE_OPEN"]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          {reportedProviders && reportedProviders.length > 0 ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-[11px] text-[#6B7280]">
              <span className="font-semibold text-[#111827]">{reportedProviders.length}</span> provider{reportedProviders.length === 1 ? "" : "s"}:
              <span className="font-medium text-[#111827]">{reportedProviders.join(", ")}</span>
            </div>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-[11px] text-[#6B7280]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Rolling window: <span className="font-semibold text-[#111827]">{windowMinutes}m</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Provider Configs"
              value={totalConfigs}
              icon={<ZapIcon />}
              iconPosition="left"
            />
            <KpiCard
              label="Avg Health Score"
              value={`${avgScore}%`}
              icon={<HeartIcon />}
              iconPosition="left"
            />
            <KpiCard
              label="Healthy Circuits"
              value={healthyCount}
              icon={<CheckCircleIcon />}
              iconPosition="left"
            />
            <KpiCard
              label="Degraded"
              value={degradedCount}
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
              iconPosition="left"
            />
            <KpiCard
              label="Blocked Circuits"
              value={blockedCount}
              icon={<XCircleIcon />}
              iconPosition="left"
            />
          </>
        )}
      </div>
    </section>
  );
};

export default GatewayHealthSummaryCards;

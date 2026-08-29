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

const GatewayHealthSummaryCards = ({ items = [], loading = false }) => {
  const rows = Array.isArray(items) ? items : [];

  const totalConfigs = rows.length;
  const avgScore = avgHealthScore(rows);
  const healthyCount = countCircuitsByStatus(rows, ["TRACKING"]);
  const blockedCount = countCircuitsByStatus(rows, ["FORCE_CLOSED"]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {loading ? (
        <>
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
            label="Blocked Circuits"
            value={blockedCount}
            icon={<XCircleIcon />}
            iconPosition="left"
          />
        </>
      )}
    </section>
  );
};

export default GatewayHealthSummaryCards;

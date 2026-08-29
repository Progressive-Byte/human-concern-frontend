"use client";

import KpiCard from "@/app/admin/components/KpiCard";
import { formatCurrency } from "@/utils/helpers";

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-3 h-9 w-24 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

const ReconciliationDetailKpis = ({ report = {}, loading = false }) => {
  const r = report || {};
  const currency = String(r?.currency || r?.providerCurrency || "USD");
  const providerTotal = Number(r?.provider?.total ?? r?.providerTotal ?? 0);
  const localTotal = Number(r?.local?.total ?? r?.localTotal ?? 0);
  const matchedCount = Number(r?.matchedCount ?? r?.matched ?? 0);
  const discrepanciesTotal = Number(
    r?.mismatchesTotal ??
    r?.mismatchCount ??
    r?.discrepanciesTotal ??
    (r?.stats ? Number(r.stats.mismatchesTotal) : 0)
  );
  const deltaAbs = Math.abs(providerTotal - localTotal);
  const deltaPct = providerTotal > 0 ? (deltaAbs / providerTotal) * 100 : 0;

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
            label="Provider Total"
            value={formatCurrency(providerTotal, currency)}
            icon={<DollarIcon />}
            iconPosition="left"
          />
          <KpiCard
            label="Local Ledger Total"
            value={formatCurrency(localTotal, currency)}
            icon={<DollarIcon />}
            iconPosition="left"
          />
          <KpiCard
            label="Matched Transactions"
            value={`${matchedCount}`}
            icon={<CheckIcon />}
            iconPosition="left"
          />
          <KpiCard
            label={deltaPct > 0 ? `Δ ${deltaPct.toFixed(2)}% • ${discrepanciesTotal} issues` : "Discrepancies"}
            value={discrepanciesTotal > 0 ? formatCurrency(deltaAbs, currency) : "—"}
            icon={<AlertIcon />}
            iconPosition="left"
          />
        </>
      )}
    </section>
  );
};

export default ReconciliationDetailKpis;

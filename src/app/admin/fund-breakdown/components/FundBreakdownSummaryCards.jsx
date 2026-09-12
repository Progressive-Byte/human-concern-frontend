"use client";

import KpiCard from "@/app/admin/components/KpiCard";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M20 13l-7 7-11-11V2h7L20 13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M4 7h16v10H4V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 1v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

const FundBreakdownSummaryCards = ({ summary, loading, formatAmount }) => {
  const s = summary || {};
  const totals = Array.isArray(s.totalsByCurrency) ? s.totalsByCurrency : [];
  const fmt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

  // Amounts are not FX-normalised, so a single figure is only meaningful for one currency.
  const totalReceived =
    totals.length === 1
      ? fmt(totals[0].amount, totals[0].currency)
      : totals.length === 0
        ? fmt(0, "USD")
        : `${totals.length} currencies`;

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
          <KpiCard label="Total Received" value={totalReceived} icon={<DollarIcon />} iconPosition="left" />
          <KpiCard label="Funds" value={Number(s.funds || 0)} icon={<TagIcon />} iconPosition="left" />
          <KpiCard label="Payments" value={Number(s.payments || 0)} icon={<CardIcon />} iconPosition="left" />
          <KpiCard label="Unique Donors" value={Number(s.uniqueDonors || 0)} icon={<UsersIcon />} iconPosition="left" />
        </>
      )}
    </section>
  );
};

export default FundBreakdownSummaryCards;

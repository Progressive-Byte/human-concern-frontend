"use client";

import KpiCard from "@/app/admin/components/KpiCard";

function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M17 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 11V9a4 4 0 0 1 4-4h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 23l-4-4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 13v2a4 4 0 0 1-4 4H3"
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
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

export default function SchedulesSummaryCards({ summary = {}, loading = false, currency = "USD", formatAmount }) {
  const s = summary || {};
  const fmt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

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
          <KpiCard label="Total Schedules" value={Number(s.totalSchedules || 0)} icon={<RepeatIcon />} iconPosition="left" />
          <KpiCard label="Active" value={Number(s.activeSchedules || 0)} icon={<CheckIcon />} iconPosition="left" />
          <KpiCard label="Est. Monthly Value" value={fmt(Number(s.estMonthlyValue || 0), currency)} icon={<DollarIcon />} iconPosition="left" />
          <KpiCard label="Unique Donors" value={Number(s.uniqueDonors || 0)} icon={<UsersIcon />} iconPosition="left" />
        </>
      )}
    </section>
  );
}


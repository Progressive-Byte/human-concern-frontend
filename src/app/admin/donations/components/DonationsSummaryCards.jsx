"use client";

import KpiCard from "@/app/admin/components/KpiCard";
import { formatCurrency } from "@/utils/helpers";

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M8 6h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 6h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M3 12h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M3 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
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

function TipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 2a7 7 0 0 0-4 12.75V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-5.25A7 7 0 0 0 12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 23h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export default function DonationsSummaryCards({ summary = {}, loading = false, currency = "USD" }) {
  const s = summary || {};

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
          <KpiCard label="Total Transactions" value={Number(s.totalTransactions || 0)} icon={<ListIcon />} iconPosition="left" />
          <KpiCard label="Completed" value={Number(s.completedTransactions || 0)} icon={<CheckIcon />} iconPosition="left" />
          <KpiCard label="Total Amount" value={formatCurrency(Number(s.totalAmount || 0), currency)} icon={<DollarIcon />} iconPosition="left" />
          <KpiCard label="Tips Collected" value={formatCurrency(Number(s.tipsCollected || 0), currency)} icon={<TipIcon />} iconPosition="left" />
        </>
      )}
    </section>
  );
}


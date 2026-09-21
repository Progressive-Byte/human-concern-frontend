"use client";

import { formatCurrency } from "@/utils/helpers";

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">{label}</div>
      <div className={`mt-2 text-[24px] font-semibold leading-none ${accent ? "text-[#EA3335]" : "text-[#111827]"}`}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-[12px] text-[#6B7280]">{sub}</div> : null}
    </div>
  );
}

function Skeleton() {
  return <div className="h-[104px] animate-pulse rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA]" />;
}

const ReportKpiCards = ({ data, loading }) => {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton /><Skeleton /><Skeleton /><Skeleton />
      </section>
    );
  }

  const kpis = data?.kpis || {};
  const windows = data?.windows || {};
  const currency = data?.currency || "USD";

  const money = (v) => formatCurrency(Number(v || 0), currency);
  const donors = kpis.donors || { total: 0, new: 0, returning: 0 };

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Committed" value={money(kpis.committed)} sub="Full value of paid donations" />
        <StatCard label="Collected" value={money(kpis.collected)} sub="Payments actually received" />
        <StatCard label="Donations" value={Number(kpis.donationCount || 0).toLocaleString()} sub="Paid invoices" />
        <StatCard label="Average donation" value={money(kpis.averageGift)} sub="Committed ÷ donations" />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["today", "mtd", "ytd"].map((key) => {
          const w = windows[key] || {};
          return (
            <div key={key} className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">{key}</div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[18px] font-semibold text-[#111827]">{money(w.committed)}</span>
                <span className="text-[12px] text-[#6B7280]">{money(w.collected)} collected</span>
                <span className="text-[12px] text-[#6B7280]">{Number(w.donationCount || 0).toLocaleString()} donations</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="One-time"
          value={money(kpis.oneTime?.amount)}
          sub={`${Number(kpis.oneTime?.count || 0).toLocaleString()} donations`}
        />
        <StatCard
          label="Recurring"
          value={money(kpis.recurring?.amount)}
          sub={`${Number(kpis.recurring?.count || 0).toLocaleString()} plans`}
        />
        <StatCard
          label="Active subscriptions"
          value={Number(kpis.activeSubscriptions || 0).toLocaleString()}
          sub="Recurring schedules running"
        />
        <StatCard label="MRR" value={money(kpis.mrr)} sub="Due this month" accent />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total donors" value={Number(donors.total || 0).toLocaleString()} sub="In the selected period" />
        <StatCard label="New donors" value={Number(donors.new || 0).toLocaleString()} sub="First donation in period" />
        <StatCard label="Returning donors" value={Number(donors.returning || 0).toLocaleString()} sub="Donated before too" />
      </section>
    </div>
  );
};

export default ReportKpiCards;

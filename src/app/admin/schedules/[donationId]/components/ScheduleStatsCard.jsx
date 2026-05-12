"use client";

import { formatCurrency } from "@/utils/helpers";

function StatBox({ label, value, dark = false }) {
  return (
    <div className={`${dark ? "bg-[#111827] text-white" : "bg-[#F9FAFB] text-[#111827]"} rounded-xl p-4`}>
      <div className={`${dark ? "text-white/60" : "text-[#6B7280]"} text-[11px] font-semibold`}>{label}</div>
      <div className="mt-2 text-[18px] font-semibold">{value}</div>
    </div>
  );
}

export default function ScheduleStatsCard({ stats, loading = false }) {
  const s = stats && typeof stats === "object" ? stats : {};
  const currency = String(s?.currency || "USD");

  const totalContributed = formatCurrency(Number(s?.totalContributed ?? s?.totalAmount ?? 0), currency);
  const successRate = `${Number(s?.successRate ?? 0)}%`;
  const failedPayments = Number(s?.failedPayments ?? 0);
  const avgAmount = formatCurrency(Number(s?.avgAmount ?? s?.averageAmount ?? 0), currency);

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6B7280]" fill="none">
          <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 17V9M12 17V7M16 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Statistics
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatBox label="Total Contributed" value={loading ? "—" : totalContributed} dark />
        <StatBox label="Success Rate" value={loading ? "—" : successRate} />
        <StatBox label="Failed Payments" value={loading ? "—" : String(failedPayments)} />
        <StatBox label="Avg. Amount" value={loading ? "—" : avgAmount} />
      </div>
    </section>
  );
}


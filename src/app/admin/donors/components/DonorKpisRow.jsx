import KpiCard from "@/app/admin/components/KpiCard";
import { formatCurrency } from "@/utils/helpers";

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function AvgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M3 17l6-6 4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function DonorKpisRow({ donor, stats, schedulesSummary, loading }) {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>
    );
  }

  const totalDonated = Number(stats?.totalDonated ?? donor?.totalDonated ?? 0);
  const totalTransactions = Number(stats?.totalTransactions ?? donor?.donationCount ?? 0);
  const averageDonation = Number(stats?.avgDonation ?? donor?.averageDonation ?? 0);
  const activeSchedules = Number(stats?.activeSchedules ?? schedulesSummary?.activeSchedules ?? 0);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <KpiCard label="Total Donated" value={formatCurrency(totalDonated)} icon={<DollarIcon />} iconPosition="left" />
      <KpiCard label="Active Schedules" value={activeSchedules} icon={<RepeatIcon />} iconPosition="left" />
      <KpiCard label="Total Transactions" value={totalTransactions} icon={<ListIcon />} iconPosition="left" />
      <KpiCard label="Avg. Transaction" value={formatCurrency(averageDonation)} icon={<AvgIcon />} iconPosition="left" />
    </section>
  );
}

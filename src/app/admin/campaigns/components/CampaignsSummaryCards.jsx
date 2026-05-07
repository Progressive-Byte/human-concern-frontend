import { formatCurrency } from "@/utils/helpers";

function SummaryCard({ label, value, icon }) {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] text-[#6B7280]">{label}</p>
          <p className="mt-2 text-[22px] font-semibold leading-none text-[#111827]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="h-[82px] animate-pulse rounded-2xl border border-dashed border-[#E5E7EB] bg-white" />;
}

export default function CampaignsSummaryCards({ summary, currency = "USD", loading }) {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </section>
    );
  }

  const totalCampaigns = Number(summary?.totalCampaigns || 0).toLocaleString();
  const totalRaised = formatCurrency(summary?.totalRaised || 0, currency);
  const totalDonors = Number(summary?.totalDonors || 0).toLocaleString();
  const activeNow = Number(summary?.activeNow || 0).toLocaleString();

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Total Campaigns"
        value={totalCampaigns}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M12 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />
      <SummaryCard
        label="Total Raised"
        value={totalRaised}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M12 1v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
      <SummaryCard
        label="Total Donors"
        value={totalDonors}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
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
          </svg>
        }
      />
      <SummaryCard
        label="Active Now"
        value={activeNow}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M8 7V3m8 4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M4 8h16v12H4V8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
    </section>
  );
}

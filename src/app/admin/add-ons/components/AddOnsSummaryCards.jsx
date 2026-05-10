import KpiCard from "@/app/admin/components/KpiCard";

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M20 12v9H4v-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M22 7H2v5h20V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 7H8.5A2.5 2.5 0 1 1 11 2.5L12 7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 7h3.5A2.5 2.5 0 1 0 13 2.5L12 7z"
        stroke="currentColor"
        strokeWidth="2"
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

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M3 7h18v14H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 3h14v4H5V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export default function AddOnsSummaryCards({ summary, loading }) {
  const s = summary || {};

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <KpiCard label="Total Add-Ons" value={Number(s.total || 0)} icon={<GiftIcon />} iconPosition="left" />
          <KpiCard label="Enabled" value={Number(s.enabled || 0)} icon={<CheckIcon />} iconPosition="left" />
          <KpiCard label="Archived" value={Number(s.archived || 0)} icon={<ArchiveIcon />} iconPosition="left" />
        </>
      )}
    </section>
  );
}


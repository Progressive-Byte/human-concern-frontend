import { formatCurrency } from "@/utils/helpers";

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

export default function DonorCausesCard({ causes, loading, onViewAll }) {
  if (loading) return <Skeleton />;

  const rows = Array.isArray(causes?.data) ? causes.data : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Donation by Cause</div>
        <button
          type="button"
          onClick={onViewAll}
          disabled={!onViewAll}
          className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-60 disabled:hover:bg-[#F3F4F6]"
        >
          View All
        </button>
      </div>
      <div className="border-t border-[#F3F4F6]" />
      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">No cause totals yet.</div>
      ) : (
        <div className="px-5 py-4">
          <div className="space-y-3">
            {rows.slice(0, 6).map((item, idx) => {
              const name = String(item?.cause?.name || item?.causeName || "—");
              const totalDonated = Number(item?.totalDonated || 0);
              const donationCount = Number(item?.donationCount || 0);
              return (
                <div key={`${name}-${idx}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[#111827]">{name}</div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">{donationCount} donations</div>
                  </div>
                  <div className="shrink-0 text-[13px] font-semibold text-[#111827]">{formatCurrency(totalDonated)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

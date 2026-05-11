import { formatCurrency } from "@/utils/helpers";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

export default function DonorDonationsTable({ donations, loading, onViewAll }) {
  if (loading) return <Skeleton />;

  const rows = Array.isArray(donations?.data) ? donations.data : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Recent Transactions</div>
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
        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">No transactions found.</div>
      ) : (
        <div className="px-5 py-4">
          <div className="space-y-3">
            {rows.slice(0, 6).map((d, idx) => {
              const causeName = String(d?.cause?.name || d?.causeName || "—");
              const amount = Number(d?.amount || 0);
              const createdAt = d?.createdAt;
              return (
                <div key={`${causeName}-${idx}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#111827]">
                      <CheckIcon />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#111827]">{causeName}</div>
                      <div className="mt-1 text-[12px] text-[#6B7280]">{formatDate(createdAt)}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-[13px] font-semibold text-[#111827]">{formatCurrency(amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

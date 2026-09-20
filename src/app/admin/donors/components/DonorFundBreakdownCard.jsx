import { formatCurrency } from "@/utils/helpers";

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-40 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

const DonorFundBreakdownCard = ({ breakdown, loading }) => {
  if (loading) return <Skeleton />;

  const rows = Array.isArray(breakdown?.funds) ? breakdown.funds : [];
  const total = Number(breakdown?.summary?.totalAmountUsd || 0);

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Fund Code Breakdown</div>
        <div className="text-[12px] text-[#6B7280]">{formatCurrency(total)}</div>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">No fund totals yet.</div>
      ) : (
        <div className="space-y-3 px-5 py-4">
          {rows.map((row, idx) => {
            const causeNames = Array.isArray(row.labels) ? row.labels.filter(Boolean).join(", ") : "";
            return (
              <div
                key={`${row.fundCode || "unassigned"}-${row.currency || ""}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-[#111827]">
                    {row.fundCode ? `Fund ${row.fundCode}` : "Unassigned"}
                  </div>
                  <div className="mt-1 truncate text-[12px] text-[#6B7280]">
                    {causeNames || `${row.payments || 0} payments`}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[13px] font-semibold text-[#111827]">{formatCurrency(row.amount)}</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">{row.payments || 0} payments</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DonorFundBreakdownCard;

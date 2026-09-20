import { formatCurrency } from "@/utils/helpers";

function BreakdownList({ title, rows, emptyText, idKey }) {
  return (
    <div>
      <div className="px-5 pt-4 text-[12px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{title}</div>
      {rows.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-[#6B7280]">{emptyText}</div>
      ) : (
        <div className="space-y-3 px-5 py-4">
          {rows.map((row, idx) => (
            <div
              key={`${row[idKey] || row.name || "row"}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-[#111827]">{row.name || "Unassigned"}</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">
                  {row.donationCount || 0} donations · {row.payments || 0} payments
                </div>
              </div>
              <div className="shrink-0 text-[13px] font-semibold text-[#111827]">{formatCurrency(row.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-52 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

const DonorCampaignFormBreakdownCard = ({ breakdown, loading }) => {
  if (loading) return <Skeleton />;

  const campaigns = Array.isArray(breakdown?.campaigns) ? breakdown.campaigns : [];
  const forms = Array.isArray(breakdown?.forms) ? breakdown.forms : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Campaign &amp; Form Breakdown</div>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      <BreakdownList
        title="By campaign"
        rows={campaigns}
        emptyText="No campaign totals yet."
        idKey="campaignId"
      />
      <div className="border-t border-[#F3F4F6]" />
      <BreakdownList title="By form" rows={forms} emptyText="No form totals yet." idKey="formId" />
    </section>
  );
};

export default DonorCampaignFormBreakdownCard;

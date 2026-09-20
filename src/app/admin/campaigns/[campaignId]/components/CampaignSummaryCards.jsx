"use client";

import { formatCurrency } from "@/utils/helpers";

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">{label}</div>
      <div className="mt-2 text-[22px] font-semibold leading-none text-[#111827]">{value}</div>
      {sub ? <div className="mt-1 text-[12px] text-[#6B7280]">{sub}</div> : null}
    </div>
  );
}

const CampaignSummaryCards = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[100px] animate-pulse rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA]" />
        ))}
      </section>
    );
  }

  const s = data.summary || {};
  const currency = data.currency || "USD";
  const money = (v) => formatCurrency(Number(v || 0), currency);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Goal"
        value={s.goal === null || s.goal === undefined ? "Open-ended" : money(s.goal)}
        sub={s.goal === null ? "No target set" : `${s.percentAchieved ?? 0}% achieved`}
      />
      <Stat label="Amount raised" value={money(s.collected)} sub="Payments received" />
      <Stat
        label="Committed"
        value={money(s.committed)}
        sub="Full value incl. recurring plans"
      />
      <Stat
        label="Remaining"
        value={s.remaining === null || s.remaining === undefined ? "—" : money(s.remaining)}
        sub={s.goal === null ? "No target set" : "Goal minus raised"}
      />

      <Stat label="Donations" value={Number(s.donationCount || 0).toLocaleString()} sub="Paid invoices" />
      <Stat
        label="Donors"
        value={Number(s.donorCount || 0).toLocaleString()}
        sub={`${Number(s.newDonors || 0).toLocaleString()} new · ${Number(s.returningDonors || 0).toLocaleString()} returning`}
      />
      <Stat label="Average gift" value={money(s.averageGift)} sub="Committed ÷ donations" />
      <Stat
        label="One-time / Recurring"
        value={`${money(s.oneTime?.amount)} / ${money(s.recurring?.amount)}`}
        sub={`${Number(s.oneTime?.count || 0).toLocaleString()} one-time · ${Number(s.recurring?.count || 0).toLocaleString()} recurring`}
      />
    </section>
  );
};

export default CampaignSummaryCards;

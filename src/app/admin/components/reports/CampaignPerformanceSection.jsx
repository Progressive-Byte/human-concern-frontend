"use client";

import { formatCurrency } from "@/utils/helpers";
import TrendChart from "./TrendChart";

function donationCountLabel(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString()} ${n === 1 ? "donation" : "donations"}`;
}

function MiniList({ title, items, currency, valueKey }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="mb-3 text-[13px] font-semibold text-[#111827]">{title}</div>
      {items.length === 0 ? (
        <div className="text-[13px] text-[#6B7280]">No campaigns in this period.</div>
      ) : (
        <ol className="space-y-2">
          {items.map((c, i) => (
            <li key={c.campaignId || i} className="flex items-center justify-between gap-3">
              <span className="truncate text-[13px] text-[#111827]">
                <span className="mr-2 text-[#9CA3AF]">{i + 1}.</span>
                {c.campaignName}
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-[#111827]">
                {valueKey === "donations" ? donationCountLabel(c.donations) : formatCurrency(c.committed, currency)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const CampaignPerformanceSection = ({ data, loading }) => {
  const currency = data?.currency || "USD";
  const items = Array.isArray(data?.items) ? data.items.filter((c) => c.committed > 0 || c.donations > 0) : [];
  const counts = data?.campaigns || {};

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[18px] font-semibold text-[#111827]">Campaign performance</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          {Number(counts.active || 0).toLocaleString()} active · {Number(counts.ended || 0).toLocaleString()} ended
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MiniList title="Top 5 by amount raised" items={data?.topByAmount || []} currency={currency} valueKey="committed" />
        <MiniList title="Top 5 by donation volume" items={data?.topByVolume || []} currency={currency} valueKey="donations" />
      </div>

      <TrendChart series={data?.trend || []} bucket={data?.range?.bucket || "day"} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        <div className="border-b border-[#F3F4F6] px-5 py-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Goal vs raised</h3>
        </div>
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No campaign donations in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Campaign</th>
                  <th className="py-3 pr-4">Raised</th>
                  <th className="py-3 pr-4">Goal</th>
                  <th className="py-3 pr-4">% of goal</th>
                  <th className="py-3 pr-4">Donations</th>
                  <th className="py-3 pr-5">Donors</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {items.map((c, i) => (
                  <tr key={c.campaignId || i} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 align-top font-semibold">{c.campaignName}</td>
                    <td className="py-3 pr-4 align-top">{formatCurrency(c.committed, currency)}</td>
                    <td className="py-3 pr-4 align-top text-[#6B7280]">{c.goal > 0 ? formatCurrency(c.goal, currency) : "—"}</td>
                    <td className="py-3 pr-4 align-top">
                      {c.goalPercent === null || c.goalPercent === undefined ? (
                        <span className="text-[#9CA3AF]">—</span>
                      ) : (
                        `${c.goalPercent}%`
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top">{Number(c.donations || 0).toLocaleString()}</td>
                    <td className="py-3 pr-5 align-top">{Number(c.donors || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignPerformanceSection;

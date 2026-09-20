"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/helpers";

const TABS = [
  { key: "lastTouch", label: "Last touch" },
  { key: "firstTouch", label: "First touch" },
];

const AttributionSection = ({ data, loading }) => {
  const currency = data?.currency || "USD";
  const items = Array.isArray(data?.items) ? data.items : [];
  const [tab, setTab] = useState("lastTouch");

  // Roll the per-(first,last) rows up into the selected touch's source/medium/campaign.
  const grouped = new Map();
  for (const row of items) {
    const touch = row[tab] || {};
    const key = `${touch.source || "Direct"}||${touch.medium || ""}||${touch.campaign || ""}`;
    if (!grouped.has(key)) {
      grouped.set(key, { ...touch, donations: 0, donors: 0, committed: 0, collected: 0 });
    }
    const g = grouped.get(key);
    g.donations += row.donations || 0;
    g.donors += row.donors || 0;
    g.committed += row.committed || 0;
    g.collected += row.collected || 0;
  }
  const rows = Array.from(grouped.values()).sort((a, b) => b.committed - a.committed);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#111827]">Acquisition &amp; attribution</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            First touch is the first UTM this browser ever saw; last touch is the UTM on the donation itself.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-dashed border-[#E5E7EB] bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition ${
                tab === t.key ? "bg-[#111827] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No attributed donations in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Source</th>
                  <th className="py-3 pr-4">Medium</th>
                  <th className="py-3 pr-4">Campaign</th>
                  <th className="py-3 pr-4">Donations</th>
                  <th className="py-3 pr-4">Committed</th>
                  <th className="py-3 pr-5">Collected</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {rows.map((r, i) => (
                  <tr key={`${r.source}-${r.medium}-${r.campaign}-${i}`} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 align-top font-semibold">{r.source || "Direct"}</td>
                    <td className="py-3 pr-4 align-top text-[#6B7280]">{r.medium || "—"}</td>
                    <td className="py-3 pr-4 align-top text-[#6B7280]">{r.campaign || "—"}</td>
                    <td className="py-3 pr-4 align-top">{Number(r.donations || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 align-top font-semibold">{formatCurrency(r.committed, currency)}</td>
                    <td className="py-3 pr-5 align-top text-[#6B7280]">{formatCurrency(r.collected, currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E5E7EB] bg-[#FAFAFA] text-[13px] font-semibold text-[#111827]">
                  <td className="px-5 py-3" colSpan={3}>
                    Total
                  </td>
                  <td className="py-3 pr-4">{rows.reduce((s, r) => s + r.donations, 0).toLocaleString()}</td>
                  <td className="py-3 pr-4">{formatCurrency(rows.reduce((s, r) => s + r.committed, 0), currency)}</td>
                  <td className="py-3 pr-5">{formatCurrency(rows.reduce((s, r) => s + r.collected, 0), currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AttributionSection;

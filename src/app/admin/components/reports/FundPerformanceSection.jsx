"use client";

import { Fragment, useState } from "react";
import { formatCurrency } from "@/utils/helpers";

const FundPerformanceSection = ({ data, loading }) => {
  const currency = data?.currency || "USD";
  const items = Array.isArray(data?.items) ? data.items : [];
  const [expanded, setExpanded] = useState({});

  function toggle(key) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#111827]">Fund code &amp; designation performance</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Designations come from the donation&apos;s form. A fund with several designations is split equally.
          </p>
        </div>
        <div className="text-[13px] text-[#6B7280]">
          Total committed:{" "}
          <span className="font-semibold text-[#111827]">{formatCurrency(data?.total || 0, currency)}</span>
        </div>
      </div>

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No fund donations in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Fund code</th>
                  <th className="py-3 pr-4">Fund / cause</th>
                  <th className="py-3 pr-4">Donations</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">One-time</th>
                  <th className="py-3 pr-4">Recurring</th>
                  <th className="py-3 pr-5">% of total</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {items.map((f, i) => {
                  const key = `${f.fundCode}-${i}`;
                  const hasDesignations = Array.isArray(f.designations) && f.designations.length > 0;
                  return (
                    <Fragment key={key}>
                      <tr className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                        <td className="px-5 py-3 align-top font-mono text-[12px]">{f.fundCode || "—"}</td>
                        <td className="py-3 pr-4 align-top">
                          <div className="font-semibold">{f.fundName}</div>
                          {hasDesignations ? (
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              className="mt-0.5 cursor-pointer text-[12px] text-[#6B7280] underline hover:text-[#111827]"
                            >
                              {expanded[key] ? "Hide" : "Show"} {f.designations.length} designation
                              {f.designations.length !== 1 ? "s" : ""}
                            </button>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4 align-top">{Number(f.donationCount || 0).toLocaleString()}</td>
                        <td className="py-3 pr-4 align-top font-semibold">{formatCurrency(f.amount, currency)}</td>
                        <td className="py-3 pr-4 align-top text-[#6B7280]">{formatCurrency(f.oneTimeAmount, currency)}</td>
                        <td className="py-3 pr-4 align-top text-[#6B7280]">{formatCurrency(f.recurringAmount, currency)}</td>
                        <td className="py-3 pr-5 align-top">{f.percentOfTotal}%</td>
                      </tr>
                      {expanded[key] && hasDesignations
                        ? f.designations.map((d, di) => (
                            <tr key={`${key}-d-${di}`} className="border-t border-[#F9FAFB] bg-[#FAFAFA]">
                              <td className="px-5 py-2 align-top text-[12px] text-[#9CA3AF]">↳</td>
                              <td className="py-2 pr-4 align-top text-[12px] text-[#6B7280]">{d.designation}</td>
                              <td className="py-2 pr-4 align-top text-[12px] text-[#6B7280]">{Number(d.donationCount || 0).toLocaleString()}</td>
                              <td className="py-2 pr-4 align-top text-[12px] text-[#6B7280]">{formatCurrency(d.amount, currency)}</td>
                              <td className="py-2 pr-4 align-top" />
                              <td className="py-2 pr-4 align-top" />
                              <td className="py-2 pr-5 align-top" />
                            </tr>
                          ))
                        : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default FundPerformanceSection;

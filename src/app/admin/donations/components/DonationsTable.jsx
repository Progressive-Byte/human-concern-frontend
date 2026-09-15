"use client";

import { Fragment, useState } from "react";
import DonationRowActions from "./DonationRowActions";
import DonationStatusPill from "./DonationStatusPill";
import DonationBreakdown from "./DonationBreakdown";
import DonationsPagination from "./DonationsPagination";
import { AddOnList } from "@/components/common/AddOnList";

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function shortTransactionId(id) {
  const v = String(id || "");
  if (!v) return "—";
  const tail = v.length > 6 ? v.slice(-6) : v;
  return `#${tail}`;
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-6 w-56 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-9 w-24 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="p-5">
        <div className="h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-3 h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-3 h-12 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

const DonationsTable = ({
  items = [],
  loading = false,
  pagination = null,
  currency = "USD",
  onPrevPage,
  onNextPage,
  showingLabel,
  formatAmount,
}) => {
  const [expanded, setExpanded] = useState(() => new Set());

  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = Number(pagination?.total || rows.length || 0);
  const amountFmt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

  const toggleRow = (rowId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">All Transactions ({total})</div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="w-10 py-3 pl-4" aria-label="Expand row" />
              <th className="py-3 pr-4">Reference</th>
              <th className="py-3 pr-4">Donor</th>
              <th className="py-3 pr-4">Campaign</th>
              <th className="py-3 pr-4">Cause</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4 text-right">Tip</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((d, idx) => {
                const id = String(d?.id || "");
                const rowKey = id || `${idx}-${String(d?.donor?.email || "")}-${d?.createdAt}`;
                const donorName = String(d?.donor?.name || "—");
                const donorEmail = String(d?.donor?.email || "");
                const campaignName = String(d?.campaignName || "—");
                const cause = String(d?.causeLabel || "—");
                const amount = Number(d?.amount || 0);
                const tip = Number(d?.tipAmount || 0);
                const status = String(d?.statusLabel || d?.status || "—");
                const createdAt = d?.createdAt;
                const isOpen = expanded.has(rowKey);

                return (
                  <Fragment key={rowKey}>
                    <tr className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]">
                      <td className="py-4 pl-4 pr-2 align-top">
                        <button
                          type="button"
                          onClick={() => toggleRow(rowKey)}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? "Hide payment breakdown" : "Show payment breakdown"}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                        >
                          <ChevronIcon open={isOpen} />
                        </button>
                      </td>
                      <td className="py-4 pr-4">
                        {d?.providerTransactionId ? (
                          <div className="min-w-0">
                            <div
                              className="max-w-[180px] truncate font-mono text-[12px] font-semibold text-[#111827]"
                              title={String(d.providerTransactionId)}
                            >
                              {String(d.providerTransactionId)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-[#6B7280]" title={id}>
                              {shortTransactionId(id)}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-lg bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-semibold text-[#111827]">
                            {shortTransactionId(id)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-[#111827]">{donorName}</div>
                          <div className="mt-1 truncate text-[12px] text-[#6B7280]">{donorEmail || "—"}</div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="truncate text-[#111827]">{campaignName}</div>
                        <AddOnList addons={d?.addons} currency={String(d?.currency || currency)} className="mt-1.5" max={2} />
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
                          {cause}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right font-semibold">{amountFmt(amount, currency)}</td>
                      <td className="py-4 pr-4 text-right text-[#6B7280]">{tip > 0 ? amountFmt(tip, currency) : "—"}</td>
                      <td className="py-4 pr-4 text-[#6B7280]">{formatDate(createdAt)}</td>
                      <td className="py-4 pr-4">
                        <DonationStatusPill status={status} />
                      </td>
                      <td className="py-4 pr-5 text-right">
                        <DonationRowActions donation={d} />
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="bg-[#FCFCFD]">
                        <td colSpan={10} className="px-4 pb-4 pt-1">
                          <DonationBreakdown donation={d} formatAmount={(v) => amountFmt(v, currency)} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DonationsPagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} showingLabel={showingLabel} />
    </section>
  );
}
export default DonationsTable;
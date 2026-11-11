"use client";

import { useState } from "react";
import DonationRowActions from "./DonationRowActions";
import DonationStatusPill from "./DonationStatusPill";
import DonationBreakdownModal from "./DonationBreakdownModal";
import DonationsPagination from "./DonationsPagination";
import { AddOnList } from "@/components/common/AddOnList";
import { SourceBadge } from "@/components/common/SourceBadge";

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

// Cause names for one row. Prefer the payment's own allocations (one per cause) so a multi-cause
// gift lists each name; fall back to the single joined label when allocations are missing.
function causeNamesFor(row) {
  const fromAllocations = (Array.isArray(row?.causeAllocations) ? row.causeAllocations : [])
    .filter((a) => a && !a.isAddOn && String(a.label || "").trim())
    .map((a) => String(a.label).trim());
  const unique = Array.from(new Set(fromAllocations));
  if (unique.length) return unique;

  const fallback = String(row?.causeLabel || "").trim();
  if (!fallback || fallback === "—") return [];
  return Array.from(new Set(fallback.split(",").map((name) => name.trim()).filter(Boolean)));
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white">
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
  const [breakdownFor, setBreakdownFor] = useState(null);

  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = Number(pagination?.total || rows.length || 0);
  const amountFmt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-solid border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">All Transactions ({total})</div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="hc-table-scroll">
        <table className="w-full min-w-[1200px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Reference</th>
              <th className="py-3 pr-4">Donor</th>
              <th className="py-3 pr-4">Campaign</th>
              <th className="py-3 pr-4">Source</th>
              <th className="py-3 pr-4">Cause</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4 text-right">Tip</th>
              <th className="py-3 pr-4 text-right">Fee</th>
              <th className="py-3 pr-4 text-right">Net</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((d, idx) => {
                const id = String(d?.id || "");
                const donorName = String(d?.donor?.name || "—");
                const donorEmail = String(d?.donor?.email || "");
                const campaignName = String(d?.campaignName || "—");
                const formName = String(d?.formName || "—");
                const causeNames = causeNamesFor(d);
                const amount = Number(d?.amount || 0);
                const tip = Number(d?.tipAmount || 0);
                // Processor fee/net are recorded when the payment settles; "—" until then.
                const fees = Number(d?.fees || 0);
                const netAmount = Number(d?.netAmount || 0);
                const status = String(d?.statusLabel || d?.status || "—");
                const createdAt = d?.createdAt;

                return (
                  <tr
                    key={id || `${idx}-${donorEmail}-${createdAt}`}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-4">
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
                      <div className="min-w-0">
                        <div className="truncate text-[#111827]" title={campaignName}>{campaignName}</div>
                        <div className="mt-0.5 truncate text-[11px] text-[#6B7280]" title={formName}>
                          {formName && formName !== "—" ? `From: ${formName}` : "—"}
                        </div>
                        <AddOnList addons={d?.addons} currency={String(d?.currency || currency)} className="mt-1.5" max={2} />
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <SourceBadge source={d?.source} />
                    </td>
                    <td className="py-4 pr-4">
                      {causeNames.length === 0 ? (
                        <span className="text-[#9CA3AF]">—</span>
                      ) : (
                        <div
                          className="flex max-w-[220px] items-center gap-1.5"
                          title={causeNames.join(", ")}
                        >
                          <span className="min-w-0 truncate whitespace-nowrap rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#6B7280]">
                            {causeNames[0]}
                          </span>
                          {causeNames.length > 1 ? (
                            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#E5E7EB] px-2 py-1 text-[11px] font-semibold text-[#4B5563]">
                              +{causeNames.length - 1}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-right font-semibold">
                      <button
                        type="button"
                        onClick={() => setBreakdownFor(d)}
                        title="View payment breakdown"
                        className="cursor-pointer rounded-lg px-2 py-1 font-semibold text-[#111827] underline decoration-dotted decoration-[#9CA3AF] underline-offset-4 transition hover:bg-[#F3F4F6]"
                      >
                        {amountFmt(amount, currency)}
                      </button>
                    </td>
                    <td className="py-4 pr-4 text-right text-[#6B7280]">{tip > 0 ? amountFmt(tip, currency) : "—"}</td>
                    <td className="py-4 pr-4 text-right text-[#6B7280]">{fees > 0 ? `-${amountFmt(fees, currency)}` : "—"}</td>
                    <td className="py-4 pr-4 text-right text-[#6B7280]">
                      {fees > 0 ? amountFmt(netAmount > 0 ? netAmount : amount - fees, currency) : "—"}
                    </td>
                    <td className="py-4 pr-4 text-[#6B7280]">{formatDate(createdAt)}</td>
                    <td className="py-4 pr-4">
                      <DonationStatusPill status={status} />
                    </td>
                    <td className="py-4 pr-5 text-right">
                      <DonationRowActions donation={d} onViewBreakdown={() => setBreakdownFor(d)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DonationsPagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} showingLabel={showingLabel} />

      <DonationBreakdownModal
        donation={breakdownFor}
        onClose={() => setBreakdownFor(null)}
        formatAmount={(v) => amountFmt(v, currency)}
      />
    </section>
  );
}
export default DonationsTable;

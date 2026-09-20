"use client";

import { Fragment, useState } from "react";
import { formatCurrency, formatDate } from "@/utils/helpers";

function ReceiptStatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "succeeded" || s === "completed"
      ? "bg-[#ECFDF5] text-[#047857]"
      : s === "pending" || s === "processing" || s === "requires_action"
        ? "bg-[#FEF3C7] text-[#92400E]"
        : s === "refunded"
          ? "bg-[#EFF6FF] text-[#1D4ED8]"
          : s === "failed"
            ? "bg-[#FEF2F2] text-[#991B1B]"
            : "bg-[#F3F4F6] text-[#6B7280]";
  const label = s ? s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "—";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>;
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

const DonorReceiptsTable = ({ donations, loading, onViewAll }) => {
  const [expanded, setExpanded] = useState(() => new Set());

  if (loading) return <Skeleton />;

  const rows = Array.isArray(donations?.data) ? donations.data : [];

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Receipt History</div>
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
        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">No receipts found.</div>
      ) : (
        <div className="overflow-x-auto px-5 py-4">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Amount</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Campaign / Form</th>
                <th className="px-3 py-2 font-semibold">Payment</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Receipt ID</th>
                <th className="px-3 py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const id = String(r?.id || idx);
                const isOpen = expanded.has(id);
                const lines = Array.isArray(r?.lineItems) ? r.lineItems : [];
                const campaignForm = [r?.campaignName, r?.formName].filter(Boolean).join(" · ");
                const payment = [r?.paymentMethod, r?.paymentMask].filter(Boolean).join(" ").trim();

                return (
                  <Fragment key={id}>
                    <tr className="border-t border-[#F3F4F6] text-[13px] text-[#111827]">
                      <td className="whitespace-nowrap px-3 py-3">{formatDate(r?.createdAt) || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold">
                        {formatCurrency(r?.totalAmount ?? r?.amount, String(r?.currency || "USD"))}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {r?.donationType === "recurring" ? "Recurring" : "One-time"}
                      </td>
                      <td className="px-3 py-3">{campaignForm || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3">{payment || "Card on file"}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <ReceiptStatusPill status={r?.transactionStatus || r?.status} />
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-3 text-[12px] text-[#6B7280]">
                        {r?.receiptId || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => toggle(id)}
                          disabled={lines.length === 0}
                          aria-label={isOpen ? "Hide line items" : "Show line items"}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-[12px] font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-60 disabled:hover:bg-[#F3F4F6]"
                        >
                          <ChevronIcon open={isOpen} />
                          {lines.length}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-t border-[#F3F4F6] bg-[#F9FAFB]">
                        <td colSpan={8} className="px-3 py-3">
                          <div className="rounded-xl bg-white px-4 py-3">
                            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                              Line items
                            </div>
                            <table className="mt-2 min-w-full text-left">
                              <thead>
                                <tr className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                                  <th className="py-1.5 pr-4 font-semibold">Fund code</th>
                                  <th className="py-1.5 pr-4 font-semibold">Designation</th>
                                  <th className="py-1.5 pr-4 font-semibold">Description</th>
                                  <th className="py-1.5 font-semibold">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lines.map((line, lineIdx) => (
                                  <tr key={`${id}-line-${lineIdx}`} className="text-[13px] text-[#111827]">
                                    <td className="py-1.5 pr-4">{line?.fundCode || "—"}</td>
                                    <td className="py-1.5 pr-4">{line?.designationCode || "—"}</td>
                                    <td className="py-1.5 pr-4">{line?.label || "—"}</td>
                                    <td className="whitespace-nowrap py-1.5 font-semibold">
                                      {formatCurrency(line?.amount, String(r?.currency || "USD"))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DonorReceiptsTable;

"use client";

import { formatCurrency } from "@/utils/helpers";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function shortId(id) {
  const v = String(id || "");
  if (!v) return "—";
  const tail = v.length > 8 ? v.slice(-8) : v;
  return `#${tail}`;
}

export default function SchedulePaymentHistoryTable({ paymentHistory, loading = false }) {
  const rows = Array.isArray(paymentHistory?.items) ? paymentHistory.items : Array.isArray(paymentHistory) ? paymentHistory : [];
  const currency = String(rows?.[0]?.currency || "USD");

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Payment History</div>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Transaction ID</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4">Cause</th>
              <th className="py-3 pr-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No payments.
                </td>
              </tr>
            ) : (
              rows.map((t, idx) => {
                const id = String(t?.id || t?.transactionId || "");
                const date = t?.createdAt || t?.at || t?.dueDate || null;
                const amount = Number(t?.amount || t?.installmentAmount || 0);
                const cur = String(t?.currency || currency || "USD");
                const cause = String(t?.causeLabel || t?.primaryCauseLabel || "—");
                const status = String(t?.statusLabel || t?.status || "—");

                return (
                  <tr key={id || `${idx}-${date}`} className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]">
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
                        {shortId(id)}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[#6B7280]">{formatDate(date)}</td>
                    <td className="py-4 pr-4 text-right font-semibold">{formatCurrency(amount, cur)}</td>
                    <td className="py-4 pr-4">{cause}</td>
                    <td className="py-4 pr-5">
                      <span className="inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
                        {String(status || "—")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}


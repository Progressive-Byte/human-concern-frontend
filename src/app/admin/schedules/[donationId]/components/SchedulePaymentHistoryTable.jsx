"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/helpers";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";

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

function StatusChip({ tone = "gray", children }) {
  const tones = {
    gray: "bg-[#F3F4F6] text-[#6B7280]",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-500/10 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}

function statusTone(status) {
  const s = String(status || "");
  if (s === "completed" || s === "succeeded") return "green";
  if (s === "failed") return "red";
  if (s === "processing" || s === "requires_action") return "blue";
  return "gray";
}

function RowChips({ row }) {
  const chips = [];

  if (row?.displayState === "skipped") chips.push(<StatusChip key="skipped" tone="gray">Skipped</StatusChip>);
  else if (row?.scheduled) chips.push(<StatusChip key="scheduled" tone="blue">Scheduled</StatusChip>);

  if (row?.missed) chips.push(<StatusChip key="missed" tone="amber">Missed</StatusChip>);

  if (row?.retried) {
    const label = row.retrying ? `Retried ×${row.retryCount} · retrying` : `Retried ×${row.retryCount}`;
    chips.push(
      <StatusChip key="retried" tone={row.retrying ? "blue" : "gray"}>
        {label}
      </StatusChip>,
    );
    if (row.retriesExhausted) chips.push(<StatusChip key="exhausted" tone="red">Retries exhausted</StatusChip>);
  }

  return chips.length ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null;
}

const SchedulePaymentHistoryTable = ({
  paymentHistory,
  loading = false,
  canRetry = false,
  retryingId = "",
  onRetry,
}) => {
  const rows = Array.isArray(paymentHistory?.items) ? paymentHistory.items : Array.isArray(paymentHistory) ? paymentHistory : [];
  const currency = String(rows?.[0]?.currency || "USD");

  const [confirmRow, setConfirmRow] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  async function handleConfirm() {
    if (!confirmRow) return;
    const row = confirmRow;
    setConfirmLoading(true);
    try {
      await onRetry?.(row);
    } finally {
      setConfirmLoading(false);
      setConfirmRow(null);
    }
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Payment History</div>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Transaction ID</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4">Cause</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B7280]">
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
                const busy = retryingId && String(retryingId) === id;
                const showRetry = canRetry && t?.canRetry;

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
                    <td className="py-4 pr-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <StatusChip tone={statusTone(status)}>{String(status || "—")}</StatusChip>
                        <RowChips row={t} />
                      </div>
                    </td>
                    <td className="py-4 pr-5 text-right">
                      {showRetry ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmRow(t)}
                          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busy ? "Queuing..." : "Retry"}
                        </button>
                      ) : (
                        <span className="text-[12px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(confirmRow)}
        title="Retry this payment?"
        description="This queues an immediate charge attempt. A payment can only be retried once per minute."
        confirmText="Retry payment"
        loading={confirmLoading}
        onClose={() => setConfirmRow(null)}
        onConfirm={handleConfirm}
      />
    </section>
  );
};

export default SchedulePaymentHistoryTable;

"use client";

import { formatCurrency } from "@/utils/helpers";

function percent(value) {
  const n = Number(value) || 0;
  return `${(n * 100).toFixed(2)}%`;
}

function HealthTile({ label, value, tone = "default" }) {
  const tones = {
    default: "text-[#111827]",
    good: "text-[#047857]",
    warn: "text-[#B45309]",
    bad: "text-[#B91C1C]",
  };
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">{label}</div>
      <div className={`mt-2 text-[24px] font-semibold leading-none ${tones[tone]}`}>{value}</div>
    </div>
  );
}

const TransactionHealthSection = ({ data, loading }) => {
  const tx = data?.transactions || {};
  const invoices = data?.invoices || {};
  const currency = data?.currency || "USD";

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-[#111827]">Transaction health</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Counts come from payment transactions; invoice status is the donation record.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HealthTile label="Successful" value={Number(tx.succeeded || 0).toLocaleString()} tone="good" />
            <HealthTile label="Pending" value={Number(tx.pending || 0).toLocaleString()} tone="warn" />
            <HealthTile label="Failed" value={Number(tx.failed || 0).toLocaleString()} tone="bad" />
            <HealthTile label="Refunded" value={Number(tx.refunded || 0).toLocaleString()} tone="warn" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HealthTile label="Failed-payment rate" value={percent(tx.failedRate)} />
            <HealthTile label="Refund rate" value={percent(tx.refundRate)} />
            <HealthTile
              label="Refunded amount"
              value={formatCurrency(Number(tx.refundedAmount || 0), currency)}
            />
            <HealthTile label="Chargebacks" value="Not tracked" />
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
            <div className="border-b border-[#F3F4F6] px-5 py-3 text-[13px] font-semibold text-[#111827]">
              Invoices (donations) by status
            </div>
            <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-5">
              {["succeeded", "pending", "failed", "refunded", "total"].map((key) => (
                <div key={key}>
                  <div className="text-[11px] uppercase tracking-wide text-[#6B7280]">{key}</div>
                  <div className="mt-1 text-[18px] font-semibold text-[#111827]">
                    {Number(invoices[key] || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default TransactionHealthSection;

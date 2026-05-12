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

function Row({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-[#111827]">{value}</div>
    </div>
  );
}

export default function ScheduleDetailsCard({ schedule, stats, loading = false }) {
  const currency = String(schedule?.currency || "USD");
  const formName = String(schedule?.formName || "—");
  const frequency = String(schedule?.frequencyLabel || "—");
  const amount = formatCurrency(Number(schedule?.installmentBaseAmount ?? schedule?.installmentAmount ?? 0), currency);
  const nextDue = formatDate(schedule?.nextDueDate ?? schedule?.nextDonationDate ?? schedule?.nextDonation ?? null);
  const createdAt = formatDate(schedule?.createdAt);
  const s = stats && typeof stats === "object" ? stats : null;
  const totalContributed = s ? formatCurrency(Number(s?.totalContributed ?? 0), currency) : "—";
  const paymentsMade = s?.paymentsMade ?? null;
  const installmentCount = s?.installmentCount ?? null;
  const paymentsMadeLabel =
    paymentsMade === null || paymentsMade === undefined
      ? "—"
      : installmentCount === null || installmentCount === undefined
        ? String(paymentsMade)
        : `${paymentsMade} / ${installmentCount}`;

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6B7280]" fill="none">
          <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        Schedule Details
      </div>

      <div className="mt-4 grid grid-cols-2 gap-5">
        <Row label="Campaign" value={loading ? "—" : formName} />
        <Row label="Frequency" value={loading ? "—" : frequency} />
        <Row label="Donation Amount" value={loading ? "—" : amount} />
        <Row label="Next Donation" value={loading ? "—" : nextDue} />
        <Row label="Total Donated" value={loading ? "—" : totalContributed} />
        <Row label="Payments Made" value={loading ? "—" : paymentsMadeLabel} />
        <Row label="Primary Cause" value={loading ? "—" : String(schedule?.primaryCauseLabel || "—")} />
        <Row label="Created On" value={loading ? "—" : createdAt} />
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

const RANGE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "mtd", label: "MTD" },
  { value: "ytd", label: "YTD" },
  { value: "last7", label: "Last 7" },
  { value: "last30", label: "Last 30" },
  { value: "custom", label: "Custom" },
];

const DONATION_TYPES = [
  { value: "", label: "All types" },
  { value: "one_time", label: "One-time" },
  { value: "recurring", label: "Recurring" },
];

const TX_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "succeeded", label: "Succeeded" },
  { value: "pending,processing,requires_action", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const inputClass =
  "w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30";
const labelClass = "mb-1 block text-[12px] font-semibold text-[#6B7280]";

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextFilter({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

const ReportFilterBar = ({ filters, options, onChange, onReset }) => {
  const [showMore, setShowMore] = useState(false);

  const set = (key) => (value) => onChange({ [key]: value });

  const campaignOptions = [{ value: "", label: "All campaigns" }, ...(options.campaigns || []).map((c) => ({ value: c.id, label: c.name }))];
  const fundOptions = [{ value: "", label: "All funds" }, ...(options.funds || []).map((f) => ({ value: f.fundCode || f.id, label: `${f.fundCode || "—"} · ${f.name}` }))];
  const designationOptions = [{ value: "", label: "All designations" }, ...(options.designations || []).map((d) => ({ value: d.id, label: d.name }))];
  const sourceOptions = [{ value: "", label: "All sources" }, ...(options.sources || []).map((s) => ({ value: s, label: s }))];
  const mediumOptions = [{ value: "", label: "All mediums" }, ...(options.mediums || []).map((s) => ({ value: s, label: s }))];

  const activeCount = Object.entries(filters || {}).filter(
    ([k, v]) => v && !["range", "from", "to"].includes(k)
  ).length;

  return (
    <section className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {RANGE_PRESETS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => set("range")(r.value)}
            className={`cursor-pointer rounded-xl border px-3.5 py-2 text-[12px] font-semibold transition ${
              (filters.range || "mtd") === r.value
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {filters.range === "custom" ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextFilter label="From" value={filters.from} onChange={set("from")} placeholder="YYYY-MM-DD" />
          <TextFilter label="To" value={filters.to} onChange={set("to")} placeholder="YYYY-MM-DD" />
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Fundraising campaign" value={filters.campaignId} onChange={set("campaignId")} options={campaignOptions} />
        <Select label="Fund code" value={filters.fundCode} onChange={set("fundCode")} options={fundOptions} />
        <Select label="Designation" value={filters.designationId} onChange={set("designationId")} options={designationOptions} />
        <Select label="Donation type" value={filters.donationType} onChange={set("donationType")} options={DONATION_TYPES} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="cursor-pointer text-[12px] font-semibold text-[#111827] hover:underline"
        >
          {showMore ? "Hide" : "More"} filters{activeCount ? ` (${activeCount} active)` : ""}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#6B7280] transition hover:bg-[#F9FAFB]"
        >
          Reset
        </button>
      </div>

      {showMore ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Source (utm_source)" value={filters.source} onChange={set("source")} options={sourceOptions} />
          <Select label="Medium (utm_medium)" value={filters.medium} onChange={set("medium")} options={mediumOptions} />
          <TextFilter label="Marketing campaign (utm_campaign)" value={filters.campaign} onChange={set("campaign")} placeholder="ramadan2027" />
          <Select label="Attribution touch" value={filters.touch} onChange={set("touch")} options={[
            { value: "", label: "First or last" },
            { value: "last", label: "Last touch" },
            { value: "first", label: "First touch" },
          ]} />
          <TextFilter label="Term (utm_term)" value={filters.term} onChange={set("term")} placeholder="utm_term" />
          <TextFilter label="Content (utm_content)" value={filters.content} onChange={set("content")} placeholder="utm_content" />
          <Select label="Transaction status" value={filters.transactionStatus} onChange={set("transactionStatus")} options={TX_STATUSES} />
          <TextFilter label="HCI Donation ID" value={filters.donationId} onChange={set("donationId")} placeholder="Invoice id" />
          <TextFilter label="Donor email" value={filters.email} onChange={set("email")} placeholder="donor@example.com" />
          <TextFilter label="Payment transaction ID" value={filters.paymentTransactionId} onChange={set("paymentTransactionId")} placeholder="pi_… / order id" />
        </div>
      ) : null}
    </section>
  );
};

export default ReportFilterBar;

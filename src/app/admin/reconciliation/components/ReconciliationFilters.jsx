"use client";

import { RECON_STATUS } from "@/utils/errorMaps";

const PROVIDER_OPTIONS = [
  { value: "", label: "All Providers" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "braintree", label: "Braintree" },
  { value: "adyen", label: "Adyen" },
  { value: "checkout", label: "Checkout.com" },
];

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function toggleInArray(arr, value) {
  const a = Array.isArray(arr) ? [...arr] : [];
  const idx = a.indexOf(value);
  if (idx >= 0) a.splice(idx, 1);
  else a.push(value);
  return a;
}

const ReconciliationFilters = ({
  provider,
  statuses,
  limit,
  dateFrom,
  dateTo,
  onChangeProvider,
  onChangeStatuses,
  onChangeLimit,
  onChangeDateFrom,
  onChangeDateTo,
}) => {
  const currentStatuses = Array.isArray(statuses) ? statuses : [];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
          <FilterIcon />
        </span>
        <select
          value={provider || ""}
          onChange={(e) => onChangeProvider?.(e.target.value)}
          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        >
          {PROVIDER_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(RECON_STATUS).map(([key, entry]) => {
              const active = currentStatuses.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChangeStatuses?.(toggleInArray(currentStatuses, key))}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    active
                      ? `border-transparent ${entry.className}`
                      : "border-dashed border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
            <CalendarIcon />
          </span>
          <div className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#E5E7EB] bg-white pl-9 pr-1.5 py-1">
            <input
              type="date"
              value={dateFrom || ""}
              onChange={(e) => onChangeDateFrom?.(e.target.value)}
              className="rounded-lg bg-transparent px-1 py-2 text-[13px] text-[#111827] outline-none"
              title="From date (inclusive)"
            />
            <span className="text-[12px] text-[#9CA3AF]">→</span>
            <input
              type="date"
              value={dateTo || ""}
              onChange={(e) => onChangeDateTo?.(e.target.value)}
              className="rounded-lg bg-transparent px-1 py-2 text-[13px] text-[#111827] outline-none"
              title="To date (inclusive)"
            />
          </div>
        </div>

        <select
          value={String(limit || "20")}
          onChange={(e) => onChangeLimit?.(e.target.value)}
          className="w-full md:w-[130px] rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>
    </div>
  );
};

export default ReconciliationFilters;

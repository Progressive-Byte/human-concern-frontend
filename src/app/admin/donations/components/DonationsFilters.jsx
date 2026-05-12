"use client";

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

export default function DonationsFilters({
  q,
  status,
  limit,
  datePreset,
  from,
  to,
  onChangeQ,
  onChangeStatus,
  onChangeLimit,
  onChangeDatePreset,
  onChangeFrom,
  onChangeTo,
}) {
  const preset = String(datePreset || "all");
  const showCustom = preset === "custom";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={q}
          onChange={(e) => onChangeQ?.(e.target.value)}
          placeholder="Search by donor, email, or campaign..."
          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
            <FilterIcon />
          </span>
          <select
            value={status}
            onChange={(e) => onChangeStatus?.(e.target.value)}
            className="w-full md:w-[160px] rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="processing">Processing</option>
          </select>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
            <CalendarIcon />
          </span>
          <select
            value={preset}
            onChange={(e) => onChangeDatePreset?.(e.target.value)}
            className="w-full md:w-[160px] rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="thisMonth">This month</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <select
          value={String(limit || "20")}
          onChange={(e) => onChangeLimit?.(e.target.value)}
          className="w-full md:w-[130px] rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      {showCustom ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:justify-end">
          <input
            type="date"
            value={from || ""}
            onChange={(e) => onChangeFrom?.(e.target.value)}
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          />
          <input
            type="date"
            value={to || ""}
            onChange={(e) => onChangeTo?.(e.target.value)}
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          />
        </div>
      ) : null}
    </div>
  );
}

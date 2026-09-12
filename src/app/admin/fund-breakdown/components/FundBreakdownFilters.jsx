"use client";

import MultiSelectFilter from "./MultiSelectFilter";

const FIELD =
  "w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30";

const ICON_WRAP = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

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
      <path d="M8 4V2M16 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 6h16v14H4V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const FundBreakdownFilters = ({
  q,
  onChangeQ,
  from,
  to,
  onChangeFrom,
  onChangeTo,
  currency,
  currencies = [],
  onChangeCurrency,
  campaigns = [],
  campaignIds = [],
  onChangeCampaignIds,
  forms = [],
  formIds = [],
  onChangeFormIds,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <SearchIcon />
          </span>
          <input
            value={q}
            onChange={(e) => onChangeQ?.(e.target.value)}
            placeholder="Search by fund code or cause..."
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <span className={ICON_WRAP}>
              <CalendarIcon />
            </span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => onChangeFrom?.(e.target.value)}
              className={`${FIELD} pl-9 md:w-[170px]`}
              aria-label="First payment from"
            />
          </div>

          <div className="relative">
            <span className={ICON_WRAP}>
              <CalendarIcon />
            </span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => onChangeTo?.(e.target.value)}
              className={`${FIELD} pl-9 md:w-[170px]`}
              aria-label="First payment to"
            />
          </div>

          <div className="relative">
            <span className={ICON_WRAP}>
              <FilterIcon />
            </span>
            <select
              value={currency}
              onChange={(e) => onChangeCurrency?.(e.target.value)}
              className={`${FIELD} pl-9 md:w-[160px]`}
            >
              <option value="">All Currencies</option>
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <MultiSelectFilter
          options={campaigns}
          value={campaignIds}
          onChange={onChangeCampaignIds}
          placeholder="All Campaigns"
        />
        <MultiSelectFilter options={forms} value={formIds} onChange={onChangeFormIds} placeholder="All Forms" />
      </div>
    </div>
  );
};

export default FundBreakdownFilters;

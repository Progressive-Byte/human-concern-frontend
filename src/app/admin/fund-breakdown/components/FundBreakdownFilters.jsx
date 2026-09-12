"use client";

import MultiSelectFilter from "./MultiSelectFilter";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#383838] outline-none transition focus:border-[#171717]/30";

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
  onReset,
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div>
        <label className="mb-1 block text-[12px] font-medium text-[#383838]">Search</label>
        <input
          value={q}
          onChange={(event) => onChangeQ(event.target.value)}
          placeholder="Fund code or cause…"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[#383838]">First payment from</label>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onChangeFrom(event.target.value)}
          className={`${INPUT_CLASS} cursor-pointer`}
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[#383838]">First payment to</label>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onChangeTo(event.target.value)}
          className={`${INPUT_CLASS} cursor-pointer`}
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-[#383838]">Currency</label>
        <select
          value={currency}
          onChange={(event) => onChangeCurrency(event.target.value)}
          className={`${INPUT_CLASS} cursor-pointer bg-white`}
        >
          <option value="">All currencies</option>
          {currencies.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <MultiSelectFilter
        label="Campaign"
        options={campaigns}
        value={campaignIds}
        onChange={onChangeCampaignIds}
        placeholder="All campaigns"
      />

      <MultiSelectFilter
        label="Form"
        options={forms}
        value={formIds}
        onChange={onChangeFormIds}
        placeholder="All forms"
      />
    </div>

    <div className="flex justify-end">
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer text-[12px] font-medium text-[#EA3335] hover:underline"
      >
        Reset filters
      </button>
    </div>
  </div>
);

export default FundBreakdownFilters;

"use client";

import SettingsSectionCard from "../SettingsSectionCard";

const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD" },
  { label: "GBP (£)", value: "GBP" },
  { label: "EUR (€)", value: "EUR" },
  { label: "CAD (CA$)", value: "CAD" },
  { label: "AED", value: "AED" },
];

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 3v5h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function RateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M4 7h11M4 12h7M4 17h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 7l2 2 2-2M20 9V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 17l2-2 2 2M20 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function updateRateRow(list, index, patch) {
  return list.map((item, itemIndex) => (itemIndex === index ? { ...(item || {}), ...(patch || {}) } : item));
}

const ExchangeRatesTab = ({ value, onChange, loading, saving, onSave }) => {
  const rates = Array.isArray(value) ? value : [];

  function setRate(index, patch) {
    onChange?.(updateRateRow(rates, index, patch));
  }

  function addRate() {
    onChange?.([...(rates || []), { currency: "", rate: "" }]);
  }

  function removeRate(index) {
    onChange?.(rates.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <SettingsSectionCard icon={<RateIcon />} title="Save Exchange Rates" subtitle="Add multiple currencies and the rate value to store for each one">
      <div className="space-y-3">
        {rates.length ? (
          rates.map((item, index) => {
            const rate = item || {};
            return (
              <div key={rate.id || `${rate.currency || "currency"}-${index}`} className="grid grid-cols-1 gap-3 rounded-2xl border border-[#F3F4F6] bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
                <label className="block">
                  <div className="mb-2 text-[13px] font-semibold text-[#111827]">Currency</div>
                  <select
                    value={String(rate.currency || "")}
                    onChange={(e) => setRate(index, { currency: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                  >
                    <option value="">Select currency</option>
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-[13px] font-semibold text-[#111827]">Exchange Rate</div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={String(rate.rate ?? "")}
                    onChange={(e) => setRate(index, { rate: e.target.value })}
                    placeholder="e.g. 3.6725"
                    disabled={loading}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRate(index)}
                    disabled={loading}
                    aria-label="Remove exchange rate"
                    className="inline-flex h-[42px] w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60 md:w-[42px]"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">No exchange rates added.</div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={addRate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            <PlusIcon />
            Add Rate
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#111827]/90 disabled:opacity-60"
          >
            <SaveIcon />
            Save Changes
          </button>
        </div>
      </div>
    </SettingsSectionCard>
  );
};

export default ExchangeRatesTab;

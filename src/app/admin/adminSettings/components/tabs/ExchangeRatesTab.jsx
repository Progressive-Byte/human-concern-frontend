"use client";

import { useState } from "react";
import SettingsSectionCard from "../SettingsSectionCard";
import { SUPPORTED_FORM_CURRENCY_OPTIONS } from "@/utils/currencies";

const SETTINGS_EXCHANGE_RATE_OPTIONS = SUPPORTED_FORM_CURRENCY_OPTIONS.filter((option) => option.code !== "USD");

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

function SyncIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M21 12a9 9 0 0 1-15.36 6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12A9 9 0 0 1 18.36 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 18H3v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ConfirmModal({ open, busy, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close sync confirmation" />
      <div className="relative w-full max-w-[520px] rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <WarningIcon />
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-[#111827]">Sync Exchange Rates?</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#6B7280]">
              Manually entered rates will not be replaced. This will sync the latest available exchange-rate data and then refresh this list.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#111827]/90 disabled:opacity-60"
          >
            {busy ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function updateRateRow(list, index, patch) {
  return list.map((item, itemIndex) => (itemIndex === index ? { ...(item || {}), ...(patch || {}) } : item));
}

const ExchangeRatesTab = ({ value, onChange, loading, saving, syncing, onSave, onSync }) => {
  const rates = Array.isArray(value) ? value : [];
  const [confirmOpen, setConfirmOpen] = useState(false);

  function setRate(index, patch) {
    onChange?.(updateRateRow(rates, index, patch));
  }

  function addRate() {
    onChange?.([...(rates || []), { currency: "", rate: "" }]);
  }

  function removeRate(index) {
    onChange?.(rates.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSyncConfirm() {
    await onSync?.();
    setConfirmOpen(false);
  }

  return (
    <SettingsSectionCard icon={<RateIcon />} title="Exchange Rates" subtitle="Add multiple currencies and the rate value to store for each one">
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
                    disabled={loading || syncing}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                  >
                    <option value="">Select currency</option>
                    {SETTINGS_EXCHANGE_RATE_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
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
                    disabled={loading || syncing}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRate(index)}
                    disabled={loading || syncing}
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
            disabled={loading || syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            <PlusIcon />
            Add Rate
          </button>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={loading || syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            <SyncIcon />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading || syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#111827]/90 disabled:opacity-60"
          >
            <SaveIcon />
            Save Changes
          </button>
        </div>
      </div>

      <ConfirmModal open={confirmOpen} busy={syncing} onClose={() => setConfirmOpen(false)} onConfirm={handleSyncConfirm} />
    </SettingsSectionCard>
  );
};

export default ExchangeRatesTab;

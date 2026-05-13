"use client";

import FieldError from "../FieldError";

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

export default function SuggestedAmountsEditor({ currencyLabel = "", value = [], onChange, disabled, errors }) {
  const items = Array.isArray(value) ? value : [];

  function setItem(idx, patch) {
    onChange?.(
      items.map((it, i) => (i === idx ? { ...(it || {}), ...(patch || {}) } : it))
    );
  }

  function addRow() {
    onChange?.([...(items || []), { value: "", description: "" }]);
  }

  function removeRow(idx) {
    onChange?.(items.filter((_, i) => i !== idx));
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[#111827]">Suggested Amounts</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">Preset donation amounts shown to donors</p>
      </div>

      <div className="space-y-3">
        {items.length ? (
          <div className="space-y-2">
            {items.map((it, idx) => {
              const row = it || {};
              const rowErrors = (errors && typeof errors === "object" ? errors[idx] : null) || {};
              return (
                <div key={row.id || idx} className="rounded-2xl border border-[#F3F4F6] bg-white p-4 transition hover:bg-[#F9FAFB]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <div className="mb-2 text-[13px] font-semibold text-[#111827]">
                          Amount{currencyLabel ? ` (${currencyLabel})` : ""}
                        </div>
                        <input
                          value={String(row.value ?? "")}
                          onChange={(e) => setItem(idx, { value: e.target.value })}
                          inputMode="decimal"
                          placeholder="25"
                          disabled={disabled}
                          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                        />
                        <FieldError message={rowErrors.value} />
                      </div>

                      <div className="md:col-span-2">
                        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Description</div>
                        <input
                          value={String(row.description ?? "")}
                          onChange={(e) => setItem(idx, { description: e.target.value })}
                          placeholder="Small"
                          disabled={disabled}
                          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                        />
                        <FieldError message={rowErrors.description} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={disabled}
                      aria-label="Remove suggested amount"
                      className="mt-7 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
            No suggested amounts added.
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={addRow}
            disabled={disabled}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Add Amount
          </button>
        </div>
      </div>
    </section>
  );
}


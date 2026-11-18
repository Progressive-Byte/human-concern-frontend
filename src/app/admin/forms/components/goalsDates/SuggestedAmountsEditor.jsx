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

const SuggestedAmountsEditor = ({ currencyLabel = "", value = [], onChange, disabled, errors }) => {
  const items = Array.isArray(value) ? value : [];

  function setItem(idx, patch) {
    onChange?.(
      items.map((it, i) => (i === idx ? { ...(it || {}), ...(patch || {}) } : it))
    );
  }

  function setDefault(idx) {
    onChange?.(items.map((it, i) => ({ ...(it || {}), isDefault: i === idx })));
  }

  function addRow() {
    onChange?.([...(items || []), { value: "", description: "" }]);
  }

  function removeRow(idx) {
    const next = items.filter((_, i) => i !== idx);
    if (next.length && !next.some((x) => Boolean(x?.isDefault))) {
      next[0] = { ...(next[0] || {}), isDefault: true };
    }
    onChange?.(next);
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[14px] font-semibold text-[#111827]">Suggested Amounts</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">Preset donation amounts shown to donors</p>
      </div>

      <div className="space-y-2">
        {items.length ? (
          <>
            <div className="hidden gap-2 px-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] sm:grid sm:grid-cols-[120px_minmax(0,1fr)_110px_36px]">
              <span>Amount{currencyLabel ? ` (${currencyLabel})` : ""}</span>
              <span>Description</span>
              <span>Default</span>
              <span />
            </div>

            {items.map((it, idx) => {
              const row = it || {};
              const rowErrors = (errors && typeof errors === "object" ? errors[idx] : null) || {};
              return (
                <div
                  key={row.id || idx}
                  className="flex items-start gap-2 rounded-xl border border-[#F3F4F6] bg-white p-2.5 transition hover:bg-[#F9FAFB]"
                >
                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)_110px]">
                    <div>
                      <input
                        value={String(row.value ?? "")}
                        onChange={(e) => setItem(idx, { value: e.target.value })}
                        inputMode="decimal"
                        placeholder={currencyLabel ? `Amount (${currencyLabel})` : "Amount"}
                        aria-label={`Amount ${idx + 1}`}
                        disabled={disabled}
                        className="w-full rounded-lg border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                      />
                      <FieldError message={rowErrors.value} />
                    </div>

                    <div>
                      <input
                        value={String(row.description ?? "")}
                        onChange={(e) => setItem(idx, { description: e.target.value })}
                        maxLength={120}
                        placeholder="Description (optional)"
                        aria-label={`Description ${idx + 1}`}
                        disabled={disabled}
                        className="w-full rounded-lg border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
                      />
                      <FieldError message={rowErrors.description} />
                    </div>

                    <label className="flex h-10 items-center gap-2 rounded-lg border border-solid border-[#E5E7EB] bg-white px-2.5 text-[13px] text-[#111827]">
                      <input
                        type="radio"
                        name="suggestedAmountDefault"
                        checked={Boolean(row.isDefault)}
                        onChange={() => setDefault(idx)}
                        disabled={disabled}
                        className="h-4 w-4"
                        style={{ accentColor: "var(--admin-accent-600, #111827)" }}
                      />
                      <span className={Boolean(row.isDefault) ? "font-semibold" : "text-[#6B7280]"}>Default</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={disabled}
                    aria-label="Remove suggested amount"
                    className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
                  >
                    <TrashIcon />
                  </button>
                </div>
              );
            })}
          </>
        ) : (
          <div className="rounded-xl border border-solid border-[#E5E7EB] bg-white p-3 text-[13px] text-[#6B7280]">
            No suggested amounts added.
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={addRow}
            disabled={disabled}
            className="cursor-pointer rounded-lg border border-solid border-[#E5E7EB] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Add Amount
          </button>
        </div>
      </div>
    </section>
  );
}

export default SuggestedAmountsEditor;

"use client";

const MAX_PRESETS = 12;

/*
  Amounts are typed by hand, so anything that is not a number is dropped as it is typed. One decimal
  point with at most two places is kept, because the value is money. This also covers a pasted value.
*/
function toAmountInput(raw) {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");

  if (dot === -1) return cleaned;

  const whole = cleaned.slice(0, dot) || "0";
  const decimals = cleaned
    .slice(dot + 1)
    .replace(/\./g, "")
    .slice(0, 2);

  return `${whole}.${decimals}`;
}

/*
  One list of amount rows, used for both the one-time amounts and the monthly ones.

  `collapsed` hides the rows and the Add button, so a section that is switched off can still show its
  title and its switch. `toggle` is a slot for that switch, sitting on the right of the title.
*/
const PresetListEditor = ({ title, hint, amountPlaceholder = "Amount", presets = [], onChange, onDirty, disabled = false, toggle = null, collapsed = false }) => {
  const rows = Array.isArray(presets) ? presets : [];

  function updateRow(index, patch) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    onDirty?.();
  }

  function addRow() {
    if (rows.length >= MAX_PRESETS) return;
    onChange([...rows, { amount: "", description: "" }]);
    onDirty?.();
  }

  function removeRow(index) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
    onDirty?.();
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">{title}</h2>
          {hint ? <p className="mt-1 text-[13px] text-[#6B7280]">{hint}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {collapsed ? null : (
            <div className="text-[13px] text-[#6B7280]">
              <span className="font-semibold text-[#111827]">{rows.length}</span> of {MAX_PRESETS}
            </div>
          )}
          {toggle}
        </div>
      </div>

      <div className="mt-4 space-y-3" hidden={collapsed}>
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:flex-row sm:items-center"
          >
            <div className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 sm:w-[150px]">
              <input
                value={row?.amount ?? ""}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={disabled}
                onChange={(e) => updateRow(index, { amount: toAmountInput(e.target.value) })}
                placeholder={amountPlaceholder}
                className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
              <input
                value={row?.description ?? ""}
                maxLength={300}
                disabled={disabled}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                placeholder="What it provides (optional)"
                className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={disabled || rows.length <= 1}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4" hidden={collapsed}>
        <button
          type="button"
          onClick={addRow}
          disabled={disabled || rows.length >= MAX_PRESETS}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
        >
          Add amount
        </button>
      </div>
    </section>
  );
}

export default PresetListEditor;

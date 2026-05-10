function InputRow({ input, index, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[13px] font-semibold text-[#111827]">Input #{index + 1}</div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Remove
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Key</div>
          <input
            value={String(input?.key || "")}
            onChange={(e) => onChange({ ...input, key: e.target.value })}
            placeholder="e.g. persons"
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          />
          <div className="mt-1 text-[12px] text-[#6B7280]">Must match: a-z, 0-9, underscore (starts with a letter).</div>
        </div>

        <div>
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Label</div>
          <input
            value={String(input?.label || "")}
            onChange={(e) => onChange({ ...input, label: e.target.value })}
            placeholder="e.g. Number of persons"
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
          />
        </div>
      </div>
    </div>
  );
}

export default function PricingBuilder({ mode, pricing, baseUnitAmount, onChangeMode, onChangePricing }) {
  const m = String(mode || "fixed");
  const p = pricing || {};
  const inputs = Array.isArray(p.inputs) ? p.inputs : [];

  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[#111827]">Pricing</div>
          <div className="mt-1 text-[12px] text-[#6B7280]">Use fixed price or a formula with inputs.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeMode?.("fixed")}
            className={`rounded-xl border border-dashed px-3 py-2 text-[13px] font-semibold transition ${
              m === "fixed" ? "border-red-600 bg-red-600 text-white" : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            Fixed
          </button>
          <button
            type="button"
            onClick={() => onChangeMode?.("formula")}
            className={`rounded-xl border border-dashed px-3 py-2 text-[13px] font-semibold transition ${
              m === "formula" ? "border-red-600 bg-red-600 text-white" : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            Formula
          </button>
        </div>
      </div>

      {m === "formula" ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Base Unit Amount</div>
              <input
                value={String(baseUnitAmount ?? "")}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-[13px] text-[#111827] outline-none"
              />
              <div className="mt-1 text-[12px] text-[#6B7280]">Used as variable: baseUnitAmount</div>
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Formula</div>
              <input
                value={String(p.formula || "")}
                onChange={(e) => onChangePricing?.({ ...p, formula: e.target.value })}
                placeholder="e.g. baseUnitAmount * persons"
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-semibold text-[#111827]">Inputs</div>
            <button
              type="button"
              onClick={() =>
                onChangePricing?.({
                  ...p,
                  inputs: [
                    ...inputs,
                    { key: "", label: "" },
                  ],
                })
              }
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Add Input
            </button>
          </div>

          <div className="space-y-3">
            {inputs.length === 0 ? <div className="text-[12px] text-[#6B7280]">No inputs yet.</div> : null}
            {inputs.map((inp, idx) => (
              <InputRow
                key={`${idx}`}
                input={inp}
                index={idx}
                onChange={(next) => {
                  const copy = [...inputs];
                  copy[idx] = next;
                  onChangePricing?.({ ...p, inputs: copy });
                }}
                onRemove={() => {
                  const copy = inputs.filter((_, i) => i !== idx);
                  onChangePricing?.({ ...p, inputs: copy });
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3 text-[12px] text-[#6B7280]">
          Fixed pricing uses the top-level Amount field.
        </div>
      )}
    </div>
  );
}

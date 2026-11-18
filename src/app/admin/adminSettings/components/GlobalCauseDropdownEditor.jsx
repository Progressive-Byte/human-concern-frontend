"use client";

export const GLOBAL_CAUSE_DROPDOWN_KEY = "global_cause_dropdown";

const INPUT_CLASS =
  "w-full rounded-lg border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60";

function buildEmptyField() {
  return {
    key: GLOBAL_CAUSE_DROPDOWN_KEY,
    type: "select",
    label: "",
    required: false,
    helpText: "",
    options: [
      { label: "", value: "" },
      { label: "", value: "" },
    ],
  };
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

export default function GlobalCauseDropdownEditor({ value = null, onChange, disabled = false }) {
  const field = value && typeof value === "object" ? value : null;
  const options = Array.isArray(field?.options) ? field.options : [];

  function replaceField(next) {
    onChange?.(next);
  }

  function patchField(patch) {
    if (!field) return;
    replaceField({ ...field, ...patch });
  }

  function setOption(index, patch) {
    patchField({
      options: options.map((option, i) => (i === index ? { ...option, ...patch } : option)),
    });
  }

  function addOption() {
    patchField({ options: [...options, { label: "", value: "" }] });
  }

  function removeOption(index) {
    patchField({ options: options.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-[13px] text-[#111827]">
        <input
          type="checkbox"
          checked={Boolean(field)}
          onChange={(e) => replaceField(e.target.checked ? buildEmptyField() : null)}
          disabled={disabled}
          className="h-4 w-4"
          style={{ accentColor: "var(--admin-accent-600, #111827)" }}
        />
        Show this dropdown on every advanced donation form
      </label>

      {field ? (
        <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-[13px] font-semibold text-[#111827]">Question</div>
              <input
                value={String(field.label || "")}
                onChange={(e) => patchField({ label: e.target.value })}
                placeholder="e.g. How did you hear about us?"
                disabled={disabled}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <div className="mb-1 text-[13px] font-semibold text-[#111827]">Helper text (optional)</div>
              <input
                value={String(field.helpText || "")}
                onChange={(e) => patchField({ helpText: e.target.value })}
                placeholder="Shown under the dropdown"
                disabled={disabled}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[#111827]">
            <input
              type="checkbox"
              checked={field.required === true}
              onChange={(e) => patchField({ required: e.target.checked })}
              disabled={disabled}
              className="h-4 w-4"
              style={{ accentColor: "var(--admin-accent-600, #111827)" }}
            />
            Donor must choose an option
          </label>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Dropdown options</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Add at least two options.</div>
              </div>
              <button
                type="button"
                onClick={addOption}
                disabled={disabled}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Add option
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {options.map((option, index) => (
                <div key={option.id || index} className="grid grid-cols-1 gap-2 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <div className="mb-1 text-[13px] font-semibold text-[#111827]">Label</div>
                    <input
                      value={String(option.label || "")}
                      onChange={(e) => setOption(index, { label: e.target.value })}
                      placeholder="e.g. Social media"
                      disabled={disabled}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-1 text-[13px] font-semibold text-[#111827]">Value</div>
                    <input
                      value={String(option.value || "")}
                      onChange={(e) => setOption(index, { value: e.target.value })}
                      placeholder="e.g. social"
                      disabled={disabled}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <div className="mb-1 text-[13px] font-semibold text-[#111827]">Remove</div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={disabled}
                      aria-label="Remove option"
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

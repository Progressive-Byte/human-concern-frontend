"use client";

import { useState } from "react";
import FieldError from "../FieldError";

const TYPE_OPTIONS = [
  { value: "input", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Multiple choice" },
  { value: "checkbox", label: "Checkbox" },
];

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

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckField({ label, checked, onChange, disabled }) {
  return (
    <label className="flex h-[42px] items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827]">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4"
        style={{ accentColor: "var(--admin-accent-600, #111827)" }}
      />
      <span className={checked ? "font-semibold" : "text-[#6B7280]"}>{label}</span>
    </label>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60";

const CustomNotesEditor = ({ value = [], onChange, disabled, errors, addButtonClassName = "" }) => {
  const notes = Array.isArray(value) ? value : [];
  const [advancedOpen, setAdvancedOpen] = useState({});

  function setNote(idx, patch) {
    onChange?.(notes.map((n, i) => (i === idx ? { ...(n || {}), ...(patch || {}) } : n)));
  }

  function removeNote(idx) {
    onChange?.(notes.filter((_, i) => i !== idx));
  }

  function addNote() {
    onChange?.([
      ...(notes || []),
      {
        type: "input",
        label: "",
        required: false,
        helpText: "",
        placeholder: "",
        defaultValue: "",
        options: [{ label: "", value: "" }, { label: "", value: "" }],
      },
    ]);
  }

  function setOption(noteIdx, optIdx, patch) {
    const current = notes[noteIdx] || {};
    const options = Array.isArray(current.options) ? current.options : [];
    const nextOptions = options.map((o, i) => (i === optIdx ? { ...(o || {}), ...(patch || {}) } : o));
    setNote(noteIdx, { options: nextOptions });
  }

  function addOption(noteIdx) {
    const current = notes[noteIdx] || {};
    const options = Array.isArray(current.options) ? current.options : [];
    setNote(noteIdx, { options: [...options, { label: "", value: "" }] });
  }

  function removeOption(noteIdx, optIdx) {
    const current = notes[noteIdx] || {};
    const options = Array.isArray(current.options) ? current.options : [];
    const nextOptions = options.filter((_, i) => i !== optIdx);
    setNote(noteIdx, { options: nextOptions });
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[#111827]">Custom Notes</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Extra questions asked at checkout. Give it a label, pick an answer type, and you&apos;re done.
        </p>
      </div>

      <div className="space-y-3">
        {notes.length ? (
          <div className="space-y-2">
            {notes.map((note, idx) => {
              const n = note || {};
              const type = String(n.type || "input");
              const noteErrors = (errors && typeof errors === "object" ? errors[idx] : null) || {};
              const options = Array.isArray(n.options) ? n.options : [];
              const optionsErrors = Array.isArray(noteErrors.options) ? noteErrors.options : [];
              const showOptions = type === "select" || type === "radio";
              const showPlaceholder = type === "input" || type === "textarea";
              const showDefaultString = type === "input" || type === "textarea" || type === "select" || type === "radio";
              const showDefaultBoolean = type === "checkbox";

              const hasAdvancedValue = showPlaceholder
                ? Boolean(String(n.placeholder ?? "").trim()) || Boolean(String(n.defaultValue ?? "").trim())
                : showDefaultBoolean
                  ? Boolean(n.defaultValue)
                  : Boolean(String(n.defaultValue ?? "").trim());
              const advancedKey = String(n.id || idx);
              const isAdvancedOpen = advancedOpen[advancedKey] !== undefined ? advancedOpen[advancedKey] : hasAdvancedValue;

              return (
                <div key={n.id || idx} className="rounded-2xl border border-[#F3F4F6] bg-white p-4 transition hover:bg-[#F9FAFB]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Question</div>
                        <input
                          value={String(n.label ?? "")}
                          onChange={(e) => setNote(idx, { label: e.target.value })}
                          placeholder="e.g. Zakat year"
                          disabled={disabled}
                          className={INPUT_CLASS}
                        />
                        <FieldError message={noteErrors.label} />
                      </div>

                      <div className="md:col-span-1">
                        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Answer type</div>
                        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5">
                          <select
                            value={type}
                            onChange={(e) => setNote(idx, { type: e.target.value })}
                            disabled={disabled}
                            className="w-full bg-transparent text-[13px] text-[#111827] outline-none disabled:opacity-60"
                          >
                            {TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <FieldError message={noteErrors.type} />
                      </div>

                      <div className="md:col-span-2">
                        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Helper text (optional)</div>
                        <input
                          value={String(n.helpText ?? "")}
                          onChange={(e) => setNote(idx, { helpText: e.target.value })}
                          placeholder="Shown under the field at checkout"
                          disabled={disabled}
                          className={INPUT_CLASS}
                        />
                        <FieldError message={noteErrors.helpText} />
                      </div>

                      <div className="md:col-span-1">
                        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Required</div>
                        <CheckField
                          label="Donor must fill this in"
                          checked={Boolean(n.required)}
                          onChange={(checked) => setNote(idx, { required: checked })}
                          disabled={disabled}
                        />
                        <FieldError message={noteErrors.required} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNote(idx)}
                      disabled={disabled}
                      aria-label="Remove custom note"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {showOptions ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-semibold text-[#111827]">Choices</div>
                          <div className="mt-1 text-[12px] text-[#6B7280]">At least 2. The stored value must be unique.</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addOption(idx)}
                          disabled={disabled}
                          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
                        >
                          Add choice
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {options.map((opt, optIdx) => {
                          const o = opt || {};
                          const oErr = (optionsErrors && typeof optionsErrors === "object" ? optionsErrors[optIdx] : null) || {};
                          return (
                            <div key={o.id || optIdx} className="grid grid-cols-1 gap-3 md:grid-cols-5">
                              <div className="md:col-span-2">
                                <div className="mb-2 text-[12px] font-semibold text-[#111827]">Label</div>
                                <input
                                  value={String(o.label ?? "")}
                                  onChange={(e) => setOption(idx, optIdx, { label: e.target.value })}
                                  placeholder="e.g. Zakat"
                                  disabled={disabled}
                                  className={INPUT_CLASS}
                                />
                                <FieldError message={oErr.label} />
                              </div>

                              <div className="md:col-span-2">
                                <div className="mb-2 text-[12px] font-semibold text-[#111827]">Value</div>
                                <input
                                  value={String(o.value ?? "")}
                                  onChange={(e) => setOption(idx, optIdx, { value: e.target.value })}
                                  placeholder="e.g. zakat"
                                  disabled={disabled}
                                  className={INPUT_CLASS}
                                />
                                <FieldError message={oErr.value} />
                              </div>

                              <div className="md:col-span-1">
                                <div className="mb-2 text-[12px] font-semibold text-[#111827]">Remove</div>
                                <button
                                  type="button"
                                  onClick={() => removeOption(idx, optIdx)}
                                  disabled={disabled}
                                  className="inline-flex h-[42px] w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <FieldError message={noteErrors.optionsMessage} />
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen((prev) => ({ ...prev, [advancedKey]: !isAdvancedOpen }))}
                      className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[12px] font-semibold text-[#6B7280] transition hover:text-[#111827]"
                    >
                      <ChevronIcon open={isAdvancedOpen} />
                      Advanced options
                    </button>

                    {isAdvancedOpen ? (
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {showPlaceholder ? (
                          <div className="md:col-span-2">
                            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Placeholder (optional)</div>
                            <input
                              value={String(n.placeholder ?? "")}
                              onChange={(e) => setNote(idx, { placeholder: e.target.value })}
                              placeholder="Grey example text inside the field"
                              disabled={disabled}
                              className={INPUT_CLASS}
                            />
                            <FieldError message={noteErrors.placeholder} />
                          </div>
                        ) : null}

                        {showDefaultString ? (
                          <div className={showPlaceholder ? "md:col-span-1" : "md:col-span-3"}>
                            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Pre-filled answer (optional)</div>
                            {type === "select" || type === "radio" ? (
                              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5">
                                <select
                                  value={String(n.defaultValue ?? "")}
                                  onChange={(e) => setNote(idx, { defaultValue: e.target.value })}
                                  disabled={disabled}
                                  className="w-full bg-transparent text-[13px] text-[#111827] outline-none disabled:opacity-60"
                                >
                                  <option value="">No default</option>
                                  {options.map((o, oIdx) => {
                                    const value = String((o && o.value) || "").trim();
                                    if (!value) return null;
                                    return (
                                      <option key={`${value}-${oIdx}`} value={value}>
                                        {String((o && o.label) || "").trim() || value}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            ) : (
                              <input
                                value={String(n.defaultValue ?? "")}
                                onChange={(e) => setNote(idx, { defaultValue: e.target.value })}
                                placeholder="Leave blank for none"
                                disabled={disabled}
                                className={INPUT_CLASS}
                              />
                            )}
                            <FieldError message={noteErrors.defaultValue} />
                          </div>
                        ) : null}

                        {showDefaultBoolean ? (
                          <div className="md:col-span-3">
                            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Pre-filled answer</div>
                            <CheckField
                              label={Boolean(n.defaultValue) ? "Checked by default" : "Unchecked by default"}
                              checked={Boolean(n.defaultValue)}
                              onChange={(checked) => setNote(idx, { defaultValue: checked })}
                              disabled={disabled}
                            />
                            <FieldError message={noteErrors.defaultValue} />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
            No custom notes added.
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={addNote}
            disabled={disabled}
            className={`cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60 ${addButtonClassName}`.trim()}
          >
            Add Note
          </button>
        </div>
      </div>
    </section>
  );
}
export default CustomNotesEditor;

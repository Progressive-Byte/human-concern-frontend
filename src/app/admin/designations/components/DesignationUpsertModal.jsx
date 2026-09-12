"use client";

import { useState } from "react";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#383838] outline-none transition focus:border-[#171717]/30";

// Rendered only while open (and keyed by the row being edited), so initial state is seeded on
// mount instead of being synced in an effect.
const DesignationUpsertModal = ({ initial, saving, error, onClose, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [touched, setTouched] = useState(false);

  const nameMissing = touched && !name.trim();
  const codeMissing = touched && !code.trim();

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (!name.trim() || !code.trim()) return;
    onSubmit({ name: name.trim(), code: code.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-[16px] font-semibold text-[#171717]">
          {initial ? "Edit designation" : "New designation"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#383838]">
              Designation name <span className="text-[#EA3335]">*</span>
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. AF - Afghanistan"
              className={INPUT_CLASS}
            />
            {nameMissing ? <p className="mt-1 text-[11px] text-[#EA3335]">Designation name is required.</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#383838]">
              Designation code / ID <span className="text-[#EA3335]">*</span>
            </label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. 100"
              className={INPUT_CLASS}
            />
            {codeMissing ? <p className="mt-1 text-[11px] text-[#EA3335]">Designation code is required.</p> : null}
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-600">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#383838] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-xl bg-[#171717] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : initial ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignationUpsertModal;

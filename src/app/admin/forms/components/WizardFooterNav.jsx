"use client";

export default function WizardFooterNav({ onBack, onSave, onNext, backDisabled, saving, nextLabel = "Next" }) {
  return (
    <div className="sticky bottom-0">
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled || saving}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={saving}
              className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

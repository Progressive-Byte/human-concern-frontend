"use client";

const WizardFooterNav = ({
  onBack,
  onSave,
  onNext,
  backDisabled,
  saveDisabled,
  nextDisabled,
  saving,
  nextLabel = "Next",
  previewHref = "",
  previewDisabled,
  previewLabel = "Preview Donation Form",
}) => {
  const canPreview = Boolean(String(previewHref || "").trim());
  const previewIsDisabled = Boolean(previewDisabled ?? saving) || !canPreview;

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
              disabled={saveDisabled || saving}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            {canPreview ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={previewIsDisabled}
                tabIndex={previewIsDisabled ? -1 : 0}
                onClick={(e) => {
                  if (previewIsDisabled) e.preventDefault();
                }}
                className={`cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] ${
                  previewIsDisabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
                }`}
              >
                {previewLabel}
              </a>
            ) : null}
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled || saving}
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
export default WizardFooterNav;

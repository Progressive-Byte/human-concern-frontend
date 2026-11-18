"use client";

import { useState } from "react";

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

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
  const [moreOpen, setMoreOpen] = useState(false);
  const canPreview = Boolean(String(previewHref || "").trim());
  const previewIsDisabled = Boolean(previewDisabled ?? saving) || !canPreview;
  const saveIsDisabled = Boolean(saveDisabled || saving);

  return (
    <div className="sticky bottom-0 z-30 -mx-3 border-t border-[#E5E7EB] bg-white/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-4 lg:py-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled || saving}
          className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        >
          Back
        </button>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saveIsDisabled}
            className="hidden cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
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
              className={`hidden cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] sm:inline-flex ${
                previewIsDisabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
              }`}
            >
              {previewLabel}
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-label="More actions"
            aria-expanded={moreOpen}
            className="grid size-9 cursor-pointer place-items-center rounded-xl border border-solid border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] sm:hidden"
          >
            <MoreIcon />
          </button>

          {moreOpen ? (
            <div className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-xl sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onSave?.();
                }}
                disabled={saveIsDisabled}
                className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
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
                    setMoreOpen(false);
                    if (previewIsDisabled) e.preventDefault();
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] ${
                    previewIsDisabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {previewLabel}
                </a>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || saving}
            className="cursor-pointer rounded-xl bg-red-600 px-3 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            {saving ? "Saving..." : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardFooterNav;

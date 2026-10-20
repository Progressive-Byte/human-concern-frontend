"use client";

/*
  The Save draft / Publish / Discard draft row plus its badges.
  Save draft is off until something changed, Discard is off when nothing is pending, and Publish
  always saves first so it publishes exactly what is on screen.
*/
const SimpleFormControls = ({
  isBusy,
  isDirty,
  hasDraft,
  publishedAt,
  message,
  messageTone = "ok",
  onSave,
  onPublish,
  onPreview,
  onDiscard,
}) => {
  return (
    <div className="hc-animate-fade-up space-y-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status on the left, actions on the right, the same way the advanced form lays its bar out. */}
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          {isDirty ? (
            <span className="rounded-full bg-red-600/10 px-3 py-1 font-semibold text-[#111827]">Unsaved changes</span>
          ) : null}
          {hasDraft && !isDirty ? (
            <span className="rounded-full bg-red-600/10 px-3 py-1 font-semibold text-[#111827]">Draft not published</span>
          ) : null}

          <span className="text-[#6B7280]">
            {publishedAt
              ? `Live version last published ${new Date(publishedAt).toLocaleString()}`
              : "Nothing is live until you publish."}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isBusy || !isDirty}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
          >
            Save draft
          </button>

          <button
            type="button"
            onClick={onPreview}
            disabled={isBusy}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={onPublish}
            disabled={isBusy}
            className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
          >
            Publish
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={isBusy || !hasDraft}
            className="cursor-pointer rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:text-[#D1D5DB]"
          >
            Discard draft
          </button>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-[13px] ${
            messageTone === "bad"
              ? "border border-red-500/30 bg-red-500/10 text-red-600"
              : "bg-[#F9FAFB] text-[#111827]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default SimpleFormControls;

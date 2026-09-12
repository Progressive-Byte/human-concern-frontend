"use client";

const UnsavedChangesDialog = ({ open, saving, error, onSave, onDiscard, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close unsaved changes dialog"
        className="absolute inset-0 cursor-pointer bg-black/40"
        onClick={onCancel}
      />
      <div className="hc-animate-dropdown relative w-full max-w-[520px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="text-center text-[16px] font-semibold text-[#111827]">You have unsaved changes</div>
        <div className="mt-2 text-center text-sm text-[#6B7280]">
          Save your changes before leaving, or discard them. Discarded changes cannot be recovered.
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel / Stay
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;

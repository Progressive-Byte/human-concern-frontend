"use client";

export default function DonationsPagination({ pagination, onPrev, onNext, showingLabel }) {
  const page = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const total = Number(pagination?.total || 0);
  const limit = Number(pagination?.limit || 20);

  const hasPrev = typeof pagination?.hasPrev === "boolean" ? pagination.hasPrev : page > 1;
  const hasNext = typeof pagination?.hasNext === "boolean" ? pagination.hasNext : page < totalPages;

  const shown = Math.min(total || 0, page * limit);
  const label = typeof showingLabel === "function" ? showingLabel(shown, total || shown) : `Showing ${shown} of ${total || shown} transactions`;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#F3F4F6] px-5 py-4">
      <div className="text-[13px] text-[#6B7280]">{label}</div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}


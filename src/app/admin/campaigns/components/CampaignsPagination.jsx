export default function CampaignsPagination({ pagination, onPrev, onNext }) {
  const page = Number(pagination?.page || 1);
  const pages = Number(pagination?.pages || 1);
  const hasPrev = Boolean(pagination?.hasPrev);
  const hasNext = Boolean(pagination?.hasNext);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#F3F4F6] px-5 py-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="text-[13px] text-[#6B7280]">
        Page <span className="text-[#111827] font-medium">{page}</span> of{" "}
        <span className="text-[#111827] font-medium">{pages}</span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}


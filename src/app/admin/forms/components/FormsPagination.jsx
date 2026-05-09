"use client";

export default function FormsPagination({ pagination, onPrev, onNext }) {
  if (!pagination) return null;

  const page = Number(pagination?.page || 1);
  const limit = Number(pagination?.limit || 10);
  const total = Number(pagination?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return (
    <div className="flex items-center justify-between gap-4 border-t border-[#F3F4F6] px-5 py-4">
      <div className="text-[12px] text-[#6B7280]">
        Page <span className="font-semibold text-[#111827]">{page}</span> of{" "}
        <span className="font-semibold text-[#111827]">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}


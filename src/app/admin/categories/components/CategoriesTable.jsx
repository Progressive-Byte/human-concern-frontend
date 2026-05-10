import CategoryRowActions from "./CategoryRowActions";
import CategoryStatusPill from "./CategoryStatusPill";

function SkeletonRows() {
  return (
    <div className="space-y-3 px-5 py-4">
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
    </div>
  );
}

function PaginationBar({ pagination, onPrev, onNext }) {
  if (!pagination) return null;

  const page = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  return (
    <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
      <div className="text-[12px] text-[#6B7280]">
        Page <span className="font-semibold text-[#111827]">{page}</span> of{" "}
        <span className="font-semibold text-[#111827]">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function CategoriesTable({ items, loading, pagination, onPrevPage, onNextPage, onEdit, onDelete }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Categories</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No categories found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Category</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => (
                <tr
                  key={item?.id || item?.name}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-[#111827]">{item?.name || "—"}</div>
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <CategoryStatusPill status={item?.status} />
                  </td>

                  <td className="py-4 pr-5 align-top text-right">
                    <CategoryRowActions item={item} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
    </section>
  );
}

import Toggle from "@/components/ui/Toggle";
import AddOnRowActions from "./AddOnRowActions";
import AddOnStatusPill from "./AddOnStatusPill";
import { formatCurrency } from "@/utils/helpers";

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

function pricingTypeLabel(pricing) {
  const t = String(pricing?.type || "").toLowerCase();
  if (t === "formula") return "Formula";
  return "Fixed";
}

export default function AddOnsTable({
  items,
  loading,
  pagination,
  onPrevPage,
  onNextPage,
  onEdit,
  onToggleEnabled,
  onArchive,
  onRestore,
}) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Add-Ons</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No add-ons found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Add-On</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Pricing Type</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Enabled</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => (
                <tr
                  key={item?.id || item?.addonName}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-[18px] text-red-700">
                        {item?.iconEmoji || "🎁"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#111827]">{item?.addonName || "—"}</div>
                        {item?.shortDescription ? (
                          <div className="mt-1 max-w-[520px] truncate text-[12px] text-[#6B7280]">{item.shortDescription}</div>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <div className="font-semibold text-[#111827]">{formatCurrency(Number(item?.amount || 0))}</div>
                    {item?.amountFieldLabel ? <div className="mt-1 text-[12px] text-[#6B7280]">{item.amountFieldLabel}</div> : null}
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <span className="text-[#111827]">{pricingTypeLabel(item?.pricing)}</span>
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <AddOnStatusPill status={item?.status} />
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <Toggle enabled={Boolean(item?.enabled)} onChange={(next) => onToggleEnabled?.(item?.id, next)} />
                  </td>

                  <td className="py-4 pr-5 align-top text-right">
                    <AddOnRowActions item={item} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} />
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


import Toggle from "@/components/ui/Toggle";
import CauseRowActions from "./CauseRowActions";

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

function yesPill(label) {
  return (
    <span className="inline-flex rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-medium text-[#111827]">
      {label}
    </span>
  );
}

export default function CausesTable({ items, loading, onEdit, onToggleEnabled, onDelete, onArchive, onRestore }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Causes ({rows.length})</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No causes found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-245 border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Cause</th>
                <th className="py-3 pr-4">Description</th>
                <th className="py-3 pr-4">Zakat Eligible</th>
                <th className="py-3 pr-4">Enabled</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => (
                <tr key={item?.id || item?.name} className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]">
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-[18px] text-red-700">
                        {item?.icon || "❤️"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#111827]">{item?.name || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 pr-4 align-top text-[#6B7280]">
                    <div className="max-w-130 truncate">{item?.description || "—"}</div>
                  </td>

                  <td className="py-4 pr-4 align-top">{item?.zakatEligible ? yesPill("Yes") : <span className="text-[#6B7280]">—</span>}</td>

                  <td className="py-4 pr-4 align-top">
                    <Toggle enabled={Boolean(item?.enabled)} onChange={(next) => onToggleEnabled?.(item?.id, next)} />
                  </td>

                  <td className="py-4 pr-5 align-top text-right">
                    <CauseRowActions item={item} onEdit={onEdit} onDelete={onDelete} onArchive={onArchive} onRestore={onRestore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

import { SkeletonBlock } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";
import { causeBadgeStyles } from "../utils";

export function AllocatedCausesCard({ loading, allocated, currency, perLabel }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-base font-semibold text-[#111827] mb-4">Allocated Causes</h2>
      {loading ? (
        <SkeletonBlock className="h-12 rounded-xl" />
      ) : allocated.length ? (
        <div className="space-y-2">
          {allocated.map((c, idx) => {
            const label = String(c?.label || "").trim() || "—";
            const amount = Number(c?.amount ?? 0);
            const cur = String(c?.currency || currency);
            return (
              <div
                key={String(c?.causeId || idx)}
                className="flex items-center justify-between rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] px-4 py-3"
              >
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${causeBadgeStyles[label] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                  {label}
                </span>
                <span className="text-sm font-semibold text-[#EA3335]">
                  {formatCurrency(amount, cur)}&nbsp;/&nbsp;{perLabel}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-[#6B7280]">No causes available.</div>
      )}
    </div>
  );
}

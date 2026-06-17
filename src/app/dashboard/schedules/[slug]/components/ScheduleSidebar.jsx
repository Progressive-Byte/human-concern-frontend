import { SkeletonBlock } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";
import { EditIcon, PauseIcon, PlayIcon } from "@/components/common/SvgIcon";

export function ScheduleSidebar({ loading, totalDonated, currency, nextShort, frequency, nextAmount, statusKey }) {
  const isActive = String(statusKey || "").toLowerCase() === "active";

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-24 rounded-2xl" />
            <SkeletonBlock className="h-16 rounded-xl" />
            <SkeletonBlock className="h-20 rounded-xl" />
          </div>
        ) : (
          <div className="px-4 py-4 space-y-0">
            {/* Total Contributed */}
            <div className="bg-[#1A1A1A] px-5 py-4 rounded-2xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Total Contributed</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalDonated, currency)}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Lifetime for this schedule</p>
            </div>

            {/* Next Donation */}
            <div className="border-b px-5 py-4 border-dashed border-[#E5E7EB]">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">Next Donation</p>
              <p className="text-sm font-semibold text-[#111827]">{nextShort}</p>
              <div className="mt-3 pt-3 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                <span>{frequency}</span>
                <span className="font-semibold text-[#EA3335]">{formatCurrency(nextAmount, currency)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-3">Actions</p>
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                >
                  {EditIcon}
                  Edit Schedule
                </button>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                >
                  {isActive ? PauseIcon : PlayIcon}
                  {isActive ? "Pause Schedule" : "Resume Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

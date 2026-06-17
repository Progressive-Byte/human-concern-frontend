import { SkeletonBlock } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

export function ScheduleSidebar({ loading, totalDonated, currency, nextShort, frequency, nextAmount }) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-24 rounded-2xl" />
            <SkeletonBlock className="h-16 rounded-xl" />
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="bg-[#1A1A1A] px-5 py-4 rounded-2xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Total Contributed</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalDonated, currency)}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Lifetime for this schedule</p>
            </div>

            <div className="border-b px-5 py-4 border-dashed border-[#E5E7EB]">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">Next Donation</p>
              <p className="text-sm font-semibold text-[#111827]">{nextShort}</p>
              <div className="mt-3 pt-3 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                <span>{frequency}</span>
                <span className="font-semibold text-[#EA3335]">{formatCurrency(nextAmount, currency)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

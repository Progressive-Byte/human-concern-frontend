import Link from "next/link";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const ActiveSchedulesCard = ({ loading, schedules }) => (
  <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
    <div className="flex items-center justify-between mb-5 md:mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Active Schedules</h2>
      <Link href="/dashboard/schedules" className="text-sm text-[#EA3335] hover:underline font-medium">
        Manage All →
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? (
        <SkeletonStack count={3} blockClass="h-28 rounded-2xl" asFragment />
      ) : schedules.length ? (
        schedules.map((s) => (
          <div
            key={s.id}
            className="border border-dashed border-[#E5E7EB] rounded-2xl p-4 md:p-5 hover:border-red-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-[#ECFDF5] text-[#047857] px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-[#047857] rounded-full animate-pulse" />
                  ACTIVE
                </span>
                <p className="mt-3 font-medium text-[#111827] leading-snug text-sm">{s.title}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-[#EA3335]">{formatCurrency(s.amount, s.currency)}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{s.frequency}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
              Next donation:{" "}
              <span className="font-semibold text-[#111827]">{s.next || "—"}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-sm text-[#6B7280] lg:col-span-3">No active schedules.</div>
      )}
    </div>
  </div>
);

export default ActiveSchedulesCard;

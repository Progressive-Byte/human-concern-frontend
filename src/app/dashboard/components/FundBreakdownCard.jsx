import Link from "next/link";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const FundBreakdownCard = ({ loading, items, currency }) => (
  <div className="lg:col-span-5 bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Fund Breakdown</h2>
      <Link href="/dashboard/fund-breakdown" className="text-sm text-[#EA3335] hover:underline font-medium">
        Details
      </Link>
    </div>

    <div className="space-y-5 mt-2">
      {loading ? (
        <SkeletonStack />
      ) : items.length ? (
        items.map((f) => (
          <div key={f.label}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#111827]">{f.label}</span>
              <span className="font-medium text-[#111827]">{formatCurrency(f.amount, currency)}</span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[#EA3335]"
                style={{ width: `${f.percent}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-sm text-[#6B7280]">No breakdown available.</div>
      )}
    </div>
  </div>
);

export default FundBreakdownCard;

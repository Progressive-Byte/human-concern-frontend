import Link from "next/link";
import { DonationContentIcon } from "@/components/common/SvgIcon";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

const RecentDonationsCard = ({ loading, donations }) => (
  <div className="lg:col-span-7 bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Recent Donations</h2>
      <Link href="/dashboard/donation-history" className="text-sm text-[#EA3335] hover:underline font-medium">
        View All →
      </Link>
    </div>

    <div className="space-y-1">
      {loading ? (
        <SkeletonStack count={3} blockClass="h-12 rounded-xl" />
      ) : donations.length ? (
        donations.map((d, idx) => (
          <div
            key={d.id}
            className={`flex items-center justify-between py-3 ${
              idx !== donations.length - 1 ? "border-b border-[#E5E7EB]" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                {DonationContentIcon}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[#111827] text-sm truncate">{d.title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{d.date || "—"}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-3">
              <p className="font-semibold text-[#111827] text-base leading-none">{formatCurrency(d.amount, d.currency)}</p>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${causeBadgeStyles[d.cause] || "bg-[#F3F4F6] text-[#6B7280]"}`}>
                {d.cause}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-sm text-[#6B7280]">No recent donations.</div>
      )}
    </div>
  </div>
);

export default RecentDonationsCard;

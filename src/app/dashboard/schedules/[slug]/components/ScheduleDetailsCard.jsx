import DetailRow from "@/components/ui/DetailRow";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

export function ScheduleDetailsCard({ loading, statusLabel, frequency, nextDonationAmount, nextDate, totalDonated, startedAt, currency }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-base font-semibold text-[#111827] mb-5">Schedule Details</h2>
      {loading ? (
        <SkeletonStack />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <DetailRow label="Status" value={statusLabel} />
          <DetailRow label="Frequency" value={frequency} />
          <DetailRow
            label="Next Donation Amount"
            value={formatCurrency(nextDonationAmount, currency)}
            valueClass="text-2xl font-bold text-[#EA3335]"
          />
          <DetailRow label="Next Donation" value={nextDate} />
          <DetailRow label="Total Donated" value={formatCurrency(totalDonated, currency)} />
          <DetailRow label="Created On" value={startedAt} />
        </div>
      )}
    </div>
  );
}

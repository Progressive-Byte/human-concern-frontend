import { formatCurrency, formatDate } from "@/utils/helpers";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pick(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] px-4 py-3">
      <div className="text-[12px] text-[#6B7280]">{label}</div>
      <div className="mt-1.5 text-[20px] font-semibold leading-none text-[#111827]">{value}</div>
      {hint ? <div className="mt-1.5 text-[11px] text-[#9CA3AF]">{hint}</div> : null}
    </div>
  );
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-40 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-[74px] animate-pulse rounded-xl bg-[#F3F4F6]" />
        ))}
      </div>
    </section>
  );
}

const DonorGivingSummaryCard = ({ donor, stats, schedulesSummary, loading }) => {
  if (loading) return <Skeleton />;

  const lifetime = toNumber(pick(stats?.lifetimeAmountUsd, stats?.totalDonated, donor?.totalDonated));
  const paidReceipts = toNumber(pick(stats?.paidReceiptCount, stats?.donationCount, donor?.donationCount));
  const oneTimeTotal = toNumber(stats?.oneTimeTotalUsd);
  const oneTimeCount = toNumber(stats?.oneTimeCount);
  const recurringCollected = toNumber(stats?.recurringCollectedUsd);
  const recurringCommitted = toNumber(stats?.recurringCommittedUsd);
  const averageGift = toNumber(pick(stats?.averageGiftUsd, stats?.avgDonation, donor?.averageDonation));
  const largest = toNumber(stats?.largestDonationUsd);
  const refundTotal = toNumber(stats?.refundTotalUsd);
  const refundCount = toNumber(stats?.refundCount);
  const firstDonationAt = pick(stats?.firstDonationAt, donor?.firstDonationAt);
  const lastDonationAt = pick(stats?.lastDonationAt, donor?.lastDonationAt);

  const activeSchedules = toNumber(pick(stats?.activeSchedules, schedulesSummary?.activeSchedules));
  const pausedSchedules = toNumber(pick(stats?.pausedSchedules, schedulesSummary?.pausedSchedules));
  const cancelledSchedules = toNumber(pick(stats?.cancelledSchedules, schedulesSummary?.cancelledSchedules));

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Giving Summary</div>
        <div className="text-[12px] text-[#6B7280]">All amounts in USD</div>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Lifetime Donated" value={formatCurrency(lifetime)} hint={`${paidReceipts} paid receipts`} />
        <StatTile label="One-time Total" value={formatCurrency(oneTimeTotal)} hint={`${oneTimeCount} receipts`} />
        <StatTile label="Recurring Collected" value={formatCurrency(recurringCollected)} hint="Charged so far" />
        <StatTile label="Recurring Committed" value={formatCurrency(recurringCommitted)} hint="Full schedule value" />
        <StatTile label="Average Gift" value={formatCurrency(averageGift)} />
        <StatTile label="Largest Donation" value={formatCurrency(largest)} />
        <StatTile
          label="Refunded"
          value={formatCurrency(refundTotal)}
          hint={refundCount > 0 ? `${refundCount} refund${refundCount === 1 ? "" : "s"}` : "None"}
        />
        <StatTile label="Schedules" value={activeSchedules} hint={`${pausedSchedules} paused · ${cancelledSchedules} cancelled`} />
      </div>

      <div className="border-t border-[#F3F4F6]" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 text-[12px] text-[#6B7280]">
        <span>
          First donation: <span className="font-semibold text-[#111827]">{firstDonationAt ? formatDate(firstDonationAt) : "—"}</span>
        </span>
        <span>
          Last donation: <span className="font-semibold text-[#111827]">{lastDonationAt ? formatDate(lastDonationAt) : "—"}</span>
        </span>
      </div>
    </section>
  );
};

export default DonorGivingSummaryCard;

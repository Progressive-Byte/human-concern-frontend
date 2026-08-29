import DetailRow from "@/components/ui/DetailRow";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";

const CHALLENGE_STATUSES = [
  "requires_action",
  "pending_retry_scheduled",
  "retriable_but_waiting_donor_action",
  "permanently_failed_max_retries",
  "pending_bank_transfer_manual_match",
];

function classifyStatusKey(key) {
  const k = String(key || "").trim().toLowerCase();
  if (!k) return "";
  if (k.includes("requires_action")) return "requires_action";
  if (k.includes("pending_retry")) return "pending_retry_scheduled";
  if (k.includes("retriable_but_waiting") || k.includes("waiting_donor")) return "retriable_but_waiting_donor_action";
  if (k.includes("permanently_failed") || k.includes("max_retries")) return "permanently_failed_max_retries";
  if (k.includes("bank_transfer") || k.includes("manual_match")) return "pending_bank_transfer_manual_match";
  if (CHALLENGE_STATUSES.includes(k)) return k;
  return "";
}

function StatusDisplay({ statusLabel, statusKey }) {
  const challengeCategory = classifyStatusKey(statusKey);
  if (challengeCategory) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <OrchestrationStatusBadge type="challenge" value={challengeCategory} />
        {statusLabel && statusLabel.toLowerCase().replace(/\s+/g, "_") !== challengeCategory && (
          <span className="text-[12px] text-[#6B7280]">({statusLabel})</span>
        )}
      </div>
    );
  }
  const rawLower = String(statusLabel || "").trim().toLowerCase().replace(/\s+/g, "_");
  const rawCategory = classifyStatusKey(rawLower);
  if (rawCategory) {
    return <OrchestrationStatusBadge type="challenge" value={rawCategory} />;
  }
  return <span>{statusLabel || "—"}</span>;
}

export function ScheduleDetailsCard({ loading, statusLabel, statusKey, frequency, nextDonationAmount, nextDate, totalDonated, startedAt, currency }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-base font-semibold text-[#111827] mb-5">Schedule Details</h2>
      {loading ? (
        <SkeletonStack />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <DetailRow label="Status" value={<StatusDisplay statusLabel={statusLabel} statusKey={statusKey} />} />
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

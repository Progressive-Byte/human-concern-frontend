"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";

const CHALLENGE_STATUSES = [
  "requires_action",
  "pending_retry_scheduled",
  "retriable_but_waiting_donor_action",
  "permanently_failed_max_retries",
  "pending_bank_transfer_manual_match",
];

function getScheduleStatusKey(schedule) {
  if (!schedule) return "";
  const explicit = String(schedule?.status?.key || schedule?.statusKey || schedule?.orchestrationStatus || "").trim().toLowerCase();
  if (explicit) return explicit;
  const metaStatus = String(schedule?.metadata?.orchestrationStatus || schedule?.metadata?.challengeStatus || "").trim().toLowerCase();
  if (metaStatus) return metaStatus;
  const label = String(schedule?.status?.label || schedule?.status || "").trim().toLowerCase().replace(/\s+/g, "_");
  return label;
}

function isChallengeStatus(statusKey) {
  const key = String(statusKey || "").trim().toLowerCase();
  return CHALLENGE_STATUSES.some((c) => key.includes(c));
}

function classifyChallenge(statusKey) {
  const key = String(statusKey || "").trim().toLowerCase();
  if (key.includes("requires_action")) return "requires_action";
  if (key.includes("pending_retry")) return "pending_retry_scheduled";
  if (key.includes("retriable_but_waiting") || key.includes("waiting_donor")) return "retriable_but_waiting_donor_action";
  if (key.includes("permanently_failed") || key.includes("max_retries")) return "permanently_failed_max_retries";
  if (key.includes("bank_transfer") || key.includes("manual_match")) return "pending_bank_transfer_manual_match";
  return "requires_action";
}

const ActionRequiredBanner = ({ schedules = [] }) => {
  const { hasChallenges, counts, totalCount, firstChallengeScheduleId } = useMemo(() => {
    const list = Array.isArray(schedules) ? schedules : [];
    const counts = {
      requires_action: 0,
      pending_retry_scheduled: 0,
      retriable_but_waiting_donor_action: 0,
      permanently_failed_max_retries: 0,
      pending_bank_transfer_manual_match: 0,
    };
    let total = 0;
    let firstId = null;
    list.forEach((s) => {
      const statusKey = getScheduleStatusKey(s);
      if (isChallengeStatus(statusKey)) {
        const category = classifyChallenge(statusKey);
        counts[category] = (counts[category] || 0) + 1;
        total += 1;
        if (!firstId) {
          firstId = String(s?.donationId || s?.scheduleId || s?.slug || s?.id || "");
        }
      }
    });
    return {
      hasChallenges: total > 0,
      counts,
      totalCount: total,
      firstChallengeScheduleId: firstId,
    };
  }, [schedules]);

  if (!hasChallenges) return null;

  const categoriesWithCount = Object.entries(counts).filter(([, n]) => n > 0);

  const ctaHref = firstChallengeScheduleId
    ? `/dashboard/installments/actions/${encodeURIComponent(firstChallengeScheduleId)}`
    : "/dashboard/installments/actions";

  return (
    <div className="sticky top-0 z-30 border border-[#FEF3C7] bg-gradient-to-r from-[#FFF8E1] via-[#FFFBEB] to-[#FFF8E1] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 shadow-[0_1px_3px_rgba(180,83,9,0.06)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="inline-flex shrink-0 h-9 w-9 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-bold text-[#92400E]">
                {totalCount} pending action{totalCount === 1 ? "" : "s"} require your attention
              </p>
              <span className="inline-flex items-center rounded-full bg-[#FDE68A] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#92400E]">
                ACTION REQUIRED
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[#B45309]">
              One or more scheduled donations need your input to continue processing.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {categoriesWithCount.map(([status, n]) => (
                <span key={status} className="inline-flex items-center gap-1.5">
                  <OrchestrationStatusBadge type="challenge" value={status} />
                  <span className="text-[11px] font-semibold text-[#92400E]">×{n}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/installments/actions"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#FCD34D] bg-white/70 px-3.5 py-2.5 text-[12px] font-semibold text-[#92400E] transition-colors hover:bg-white"
          >
            View all
          </Link>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B45309] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#92400E] shadow-sm"
          >
            Complete Required Actions
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActionRequiredBanner;

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";
import CountdownTimer from "@/components/common/CountdownTimer";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { AlertIcon, Spinner } from "@/components/common/SvgIcon";
import { classifyBankFailure, getUserFacingErrorMessage } from "@/utils/errorMaps";
import { cancelUserSchedule } from "@/services/donationService";

const CHALLENGE_STATUSES = [
  "requires_action",
  "pending_retry_scheduled",
  "retriable_but_waiting_donor_action",
  "permanently_failed_max_retries",
  "pending_bank_transfer_manual_match",
];

function getStatusKey(schedule) {
  if (!schedule) return "";
  const explicit = String(schedule?.status?.key || schedule?.statusKey || schedule?.orchestrationStatus || "").trim().toLowerCase();
  if (explicit) return explicit;
  const meta = String(schedule?.metadata?.orchestrationStatus || schedule?.metadata?.challengeStatus || "").trim().toLowerCase();
  if (meta) return meta;
  const label = String(schedule?.status?.label || schedule?.status || "").trim().toLowerCase().replace(/\s+/g, "_");
  return label;
}

function classify(key) {
  const k = String(key || "").trim().toLowerCase();
  if (k.includes("requires_action")) return "requires_action";
  if (k.includes("pending_retry")) return "pending_retry_scheduled";
  if (k.includes("retriable_but_waiting") || k.includes("waiting_donor")) return "retriable_but_waiting_donor_action";
  if (k.includes("permanently_failed") || k.includes("max_retries")) return "permanently_failed_max_retries";
  if (k.includes("bank_transfer") || k.includes("manual_match")) return "pending_bank_transfer_manual_match";
  return "";
}

function isChallenge(key) {
  const cat = classify(key);
  return !!cat && CHALLENGE_STATUSES.includes(cat);
}

function buildInstallmentId(schedule) {
  if (!schedule) return "";
  return String(
    schedule?.nextInstallmentId ||
    schedule?.nextDonation?.installmentId ||
    schedule?.metadata?.nextInstallmentId ||
    schedule?.installmentId ||
    ""
  ).trim();
}

export function ScheduleOrchestrationStatusCard({ loading, schedule, scheduleId, onRefresh, onCancel }) {
  const [skipLoading, setSkipLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [localError, setLocalError] = useState("");

  const rawStatusKey = useMemo(() => getStatusKey(schedule), [schedule]);
  const challengeCategory = useMemo(() => classify(rawStatusKey), [rawStatusKey]);
  const hasChallenge = useMemo(() => isChallenge(rawStatusKey), [rawStatusKey]);

  const nextRetryAt = useMemo(() => {
    return schedule?.metadata?.nextRetryAt || schedule?.nextRetryAt || schedule?.nextDonation?.date || null;
  }, [schedule]);

  const failCount = useMemo(() => {
    return Number(schedule?.metadata?.failCount ?? schedule?.failCount ?? schedule?.retryCount ?? 0);
  }, [schedule]);

  const tripReason = useMemo(() => {
    return String(
      schedule?.metadata?.tripReason ??
      schedule?.tripReason ??
      schedule?.lastFailureReason ??
      schedule?.failureReason ??
      ""
    ).trim();
  }, [schedule]);

  const failureClass = useMemo(() => classifyBankFailure(tripReason), [tripReason]);

  const circuitMode = useMemo(() => {
    return String(schedule?.metadata?.circuitMode ?? schedule?.circuitMode ?? "TRACKING").toUpperCase();
  }, [schedule]);

  const installmentId = useMemo(() => buildInstallmentId(schedule), [schedule]);

  const retryHref = useMemo(() => {
    const base = `/dashboard/installments/actions/${encodeURIComponent(String(scheduleId || ""))}`;
    const params = new URLSearchParams();
    if (installmentId) params.set("installmentId", installmentId);
    if (challengeCategory === "permanently_failed_max_retries" || challengeCategory === "retriable_but_waiting_donor_action") {
      params.set("paymentMode", "schedule_update");
    } else if (challengeCategory === "pending_retry_scheduled") {
      params.set("paymentMode", "installment_retry");
    } else {
      params.set("paymentMode", "one_time_retry");
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [scheduleId, installmentId, challengeCategory]);

  const handleSkip = async () => {
    if (skipLoading) return;
    setSkipLoading(true);
    setLocalError("");
    try {
      await new Promise((r) => setTimeout(r, 600));
      onRefresh?.();
    } catch (e) {
      setLocalError(e?.message || "Failed to skip retry.");
    } finally {
      setSkipLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!scheduleId || cancelLoading) return;
    setCancelLoading(true);
    setLocalError("");
    try {
      await cancelUserSchedule(scheduleId, cancelReason.trim() || "Donor requested cancel");
      setCancelOpen(false);
      setCancelReason("");
      onCancel?.();
      onRefresh?.();
    } catch (e) {
      setLocalError(e?.message || "Failed to cancel schedule.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
        <SkeletonBlock className="h-6 w-1/2 rounded-lg mb-4" />
        <SkeletonBlock className="h-20 rounded-xl mb-3" />
        <SkeletonBlock className="h-12 rounded-xl" />
      </div>
    );
  }

  if (!hasChallenge) return null;

  const needsNewCard = failureClass === "non_retriable" || challengeCategory === "retriable_but_waiting_donor_action" || challengeCategory === "permanently_failed_max_retries";

  return (
    <div className="bg-white rounded-2xl border border-[#FED7AA] bg-gradient-to-b from-[#FFF8EC] to-white p-5 md:p-6 shadow-[0_1px_3px_rgba(180,83,9,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#92400E]">Orchestration Status</h3>
            <OrchestrationStatusBadge type="challenge" value={challengeCategory} />
          </div>
          <p className="mt-1 text-[13px] text-[#B45309]">
            This installment is in a challenge state and may require your input.
          </p>
        </div>
        <OrchestrationStatusBadge type="circuit" value={circuitMode} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-dashed border-[#FED7AA] p-3.5">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#B45309] mb-1.5">Next Retry</p>
          {nextRetryAt ? (
            <CountdownTimer expiresAt={nextRetryAt} size="sm" />
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">Not scheduled</span>
          )}
        </div>
        <div className="bg-white rounded-xl border border-dashed border-[#FED7AA] p-3.5">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#B45309] mb-1.5">Fail Count</p>
          <p className="text-xl font-bold text-[#B45309]">
            {failCount}
            <span className="text-xs font-semibold text-[#9CA3AF] ml-1">/ 3</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-dashed border-[#FED7AA] p-3.5">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#B45309] mb-1.5">Circuit Status</p>
          <OrchestrationStatusBadge type="circuit" value={circuitMode} />
        </div>
      </div>

      {tripReason ? (
        <div className="mb-4 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-red-600">
              {AlertIcon && <span><AlertIcon size={14} /></span>}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-red-800">Last failure</p>
              <p className="mt-0.5 text-[13px] text-red-700">
                {getUserFacingErrorMessage(tripReason, tripReason)}
              </p>
              {failureClass !== "unknown" && (
                <p className="mt-1.5 text-[11px]">
                  <span className="font-semibold text-red-700">
                    Classification: {failureClass === "non_retriable" ? "Non-retriable" : failureClass === "retriable_temporary" ? "Temporary / Retriable" : "Unknown"}
                  </span>
                  {needsNewCard && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-red-600/10 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      UPDATE PAYMENT METHOD
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {localError && (
        <div className="mb-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {localError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <Link
          href={retryHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 shadow-sm min-w-[140px]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {needsNewCard ? "Update Payment Method" : "Retry Now"}
        </Link>
        <button
          type="button"
          onClick={handleSkip}
          disabled={skipLoading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#FCD34D] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#B45309] transition-colors hover:bg-[#FFFBEB] disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
        >
          {skipLoading ? <span className="inline-flex items-center gap-2">{Spinner}Processing…</span> : (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Skip This Retry
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          disabled={cancelLoading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-[#EA3335] transition-colors hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2M4 7h16l-1.07 12.81a2 2 0 01-1.998 1.86H7.07a2 2 0 01-2-1.86L4 7zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Cancel Schedule
        </button>
      </div>

      {cancelOpen && (
        <div className="mt-4 border border-dashed border-red-500/30 bg-red-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Confirm cancel this schedule?</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Optional reason for cancellation…"
            className="w-full rounded-lg border border-[#FECACA] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none h-20"
          />
          <div className="mt-3 flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setCancelOpen(false); setCancelReason(""); setLocalError(""); }}
              disabled={cancelLoading}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Nevermind
            </button>
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
              className="rounded-xl bg-[#EA3335] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {cancelLoading && Spinner}
              {cancelLoading ? "Cancelling…" : "Yes, cancel schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleOrchestrationStatusCard;

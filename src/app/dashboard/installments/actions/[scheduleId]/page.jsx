"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";
import { SkeletonBlock, SkeletonStack } from "@/components/ui/Skeleton";
import { AlertIcon, BacklinkIcon, Spinner } from "@/components/common/SvgIcon";
import CountdownTimer from "@/components/common/CountdownTimer";
import UnifiedChallengeDispatcher, {
  saveUnifiedChallengeToSession,
  clearUnifiedChallengeSession,
} from "@/components/payment/UnifiedChallengeDispatcher";
import StripeCheckoutForm from "@/app/donate/steps/StepComponents/Step4components/StripeCheckoutForm";
import { DonationProvider } from "@/context/DonationContext";
import {
  getUserScheduleById,
  getUserInstallmentAction,
  syncUserInstallment,
  getUserDashboard,
} from "@/services/donationService";
import { apiRequest } from "@/services/api";
import { formatCurrency } from "@/utils/helpers";
import { classifyBankFailure, getUserFacingErrorMessage } from "@/utils/errorMaps";

const CHALLENGE_STATUSES = [
  "requires_action",
  "pending_retry_scheduled",
  "retriable_but_waiting_donor_action",
  "permanently_failed_max_retries",
  "pending_bank_transfer_manual_match",
];

function getStatusKey(s) {
  if (!s) return "";
  const explicit = String(s?.status?.key || s?.statusKey || s?.orchestrationStatus || "").trim().toLowerCase();
  if (explicit) return explicit;
  const meta = String(s?.metadata?.orchestrationStatus || s?.metadata?.challengeStatus || "").trim().toLowerCase();
  if (meta) return meta;
  const label = String(s?.status?.label || s?.status || "").trim().toLowerCase().replace(/\s+/g, "_");
  return label;
}

function classify(key) {
  const k = String(key || "").trim().toLowerCase();
  if (k.includes("requires_action")) return "requires_action";
  if (k.includes("pending_retry")) return "pending_retry_scheduled";
  if (k.includes("retriable_but_waiting") || k.includes("waiting_donor")) return "retriable_but_waiting_donor_action";
  if (k.includes("permanently_failed") || k.includes("max_retries")) return "permanently_failed_max_retries";
  if (k.includes("bank_transfer") || k.includes("manual_match")) return "pending_bank_transfer_manual_match";
  return "requires_action";
}

function resolvePaymentMode(statusKey) {
  const k = String(statusKey || "").trim().toLowerCase();
  if (k.includes("permanently_failed") || k.includes("retriable_but_waiting")) return "schedule_update";
  if (k.includes("pending_retry")) return "installment_retry";
  return "one_time_retry";
}

function formatDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

function formatShortDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

let stripePromise = null;
async function getStripe() {
  if (stripePromise) return stripePromise;
  const res = await apiRequest("payment/settings");
  const raw = res?.data?.gateways ?? res?.gateways ?? {};
  const gateway = Object.values(raw).find((g) => g?.provider === "stripe");
  const key = gateway?.publishableKey ?? null;
  if (!key) throw new Error("Stripe is not configured.");
  stripePromise = loadStripe(key);
  return stripePromise;
}

async function pollSync(installmentId, setSyncStatus, onDone, attemptsLeft = 10) {
  try {
    const res = await syncUserInstallment(installmentId);
    const payload = res?.data?.data ?? res?.data ?? res ?? {};
    const status = String(payload?.status || payload?.installmentStatus || "").trim().toLowerCase();
    if (status && typeof setSyncStatus === "function") setSyncStatus(status);

    if (status === "processing" && attemptsLeft > 0) {
      await new Promise((r) => window.setTimeout(r, 3500));
      return pollSync(installmentId, setSyncStatus, onDone, attemptsLeft - 1);
    }
    if (status === "succeeded") {
      if (typeof onDone === "function") onDone();
    }
    return status || null;
  } catch {
    if (attemptsLeft > 0) {
      await new Promise((r) => window.setTimeout(r, 2000));
      return pollSync(installmentId, setSyncStatus, onDone, attemptsLeft - 1);
    }
    return null;
  }
}

const SingleInstallmentActionPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = String(params?.scheduleId || "").trim();
  const initialMode = String(searchParams?.get("paymentMode") || "").trim();
  const initialInstallmentId = String(searchParams?.get("installmentId") || "").trim();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [installmentId, setInstallmentId] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionData, setActionData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [completed, setCompleted] = useState(false);

  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [stripeObj, setStripeObj] = useState(null);

  useEffect(() => {
    if (!scheduleId) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getUserScheduleById(scheduleId);
        if (!alive) return;
        const payload = res?.data?.data || res?.data || {};
        setSchedule(payload?.schedule || payload || {});
        const instId = initialInstallmentId || String(payload?.nextInstallmentId || payload?.schedule?.nextInstallmentId || payload?.schedule?.nextDonation?.installmentId || "");
        setInstallmentId(instId);
      } catch (e) {
        if (!alive) return;
        setSchedule(null);
        setLoadError(e?.message || "Failed to load schedule.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [scheduleId, initialInstallmentId]);

  useEffect(() => {
    if (!installmentId) {
      setActionLoading(false);
      setActionError("");
      setActionData(null);
      setSyncStatus(null);
      return;
    }
    let alive = true;
    (async () => {
      setActionLoading(true);
      setActionError("");
      setActionData(null);
      setSyncStatus(null);
      try {
        const res = await getUserInstallmentAction(installmentId);
        if (!alive) return;
        const payload = res?.data?.data ?? res?.data ?? res ?? {};
        const status = String(payload?.status || "").trim().toLowerCase();
        if (status) setSyncStatus(status);
        setActionData({
          clientSecret: payload?.clientSecret ?? null,
          paymentIntentId: payload?.paymentIntentId ?? null,
          setupIntentId: payload?.setupIntentId ?? null,
          amount: payload?.amount,
          currency: payload?.currency,
          dueDate: payload?.dueDate,
          title: payload?.title,
          challenge: payload?.challenge ?? payload?.unifiedChallenge ?? null,
        });

        if (payload?.challenge || payload?.unifiedChallenge) {
          saveUnifiedChallengeToSession(payload?.challenge || payload?.unifiedChallenge);
        }

        try {
          const s = await getStripe();
          if (alive) {
            setStripeObj(s);
            setStripeLoaded(true);
          }
        } catch (stripeErr) {
          if (alive) setStripeError(stripeErr?.message || "Stripe failed to load.");
        }
      } catch (e) {
        if (!alive) return;
        const msg = e?.message || "Failed to load payment details.";
        setActionError(msg);
        const lower = String(msg || "").toLowerCase();
        if (lower.includes("unauthorized") || lower.includes("unauthorised")) {
          const next = `${window.location.pathname}${window.location.search}`;
          router.push(`/user/login?redirect=${encodeURIComponent(next)}`);
        }
      } finally {
        if (!alive) return;
        setActionLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [installmentId, router]);

  const statusKey = useMemo(() => {
    const k = getStatusKey(schedule);
    if (k && CHALLENGE_STATUSES.some((c) => k.includes(c))) return classify(k);
    return classify(getStatusKey(actionData) || initialMode || "requires_action");
  }, [schedule, actionData, initialMode]);

  const paymentMode = useMemo(() => {
    if (initialMode) return initialMode;
    return resolvePaymentMode(statusKey);
  }, [initialMode, statusKey]);

  const isRecurring = paymentMode === "installment_retry" || paymentMode === "schedule_update";

  const amount = useMemo(() => {
    if (actionData && typeof actionData.amount === "number") return actionData.amount;
    const next = schedule?.nextDonation || {};
    return Number(next.amount ?? schedule?.installmentAmount ?? 0);
  }, [actionData, schedule]);

  const currency = useMemo(() => {
    return String(actionData?.currency || schedule?.currency || "USD");
  }, [actionData, schedule]);

  const failCount = Number(schedule?.metadata?.failCount ?? schedule?.failCount ?? 0);
  const tripReason = String(schedule?.metadata?.tripReason ?? schedule?.tripReason ?? schedule?.lastFailureReason ?? actionData?.lastFailureReason ?? "").trim();
  const failureClass = classifyBankFailure(tripReason);
  const nextRetryAt = schedule?.metadata?.nextRetryAt || schedule?.nextRetryAt || actionData?.dueDate || schedule?.nextDonation?.date || null;
  const circuitMode = String(schedule?.metadata?.circuitMode ?? schedule?.circuitMode ?? "TRACKING").toUpperCase();

  const paymentModeLabel = {
    one_time_retry: "Retry this payment once",
    installment_retry: "Retry the scheduled installment",
    schedule_update: "Update payment method & retry schedule",
  }[paymentMode] || "Retry payment";

  const handleSuccess = useCallback(() => {
    setCompleted(true);
    clearUnifiedChallengeSession();
    try { getUserDashboard(); } catch {}
    window.setTimeout(() => {
      router.push(`/dashboard/schedules/${encodeURIComponent(scheduleId)}`);
    }, 2500);
  }, [router, scheduleId]);

  const challenge = actionData?.challenge || null;

  const handleRetrySyncOnly = async () => {
    if (!installmentId) return;
    setActionLoading(true);
    setActionError("");
    try {
      const status = await pollSync(installmentId, setSyncStatus, handleSuccess, 6);
      if (status && status !== "succeeded" && status !== "processing") {
        setSyncStatus(status);
      }
    } catch (e) {
      setActionError(e?.message || "Retry sync failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DonationProvider>
      <>
        <DashboardHeader title="Resolve Installment" subtitle={schedule?.title ? `For: ${schedule.title}` : "Complete required actions"} />

        <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
          <Link
            href="/dashboard/installments/actions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EA3335] hover:text-red-700 transition-colors"
          >
            {BacklinkIcon}
            Back to all actions
          </Link>

        {loadError ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{loadError}</div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 md:gap-5 items-start">
          <div className="min-w-0 space-y-4 md:space-y-5">
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-[#111827]">
                      {loading ? "Loading installment…" : schedule?.title || "Installment Action"}
                    </h2>
                    <OrchestrationStatusBadge type="challenge" value={statusKey} />
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">{paymentModeLabel}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-bold text-[#EA3335]">{formatCurrency(amount, currency)}</p>
                  {actionData?.dueDate && (
                    <p className="mt-0.5 text-xs text-[#6B7280]">Due {formatShortDate(actionData.dueDate)}</p>
                  )}
                </div>
              </div>

              {nextRetryAt && !completed && (
                <div className="mt-4 flex flex-wrap items-center gap-2 bg-[#FFF8E1] border border-[#FEF3C7] rounded-xl px-3.5 py-2.5">
                  <span className="text-[11px] font-semibold text-[#92400E] uppercase tracking-wide">Next automatic retry</span>
                  <CountdownTimer expiresAt={nextRetryAt} size="sm" />
                </div>
              )}

              {tripReason ? (
                <div className="mt-4 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-red-600">{AlertIcon && <span><AlertIcon size={14} /></span>}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-red-800">Last failure reason</p>
                      <p className="mt-0.5 text-[13px] text-red-700">
                        {getUserFacingErrorMessage(tripReason, tripReason)}
                      </p>
                      {failCount > 0 && (
                        <p className="mt-1.5 text-[11px] text-red-600">
                          Attempt {failCount} of 3
                          {failureClass === "non_retriable" && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-600/10 px-2 py-0.5 font-semibold">
                              Payment method update required
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {actionError && (
                <div className="mt-4 border border-dashed border-red-500/30 bg-red-500/10 rounded-xl px-4 py-3 text-sm text-red-600">
                  {actionError}
                </div>
              )}

              {stripeError && (
                <div className="mt-4 border border-dashed border-red-500/30 bg-red-500/10 rounded-xl px-4 py-3 text-sm text-red-600">
                  {stripeError}
                </div>
              )}

              {completed ? (
                <div className="mt-5 border border-dashed border-emerald-500/30 bg-emerald-50 rounded-xl px-5 py-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-800">Payment Successful</h3>
                  <p className="mt-1 text-sm text-emerald-700">Redirecting to schedule details…</p>
                </div>
              ) : actionLoading && !stripeLoaded ? (
                <div className="mt-5 space-y-3">
                  <SkeletonBlock className="h-14 rounded-xl" />
                  <SkeletonBlock className="h-12 rounded-xl" />
                  <SkeletonBlock className="h-12 rounded-2xl" />
                </div>
              ) : stripeLoaded && stripeObj ? (
                <div className="mt-5">
                  <UnifiedChallengeDispatcher challenge={challenge} provider="stripe">
                    <Elements stripe={stripeObj} options={actionData?.clientSecret ? { clientSecret: actionData.clientSecret } : undefined}>
                      <div className="space-y-4">
                        <StripeCheckoutForm grandTotal={amount} currency={currency} isRecurring={isRecurring} />
                        <button
                          type="button"
                          onClick={handleRetrySyncOnly}
                          disabled={actionLoading || actionLoading === undefined}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? Spinner : null}
                          {actionLoading ? "Checking status…" : "I've already completed this — check status"}
                        </button>
                      </div>
                    </Elements>
                  </UnifiedChallengeDispatcher>
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-3">
                  {loading ? (
                    <SkeletonStack count={2} blockClass="h-14 rounded-xl" />
                  ) : (
                    <button
                      type="button"
                      onClick={handleRetrySyncOnly}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Retry payment
                    </button>
                  )}
                </div>
              )}
            </div>

            {syncStatus && (
              <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-xs text-[#6B7280]">
                  Installment status:&nbsp;
                  <span className="font-semibold text-[#111827]">{syncStatus}</span>
                </p>
                <Link
                  href={`/dashboard/schedules/${encodeURIComponent(scheduleId)}`}
                  className="text-xs font-semibold text-[#EA3335] hover:underline"
                >
                  View schedule →
                </Link>
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
              <div className="bg-[#1A1A1A] px-5 py-4">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Installment Amount</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(amount, currency)}</p>
                <p className="mt-1 text-xs text-[#6B7280]">{isRecurring ? "Recurring schedule retry" : "One-time retry"}</p>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {schedule?.frequencyLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Frequency</span>
                    <span className="font-semibold text-[#111827]">{schedule.frequencyLabel}</span>
                  </div>
                )}
                {schedule?.startedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Started</span>
                    <span className="font-semibold text-[#111827]">{formatDate(schedule.startedAt)}</span>
                  </div>
                )}
                {schedule?.totalDonated != null && (
                  <div className="flex items-center justify-between border-t border-dashed border-[#E5E7EB] pt-3">
                    <span className="text-[#6B7280]">Total donated so far</span>
                    <span className="font-semibold text-[#EA3335]">{formatCurrency(Number(schedule.totalDonated || 0), currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-dashed border-[#E5E7EB] pt-3">
                  <span className="text-[#6B7280]">Payment mode</span>
                  <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
                    {paymentMode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Circuit</span>
                  <OrchestrationStatusBadge type="circuit" value={circuitMode} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/dashboard/schedules/${encodeURIComponent(scheduleId)}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]"
              >
                Open schedule details
              </Link>
              <Link
                href="/dashboard/installments/actions"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              >
                See all pending actions
              </Link>
            </div>
          </div>
        </div>
        </div>
      </>
    </DonationProvider>
  );
};

export default SingleInstallmentActionPage;

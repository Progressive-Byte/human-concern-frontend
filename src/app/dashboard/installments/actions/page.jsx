"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { BacklinkIcon, Spinner } from "@/components/common/SvgIcon";
import { getUserSchedules } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";
import { classifyBankFailure } from "@/utils/errorMaps";

const CHALLENGE_STATUSES = [
  "requires_action",
  "pending_retry_scheduled",
  "retriable_but_waiting_donor_action",
  "permanently_failed_max_retries",
  "pending_bank_transfer_manual_match",
];

function getScheduleStatusKey(s) {
  if (!s) return "";
  const explicit = String(s?.status?.key || s?.statusKey || s?.orchestrationStatus || "").trim().toLowerCase();
  if (explicit) return explicit;
  const meta = String(s?.metadata?.orchestrationStatus || s?.metadata?.challengeStatus || "").trim().toLowerCase();
  if (meta) return meta;
  const label = String(s?.status?.label || s?.status || "").trim().toLowerCase().replace(/\s+/g, "_");
  return label;
}

function isChallengeStatus(key) {
  const k = String(key || "").trim().toLowerCase();
  return CHALLENGE_STATUSES.some((c) => k.includes(c));
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

function formatShortDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

const InstallmentActionsListPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [retryingId, setRetryingId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserSchedules({ page: "1", limit: "100", q: "" });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setError(e?.message || "Failed to load installments.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const installments = useMemo(() => {
    return (Array.isArray(items) ? items : [])
      .map((s, idx) => {
        const statusKey = getScheduleStatusKey(s);
        if (!isChallengeStatus(statusKey)) return null;
        const category = classify(statusKey);
        const scheduleId = String(s?.scheduleId || s?.donationId || s?.slug || s?.id || idx);
        const title = String(s?.title || "").trim() || "Scheduled Installment";
        const nextDonation = s?.nextDonation || {};
        const nextAmount = Number(nextDonation?.amount ?? s?.installmentAmount ?? 0);
        const currency = String(s?.currency || nextDonation?.currency || "USD");
        const nextDateRaw = nextDonation?.date || s?.metadata?.nextRetryAt || s?.nextRetryAt;
        const nextDate = formatShortDate(nextDateRaw);
        const failCount = Number(s?.metadata?.failCount ?? s?.failCount ?? s?.retryCount ?? 0);
        const tripReason = String(s?.metadata?.tripReason ?? s?.tripReason ?? s?.lastFailureReason ?? "").trim();
        const failureClass = classifyBankFailure(tripReason);
        const nextRetryAt = s?.metadata?.nextRetryAt || s?.nextRetryAt || nextDonation?.date || null;
        return {
          scheduleId,
          title,
          statusKey: category,
          amount: nextAmount,
          currency,
          nextDate,
          failCount,
          tripReason,
          failureClass,
          nextRetryAt,
        };
      })
      .filter(Boolean);
  }, [items]);

  const counts = useMemo(() => {
    const c = { total: 0, requires_action: 0, pending_retry_scheduled: 0, retriable_but_waiting_donor_action: 0, permanently_failed_max_retries: 0, pending_bank_transfer_manual_match: 0 };
    installments.forEach((it) => {
      c.total += 1;
      if (c[it.statusKey] !== undefined) c[it.statusKey] += 1;
    });
    return c;
  }, [installments]);

  const handleRetry = (scheduleId, e) => {
    if (e) e.stopPropagation();
    if (!scheduleId || retryingId) return;
    setRetryingId(scheduleId);
    router.push(`/dashboard/installments/actions/${encodeURIComponent(scheduleId)}`);
  };

  return (
    <>
      <DashboardHeader title="Installment Actions" subtitle="Review and resolve payment actions for your recurring donations" />

      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EA3335] hover:text-red-700 transition-colors"
        >
          {BacklinkIcon}
          Back to Dashboard
        </Link>

        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { key: "requires_action", label: "Action Required" },
            { key: "pending_retry_scheduled", label: "Retrying Soon" },
            { key: "retriable_but_waiting_donor_action", label: "Needs Card Update" },
            { key: "permanently_failed_max_retries", label: "Max Retries" },
            { key: "pending_bank_transfer_manual_match", label: "Bank Transfer" },
          ].map((c) => (
            <div key={c.key} className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280]">{c.label}</p>
              <p className="mt-1.5 text-2xl font-bold text-[#111827]">{counts[c.key] || 0}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <SkeletonStack count={3} blockClass="h-28 rounded-2xl" />
        ) : installments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-16 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857] mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#111827]">No pending actions</h3>
            <p className="mt-1 text-sm text-[#6B7280]">All your installments are up to date. Great job!</p>
            <Link
              href="/dashboard/schedules"
              className="inline-flex items-center gap-2 mt-5 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              View My Schedules →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {installments.map((it) => (
              <div
                key={it.scheduleId}
                className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-4 md:p-5 hover:border-red-500/30 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#111827] text-sm md:text-base">{it.title}</h3>
                      <OrchestrationStatusBadge type="challenge" value={it.statusKey} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                      <span>
                        Amount:&nbsp;
                        <span className="font-semibold text-[#EA3335]">{formatCurrency(it.amount, it.currency)}</span>
                      </span>
                      {it.nextDate && (
                        <span>
                          Next:&nbsp;
                          <span className="font-semibold text-[#111827]">{it.nextDate}</span>
                        </span>
                      )}
                      {it.failCount > 0 && (
                        <span>
                          Retries:&nbsp;
                          <span className="font-semibold text-[#B45309]">{it.failCount}/3</span>
                        </span>
                      )}
                    </div>
                    {it.tripReason && (
                      <p className="mt-2 text-xs text-[#6B7280] bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-xl px-3 py-2">
                        <span className="font-semibold text-[#111827]">Last failure:</span> {it.tripReason}
                        {it.failureClass === "non_retriable" && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            Needs new card
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/schedules/${encodeURIComponent(it.scheduleId)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[12px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleRetry(it.scheduleId, e)}
                      disabled={retryingId !== null}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {retryingId === it.scheduleId ? (
                        <span className="inline-flex items-center gap-2">{Spinner}Loading…</span>
                      ) : (
                        <>
                          Retry Payment
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default InstallmentActionsListPage;

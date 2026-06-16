"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import DashboardHeader from "../../components/DashboardHeader";
import DetailRow from "@/components/ui/DetailRow";
import { AlertIcon, BacklinkIcon, Spinner } from "@/components/common/SvgIcon";
import { apiRequest } from "@/services/api";
import { SkeletonBlock, SkeletonStack, SkeletonRows } from "@/components/ui/Skeleton";
import { getUserInstallmentAction, getUserScheduleById, syncUserInstallment } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

const frequencyLabel = { Weekly: "week", Monthly: "month", Daily: "day" };

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function formatShortDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function statusClass(statusKey) {
  const s = String(statusKey || "").toLowerCase();
  if (s === "succeeded") return "text-[#047857]";
  if (s === "pending") return "text-[#B45309]";
  if (s === "requires_action") return "text-[#B45309]";
  if (s === "failed") return "text-[#EA3335]";
  if (s === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}

const ScheduleDetailPage = () => {
  const params = useParams();
  const scheduleId = String(params?.slug || "").trim();
  const router = useRouter();
  const searchParams = useSearchParams();
  const installmentId = String(searchParams?.get("installmentId") || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const refreshRef = useRef(null);

  useEffect(() => {
    if (!scheduleId) return;
    let alive = true;
    const refresh = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserScheduleById(scheduleId);
        if (!alive) return;
        const d = res?.data?.data || res?.data || null;
        setData(d);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load schedule.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    refreshRef.current = refresh;
    refresh();
    return () => {
      alive = false;
    };
  }, [scheduleId]);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionData, setActionData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [busy, setBusy] = useState(false);

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
          amount: payload?.amount,
          currency: payload?.currency,
          dueDate: payload?.dueDate,
          title: payload?.title,
        });
      } catch (e) {
        if (!alive) return;
        const msg = e?.message || "Failed to load verification details.";
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
    return () => {
      alive = false;
    };
  }, [installmentId, router]);

  const removeInstallmentQuery = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("installmentId");
    const next = params.toString();
    router.replace(next ? `/dashboard/schedules/${encodeURIComponent(scheduleId)}?${next}` : `/dashboard/schedules/${encodeURIComponent(scheduleId)}`);
  };

  const getStripePublishableKey = async () => {
    const res = await apiRequest("payment/settings");
    const raw = res?.data?.gateways ?? res?.gateways ?? {};
    const gateway = Object.values(raw).find((g) => g?.provider === "stripe");
    const key = gateway?.publishableKey ?? null;
    if (!key) throw new Error("Stripe is not configured.");
    return key;
  };

  const pollSync = async ({ attemptsLeft }) => {
    const res = await syncUserInstallment(installmentId);
    const payload = res?.data?.data ?? res?.data ?? res ?? {};
    const status = String(payload?.status || payload?.installmentStatus || "").trim().toLowerCase();
    if (status) setSyncStatus(status);

    if (status === "processing" && attemptsLeft > 0) {
      await new Promise((r) => window.setTimeout(r, 3500));
      return pollSync({ attemptsLeft: attemptsLeft - 1 });
    }

    if (status === "succeeded") {
      if (typeof refreshRef.current === "function") refreshRef.current();
      removeInstallmentQuery();
    }
    return status || null;
  };

  const handleCompleteVerification = async () => {
    if (!installmentId) return;
    setBusy(true);
    setActionError("");
    try {
      const clientSecret = actionData?.clientSecret;
      if (!clientSecret) throw new Error("Missing Stripe client secret.");
      const publishableKey = await getStripePublishableKey();
      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error("Stripe failed to load.");

      const result = await stripe.confirmCardPayment(clientSecret);
      if (result?.error?.message) {
        setActionError(result.error.message);
      }

      await pollSync({ attemptsLeft: 10 });
    } catch (e) {
      setActionError(e?.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const schedule = data?.schedule || {};
  const allocated = Array.isArray(data?.allocatedCauses?.items) ? data.allocatedCauses.items : [];
  const history = Array.isArray(data?.donationHistory?.items) ? data.donationHistory.items : [];

  const title = String(schedule?.title || "").trim() || "Schedule";
  const currency = String(schedule?.currency || "USD");
  const statusKey = String(schedule?.status?.key || "").trim().toLowerCase();
  const statusLabel = String(schedule?.status?.label || "").trim() || "—";
  const frequency = String(schedule?.frequencyLabel || "").trim() || "—";
  const perLabel = frequencyLabel[frequency] ?? String(frequency || "").toLowerCase();
  const nextDonationAmount = Number(schedule?.nextDonation?.amount ?? 0);
  const startedAt = formatDate(schedule?.startedAt) || "—";
  const nextDate = formatDate(schedule?.nextDonation?.date) || "—";
  const nextShort = formatShortDate(schedule?.nextDonation?.date) || "—";
  const nextAmount = Number((schedule?.nextDonation?.amount ?? schedule?.installmentAmount) || 0);
  const totalDonated = Number(schedule?.totalDonated ?? 0);

  return (
    <>
      <DashboardHeader title={title} subtitle={null} />

      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        {/* Back link */}
        <Link
          href="/dashboard/schedules"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EA3335] hover:text-red-700 transition-colors"
        >
          {BacklinkIcon}
          Back to Schedules
        </Link>

        {installmentId ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[#111827]">Action required to complete your payment</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Complete authentication to finish your scheduled installment.
                </p>
              </div>
              <button
                type="button"
                onClick={removeInstallmentQuery}
                className="shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]"
              >
                Dismiss
              </button>
            </div>

            {actionError ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                <span className="mt-0.5 shrink-0"><AlertIcon size={14} /></span>
                <span className="min-w-0">{actionError}</span>
              </div>
            ) : null}

            {actionLoading ? (
              <SkeletonBlock className="mt-4 h-16 rounded-xl" />
            ) : (
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#111827]">
                    {typeof actionData?.amount === "number"
                      ? formatCurrency(actionData.amount, String(actionData?.currency || currency))
                      : "—"}
                    <span className="text-[#6B7280] font-medium">
                      {actionData?.dueDate ? ` • Due ${formatShortDate(actionData.dueDate)}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[#6B7280] truncate">
                    {actionData?.title ? String(actionData.title) : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || actionLoading}
                    onClick={handleCompleteVerification}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {busy ? <span className="inline-flex items-center gap-2">{Spinner}Processing…</span> : "Complete verification"}
                  </button>
                  <button
                    type="button"
                    disabled={busy || actionLoading}
                    onClick={() => refreshRef.current?.()}
                    className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {syncStatus ? (
              <div className="mt-3 text-xs text-[#6B7280]">
                Status: <span className="font-semibold text-[#111827]">{syncStatus}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 md:gap-5 items-start">
          {/* ── Left column ── */}
          <div className="min-w-0 space-y-4 md:space-y-5">

            {/* Schedule Details */}
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

            {/* Allocated Causes */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-4">Allocated Causes</h2>
              {loading ? (
                <SkeletonBlock className="h-12 rounded-xl" />
              ) : allocated.length ? (
                <div className="space-y-2">
                  {allocated.map((c, idx) => {
                    const label = String(c?.label || "").trim() || "—";
                    const amount = Number(c?.amount ?? 0);
                    const cur = String(c?.currency || currency);
                    return (
                      <div
                        key={String(c?.causeId || idx)}
                        className="flex items-center justify-between rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] px-4 py-3"
                      >
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${causeBadgeStyles[label] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                          {label}
                        </span>
                        <span className="text-sm font-semibold text-[#EA3335]">
                          {formatCurrency(amount, cur)}&nbsp;/&nbsp;{perLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-[#6B7280]">No causes available.</div>
              )}
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-4">Donation History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-120">
                  <thead>
                    <tr className="text-left border-b border-[#E5E7EB]">
                      {["Date", "Amount", "Cause", "Status", "Receipt"].map((h) => (
                        <th
                          key={h}
                          className="pb-3 px-2 first:pl-0 last:pr-0 text-[11px] font-semibold tracking-widest uppercase text-[#6B7280]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={5} className="px-2 py-2.5">
                            <div className="h-8 animate-pulse rounded-xl bg-[#F3F4F6]" />
                          </td>
                        </tr>
                      ))
                    ) : history.length ? (
                      history.map((row, i) => {
                        const date = formatShortDate(row?.date) || "—";
                        const amount = Number(row?.amount ?? 0);
                        const cur = String(row?.currency || currency);
                        const causes = Array.isArray(row?.causes) ? row.causes : [];
                        const causeLabel = String(causes?.[0]?.label || "").trim() || "—";
                        const statusKey2 = String(row?.status?.key || "").trim().toLowerCase();
                        const statusLabel2 = String(row?.status?.label || "").trim() || "—";
                        const statusDot =
                          statusKey2 === "succeeded"
                            ? "bg-[#047857]"
                            : statusKey2 === "pending" || statusKey2 === "requires_action"
                              ? "bg-[#B45309]"
                              : statusKey2 === "failed"
                                ? "bg-[#EA3335]"
                                : statusKey2 === "refunded"
                                  ? "bg-[#6B7280]"
                                  : "bg-[#047857]";
                        return (
                          <tr key={String(row?.transactionId || i)} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-3.5 px-2 first:pl-0 text-[#111827] font-medium">{date}</td>
                            <td className="py-3.5 px-2 text-[#111827] font-semibold">{formatCurrency(amount, cur)}</td>
                            <td className="py-3.5 px-2">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${causeBadgeStyles[causeLabel] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                                {causeLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(statusKey2)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                                {statusLabel2}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 last:pr-0 text-[#6B7280]">—</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-[#6B7280]">
                          No donations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
              {loading ? (
                <div className="space-y-3 p-4">
                  <div className="h-24 animate-pulse rounded-2xl bg-[#F3F4F6]" />
                  <div className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
                </div>
              ) : (
              <div className="px-4 py-4">
                <div className="bg-[#1A1A1A] px-5 py-4 rounded-2xl">
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Total Contributed</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalDonated, currency)}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">Lifetime for this schedule</p>
                </div>

                {/* Next Donation */}
                <div className="border-b px-5 py-4 border-dashed border-[#E5E7EB]">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">Next Donation</p>
                  <p className="text-sm font-semibold text-[#111827]">{nextShort}</p>
                  <div className="mt-3 pt-3 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                    <span>{frequency}</span>
                    <span className="font-semibold text-[#EA3335]">{formatCurrency(nextAmount, currency)}</span>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ScheduleDetailPage;
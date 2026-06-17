"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";
import { BacklinkIcon } from "@/components/common/SvgIcon";
import { getUserInstallmentAction, getUserScheduleById } from "@/services/donationService";
import { ActionBanner } from "./components/ActionBanner";
import { ScheduleDetailsCard } from "./components/ScheduleDetailsCard";
import { AllocatedCausesCard } from "./components/AllocatedCausesCard";
import { DonationHistoryCard } from "./components/DonationHistoryCard";
import { ScheduleSidebar } from "./components/ScheduleSidebar";
const frequencyLabel = { Weekly: "week", Monthly: "month", Daily: "day" };

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return ""; }
}
function formatShortDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

function useScheduleDetail(scheduleId) {
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
        setData(res?.data?.data || res?.data || null);
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
    return () => { alive = false; };
  }, [scheduleId]);

  return { loading, error, data, refreshRef };
}

function useInstallmentAction(installmentId) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionData, setActionData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

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
          clientSecret:    payload?.clientSecret ?? null,
          paymentIntentId: payload?.paymentIntentId ?? null,
          amount:          payload?.amount,
          currency:        payload?.currency,
          dueDate:         payload?.dueDate,
          title:           payload?.title,
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
    return () => { alive = false; };
  }, [installmentId, router]);

  return { actionLoading, actionError, setActionError, actionData, syncStatus, setSyncStatus };
}

const ScheduleDetailPage = () => {
  const params = useParams();
  const scheduleId = String(params?.slug || "").trim();
  const searchParams = useSearchParams();
  const router = useRouter();
  const installmentId = String(searchParams?.get("installmentId") || "").trim();

  const { loading, error, data, refreshRef } = useScheduleDetail(scheduleId);
  const { actionLoading, actionError, setActionError, actionData, syncStatus, setSyncStatus } =
    useInstallmentAction(installmentId);

  const removeInstallmentQuery = () => {
    const p = new URLSearchParams(searchParams?.toString() || "");
    p.delete("installmentId");
    const qs = p.toString();
    router.replace(
      qs
        ? `/dashboard/schedules/${encodeURIComponent(scheduleId)}?${qs}`
        : `/dashboard/schedules/${encodeURIComponent(scheduleId)}`
    );
  };

  const schedule = data?.schedule || {};
  const allocated = Array.isArray(data?.allocatedCauses?.items) ? data.allocatedCauses.items : [];
  const history = Array.isArray(data?.donationHistory?.items) ? data.donationHistory.items : [];

  const currency = String(schedule?.currency || "USD");
  const frequency = String(schedule?.frequencyLabel || "").trim() || "—";
  const perLabel = frequencyLabel[frequency] ?? String(frequency || "").toLowerCase();
  const totalDonated = Number(schedule?.totalDonated ?? 0);
  const nextAmount = Number((schedule?.nextDonation?.amount ?? schedule?.installmentAmount) || 0);

  return (
    <>
      <DashboardHeader title={String(schedule?.title || "").trim() || "Schedule"} subtitle={null} />

      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <Link
          href="/dashboard/schedules"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EA3335] hover:text-red-700 transition-colors"
        >
          {BacklinkIcon}
          Back to Schedules
        </Link>

        {installmentId ? (
          <ActionBanner
            installmentId={installmentId}
            actionLoading={actionLoading}
            actionError={actionError}
            setActionError={setActionError}
            actionData={actionData}
            syncStatus={syncStatus}
            setSyncStatus={setSyncStatus}
            currency={currency}
            onDismiss={removeInstallmentQuery}
            onRefresh={() => refreshRef.current?.()}
          />
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 md:gap-5 items-start">
          <div className="min-w-0 space-y-4 md:space-y-5">
            <ScheduleDetailsCard
              loading={loading}
              statusLabel={String(schedule?.status?.label || "").trim() || "—"}
              frequency={frequency}
              nextDonationAmount={Number(schedule?.nextDonation?.amount ?? 0)}
              nextDate={formatDate(schedule?.nextDonation?.date) || "—"}
              totalDonated={totalDonated}
              startedAt={formatDate(schedule?.startedAt) || "—"}
              currency={currency}
            />
            <AllocatedCausesCard
              loading={loading}
              allocated={allocated}
              currency={currency}
              perLabel={perLabel}
            />
            <DonationHistoryCard
              loading={loading}
              history={history}
              currency={currency}
            />
          </div>

          <ScheduleSidebar
            loading={loading}
            totalDonated={totalDonated}
            currency={currency}
            nextShort={formatShortDate(schedule?.nextDonation?.date) || "—"}
            frequency={frequency}
            nextAmount={nextAmount}
            statusKey={String(schedule?.status?.key || "").trim().toLowerCase()}
          />
        </div>
      </div>
    </>
  );
};

export default ScheduleDetailPage;

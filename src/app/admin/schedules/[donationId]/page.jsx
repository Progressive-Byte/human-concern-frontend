"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { cancelAdminSchedule, getAdminScheduleByDonationId } from "@/services/admin";
import ScheduleDetailHeader from "./components/ScheduleDetailHeader";
import ScheduleDonorCard from "./components/ScheduleDonorCard";
import ScheduleDetailsCard from "./components/ScheduleDetailsCard";
import ScheduleStatsCard from "./components/ScheduleStatsCard";
import ScheduleAllocatedCausesCard from "./components/ScheduleAllocatedCausesCard";
import ScheduleRecentActivityCard from "./components/ScheduleRecentActivityCard";
import SchedulePaymentHistoryTable from "./components/SchedulePaymentHistoryTable";
import ScheduleAdminActionsCard from "./components/ScheduleAdminActionsCard";

function decodeParam(param) {
  const v = Array.isArray(param) ? param[0] : param;
  const s = String(v || "");
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function unwrapObject(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  if (res?.data?.data && typeof res.data.data === "object" && !Array.isArray(res.data.data)) return res.data.data;
  return res && typeof res === "object" ? res : null;
}

export default function AdminScheduleDetailPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useParams();

  const donationId = useMemo(() => decodeParam(params?.donationId), [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  useEffect(() => {
    let alive = true;
    if (!donationId) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminScheduleByDonationId(donationId);
        if (!alive) return;
        setPayload(unwrapObject(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load schedule details.");
        setPayload(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [donationId, refreshKey]);

  const schedule = payload?.schedule && typeof payload.schedule === "object" ? payload.schedule : payload?.data?.schedule || payload?.schedule || null;
  const allocatedCauses = payload?.allocatedCauses || null;
  const stats = payload?.stats || null;
  const recentActivity = Array.isArray(payload?.recentActivity) ? payload.recentActivity : [];
  const paymentHistory = payload?.paymentHistory || null;

  async function handleCancel() {
    if (!donationId) return;
    setCancelLoading(true);
    try {
      await cancelAdminSchedule(donationId);
      toast.success("Schedule cancelled");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Cancel failed");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/schedules")}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to schedules
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <ScheduleDetailHeader schedule={schedule} donationId={donationId} loading={loading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ScheduleDonorCard schedule={schedule} loading={loading} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ScheduleDetailsCard schedule={schedule} stats={stats} loading={loading} />
            <ScheduleStatsCard stats={stats} loading={loading} />
          </div>
          <ScheduleAllocatedCausesCard allocatedCauses={allocatedCauses} loading={loading} />
          <ScheduleRecentActivityCard items={recentActivity} loading={loading} />
        </div>

        <div className="space-y-4">
          <ScheduleAdminActionsCard schedule={schedule} loading={loading} onCancel={handleCancel} cancelLoading={cancelLoading} />
        </div>
      </div>

      <SchedulePaymentHistoryTable paymentHistory={paymentHistory} loading={loading} />
    </main>
  );
}

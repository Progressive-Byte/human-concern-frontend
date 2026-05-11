"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import {
  getAdminDonorActivity,
  getAdminDonorByKey,
  getAdminDonorCauses,
  getAdminDonorDonations,
  getAdminDonorSchedules,
  updateAdminDonorStatus,
} from "@/services/admin";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";
import SendDonorEmailModal from "../components/SendDonorEmailModal";
import DonorDetailHeader from "../components/DonorDetailHeader";
import DonorKpisRow from "../components/DonorKpisRow";
import DonorActionsPanel from "../components/DonorActionsPanel";
import DonorProfileCard from "../components/DonorProfileCard";
import DonorCausesCard from "../components/DonorCausesCard";
import DonorSchedulesCard from "../components/DonorSchedulesCard";
import DonorDonationsTable from "../components/DonorDonationsTable";
import DonorActivityTimeline from "../components/DonorActivityTimeline";
import EditDonorProfileModal from "../components/EditDonorProfileModal";
import DonorTransactionsModal from "../components/DonorTransactionsModal";
import DonorSchedulesModal from "../components/DonorSchedulesModal";
import DonorCausesModal from "../components/DonorCausesModal";
import DonorActivityModal from "../components/DonorActivityModal";

function decodeDonorKey(param) {
  const v = Array.isArray(param) ? param[0] : param;
  const s = String(v || "");
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function unwrapArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function unwrapObject(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  return res || null;
}

function unwrapSummary(res) {
  return res?.summary || res?.data?.summary || res?.data?.data?.summary || null;
}

function normalizePagination(p) {
  if (!p || typeof p !== "object") return null;
  const page = Number(p?.page ?? p?.currentPage ?? 1);
  const limit = Number(p?.limit ?? p?.pageSize ?? 20);
  const total = Number(p?.total ?? p?.totalItems ?? 0);
  const totalPages = Number(p?.totalPages ?? p?.pages ?? (Number.isFinite(limit) && limit > 0 ? Math.ceil(total / limit) : 1));
  return {
    ...p,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  };
}

function unwrapPagination(res) {
  const raw =
    res?.pagination ||
    res?.data?.pagination ||
    res?.data?.data?.pagination ||
    res?.meta?.pagination ||
    res?.data?.meta?.pagination ||
    null;
  return normalizePagination(raw);
}

export default function AdminDonorDetailPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const donorKey = useMemo(() => decodeDonorKey(params?.donorKey), [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [donor, setDonor] = useState(null);
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState({ data: [], summary: null });
  const [causes, setCauses] = useState({ data: [], summary: null });
  const [donations, setDonations] = useState({ data: [], pagination: null, summary: null });
  const [activity, setActivity] = useState({ data: [], pagination: null });

  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [confirmStatusLoading, setConfirmStatusLoading] = useState(false);

  const [emailOpen, setEmailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [causesOpen, setCausesOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!donorKey) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [donorRes, schedulesRes, causesRes, donationsRes, activityRes] = await Promise.all([
          getAdminDonorByKey(donorKey),
          getAdminDonorSchedules(donorKey),
          getAdminDonorCauses(donorKey),
          getAdminDonorDonations(donorKey, { page: "1", limit: "10", sort: "createdAt", order: "desc" }),
          getAdminDonorActivity(donorKey),
        ]);

        if (!alive) return;

        const donorPayload = unwrapObject(donorRes);
        const donorObj = donorPayload?.donor && typeof donorPayload.donor === "object" ? donorPayload.donor : donorPayload;
        const statsObj = donorPayload?.stats && typeof donorPayload.stats === "object" ? donorPayload.stats : null;

        const normalizedDonor = donorObj
          ? {
              ...donorObj,
              key: String(donorObj?.key || donorObj?.donorKey || donorPayload?.donorKey || donorObj?.id || ""),
              type: String(donorObj?.type || donorObj?.donorType || ""),
            }
          : null;

        setDonor(normalizedDonor);
        setStats(statsObj);
        setSchedules({
          data: unwrapArray(schedulesRes),
          summary: unwrapSummary(schedulesRes),
        });
        setCauses({
          data: unwrapArray(causesRes),
          summary: unwrapSummary(causesRes),
        });
        setDonations({
          data: unwrapArray(donationsRes),
          pagination: unwrapPagination(donationsRes),
          summary: unwrapSummary(donationsRes),
        });
        setActivity({
          data: unwrapArray(activityRes),
          pagination: unwrapPagination(activityRes),
        });
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load donor details.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [donorKey]);

  async function confirmToggleStatus() {
    if (!donorKey) return;
    if (String(donor?.type || "").toLowerCase() !== "user") {
      toast.info("Status change applies to registered users only.");
      setConfirmStatusOpen(false);
      return;
    }
    const current = String(donor?.status || "").toLowerCase();
    const nextStatus = current === "active" ? "inactive" : "active";

    setConfirmStatusLoading(true);
    try {
      await updateAdminDonorStatus(donorKey, { status: nextStatus });
      toast.success(nextStatus === "active" ? "Donor activated" : "Donor suspended");
      setDonor((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    } catch (e) {
      toast.error(e?.message || "Status update failed");
    } finally {
      setConfirmStatusLoading(false);
      setConfirmStatusOpen(false);
    }
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/donors")}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to donors
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <DonorDetailHeader donor={donor} loading={loading} onSendEmail={() => setEmailOpen(true)} />

      <DonorKpisRow donor={donor} stats={stats} schedulesSummary={schedules?.summary} loading={loading} />

      <DonorActionsPanel
        donor={donor}
        loading={loading}
        onSendEmail={() => setEmailOpen(true)}
        onToggleStatus={() => setConfirmStatusOpen(true)}
        onEditProfile={() => setEditOpen(true)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonorProfileCard donor={donor} loading={loading} onEdit={() => setEditOpen(true)} />
        <DonorCausesCard causes={causes} loading={loading} onViewAll={() => setCausesOpen(true)} />
        <DonorSchedulesCard schedules={schedules} loading={loading} onViewAll={() => setSchedulesOpen(true)} />
        <DonorDonationsTable donations={donations} loading={loading} onViewAll={() => setTxOpen(true)} />
      </div>

      <DonorActivityTimeline activity={activity} loading={loading} />

      <ConfirmDialog
        open={confirmStatusOpen}
        title="Confirm status change"
        description="Change donor account status?"
        confirmText={String(donor?.status || "").toLowerCase() === "active" ? "Suspend" : "Activate"}
        loading={confirmStatusLoading}
        onConfirm={confirmToggleStatus}
        onClose={() => {
          if (confirmStatusLoading) return;
          setConfirmStatusOpen(false);
        }}
      />

      <SendDonorEmailModal open={emailOpen} donor={donor} onClose={() => setEmailOpen(false)} onSent={() => setEmailOpen(false)} />

      <EditDonorProfileModal
        open={editOpen}
        donorKey={donorKey}
        donor={donor}
        onClose={() => setEditOpen(false)}
        onSaved={(fresh) => {
          if (fresh) setDonor(fresh);
          setEditOpen(false);
        }}
      />

      <DonorTransactionsModal open={txOpen} donorKey={donorKey} onClose={() => setTxOpen(false)} />
      <DonorSchedulesModal open={schedulesOpen} donorKey={donorKey} onClose={() => setSchedulesOpen(false)} />
      <DonorCausesModal open={causesOpen} donorKey={donorKey} onClose={() => setCausesOpen(false)} />
      <DonorActivityModal open={activityOpen} donorKey={donorKey} onClose={() => setActivityOpen(false)} />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import {
  getAdminDonorSchedules,
  getAdminDonors,
  getAdminDonorsSummary,
  updateAdminDonorStatus,
} from "@/services/admin";
import DonorsHeader from "./components/DonorsHeader";
import DonorsSummaryCards from "./components/DonorsSummaryCards";
import DonorsFilters from "./components/DonorsFilters";
import DonorsTable from "./components/DonorsTable";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";
import SendDonorEmailModal from "./components/SendDonorEmailModal";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

function normalizeItemsResponse(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function normalizePagination(res) {
  const p = res?.pagination || res?.data?.pagination || res?.data?.data?.pagination || null;
  if (!p) return null;

  const page = Number(p.page || 1);
  const limit = Number(p.limit || 20);
  const total = Number(p.total || 0);
  const totalPages = Number(p.totalPages || Math.max(1, Math.ceil(total / Math.max(1, limit))));

  return { page, limit, total, totalPages };
}

function normalizeDonor(raw) {
  const key = String(raw?.key || raw?.donorKey || raw?.id || raw?._id || "");
  const name = String(raw?.name || raw?.fullName || raw?.email || "");
  const email = raw?.email || "";
  const phone = raw?.phone || "";
  const type = String(raw?.type || "");
  const status = String(raw?.status || "");
  const totalDonated = typeof raw?.totalDonated === "number" ? raw.totalDonated : Number(raw?.totalDonated || 0);
  const donationCount = Number(raw?.donationCount || 0);
  const lastDonationAt = raw?.lastDonationAt || raw?.updatedAt || null;
  const createdAt = raw?.createdAt || null;

  return { key, name, email, phone, type, status, totalDonated, donationCount, lastDonationAt, createdAt };
}

export default function AdminDonorsPage() {
  const toast = useToast();
  const router = useRouter();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "createdAt",
    order: "desc",
    q: "",
    status: "",
    type: "",
  });
  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState({ totalDonors: 0, activeDonors: 0, recurringDonors: 0, totalDonated: 0 });
  const [recurringByKey, setRecurringByKey] = useState({});
  const recurringRef = useRef({});
  const [refreshKey, setRefreshKey] = useState(0);

  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [confirmStatusLoading, setConfirmStatusLoading] = useState(false);
  const [confirmDonor, setConfirmDonor] = useState(null);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailDonor, setEmailDonor] = useState(null);

  function refresh() {
    setRefreshKey((prev) => prev + 1);
  }

  useEffect(() => {
    recurringRef.current = recurringByKey;
  }, [recurringByKey]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await getAdminDonors({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
          type: filters.type,
        });

        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeDonor);
        setItems(normalized);
        setPagination(normalizePagination(res));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load donors.");
        setItems([]);
        setPagination(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [filters.page, filters.limit, filters.sort, filters.order, debouncedQ, filters.status, filters.type, refreshKey]);

  useEffect(() => {
    let alive = true;

    async function loadSummary() {
      setSummaryLoading(true);
      try {
        const res = await getAdminDonorsSummary();
        if (!alive) return;
        const totalDonors = Number(res?.totalDonors || 0);
        const activeDonors = Number(res?.activeDonors || 0);
        const totalDonated = Number(res?.totalDonated || 0);
        const recurringDonors = res?.recurringDonors !== undefined && res?.recurringDonors !== null ? Number(res.recurringDonors || 0) : 0;
        setSummary({ totalDonors, activeDonors, recurringDonors, totalDonated });
      } catch (e) {
        if (!alive) return;
        setSummary({ totalDonors: 0, activeDonors: 0, recurringDonors: 0, totalDonated: 0 });
      } finally {
        if (!alive) return;
        setSummaryLoading(false);
      }
    }

    loadSummary();
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let alive = true;

    async function loadRecurring() {
      const keys = (Array.isArray(items) ? items : []).map((d) => String(d?.key || "")).filter(Boolean);
      if (keys.length === 0) return;

      const existing = recurringRef.current || {};
      const missing = keys.filter((k) => existing[k] === undefined);
      if (missing.length === 0) return;

      setRecurringByKey((prev) => {
        const next = { ...prev };
        for (const k of missing) next[k] = { loading: true, isRecurring: false };
        return next;
      });

      const queue = [...missing];
      const workerCount = Math.min(5, queue.length);

      async function worker() {
        while (queue.length > 0) {
          const donorKey = queue.shift();
          if (!donorKey) continue;
          try {
            const res = await getAdminDonorSchedules(donorKey);
            const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
            const activeSchedules = Number(
              res?.summary?.activeSchedules ??
                res?.data?.summary?.activeSchedules ??
                res?.data?.data?.summary?.activeSchedules ??
                0
            );
            const isRecurring = activeSchedules > 0 || (Array.isArray(data) && data.length > 0);
            if (!alive) return;
            setRecurringByKey((prev) => ({ ...prev, [donorKey]: { loading: false, isRecurring } }));
          } catch (e) {
            if (!alive) return;
            setRecurringByKey((prev) => ({ ...prev, [donorKey]: { loading: false, isRecurring: false } }));
          }
        }
      }

      await Promise.all(Array.from({ length: workerCount }, () => worker()));
    }

    loadRecurring();
    return () => {
      alive = false;
    };
  }, [items]);

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  const pageRecurringCount = useMemo(() => {
    const keys = (Array.isArray(items) ? items : []).map((d) => String(d?.key || "")).filter(Boolean);
    return keys.filter((k) => Boolean(recurringByKey?.[k]?.isRecurring)).length;
  }, [items, recurringByKey]);

  const summaryForCards = useMemo(() => {
    return {
      totalDonors: Number(summary?.totalDonors || 0),
      activeDonors: Number(summary?.activeDonors || 0),
      recurringDonors: Number(summary?.recurringDonors || 0) || pageRecurringCount,
      totalDonated: Number(summary?.totalDonated || 0),
    };
  }, [summary, pageRecurringCount]);

  function buildExportCsv() {
    const header = ["Donor", "Email", "Status", "Total Donated", "Donations", "Last Donation", "Recurring"];
    const rows = (Array.isArray(items) ? items : []).map((d) => {
      const recurring = recurringByKey?.[d?.key]?.isRecurring ? "Yes" : "";
      return [
        String(d?.name || ""),
        String(d?.email || ""),
        String(d?.status || ""),
        String(Number(d?.totalDonated || 0)),
        String(Number(d?.donationCount || 0)),
        String(d?.lastDonationAt || ""),
        recurring,
      ];
    });
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [header.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    return csv;
  }

  function downloadCsv() {
    try {
      const csv = buildExportCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donors-page-${String(filters.page || 1)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch (e) {
      toast.error("Export failed");
    }
  }

  async function confirmToggleStatus() {
    const donor = confirmDonor;
    if (!donor?.key) return;
    if (String(donor?.type || "").toLowerCase() !== "user") {
      toast.info("Status change applies to registered users only.");
      setConfirmStatusOpen(false);
      setConfirmDonor(null);
      return;
    }

    const current = String(donor?.status || "").toLowerCase();
    const nextStatus = current === "active" ? "inactive" : "active";

    setConfirmStatusLoading(true);
    try {
      await updateAdminDonorStatus(donor.key, { status: nextStatus });
      toast.success(nextStatus === "active" ? "Donor activated" : "Donor suspended");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Status update failed");
    } finally {
      setConfirmStatusLoading(false);
      setConfirmStatusOpen(false);
      setConfirmDonor(null);
    }
  }


  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <DonorsHeader onCreate={() => toast.info("Create donor action still to wire")} onExport={downloadCsv} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <DonorsSummaryCards summary={summaryForCards} loading={summaryLoading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <DonorsFilters
          q={filters.q}
          status={filters.status}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <DonorsTable
        items={items}
        loading={loading}
        pagination={pagination}
        recurringByKey={recurringByKey}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
        onViewDetails={(donor) => {
          if (!donor?.key) return;
          router.push(`/admin/donors/${encodeURIComponent(donor.key)}`);
        }}
        onEditProfile={(donor) => toast.info(`Edit profile for ${donor?.name || donor?.email}`)}
        onToggleStatus={(donor) => {
          setConfirmDonor(donor || null);
          setConfirmStatusOpen(true);
        }}
        onSendEmail={(donor) => {
          setEmailDonor(donor || null);
          setEmailOpen(true);
        }}
      />

      <ConfirmDialog
        open={confirmStatusOpen}
        title="Confirm status change"
        description={
          confirmDonor
            ? `Change status for ${String(confirmDonor?.name || confirmDonor?.email || "this donor")}?`
            : "Change donor status?"
        }
        confirmText={String(confirmDonor?.status || "").toLowerCase() === "active" ? "Suspend" : "Activate"}
        loading={confirmStatusLoading}
        onConfirm={confirmToggleStatus}
        onClose={() => {
          if (confirmStatusLoading) return;
          setConfirmStatusOpen(false);
          setConfirmDonor(null);
        }}
      />

      <SendDonorEmailModal
        open={emailOpen}
        donor={emailDonor}
        onClose={() => {
          setEmailOpen(false);
          setEmailDonor(null);
        }}
        onSent={() => {
          setEmailOpen(false);
          setEmailDonor(null);
        }}
      />
    </main>
  );
}

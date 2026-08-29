"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { ToastProvider } from "@/app/admin/campaigns/components/ToastProvider";
import {
  getReconciliationReports } from "@/services/adminReconciliation";
import ReconciliationHeader from "./components/ReconciliationHeader";
import ReconciliationSummaryCards from "./components/ReconciliationSummaryCards";
import ReconciliationFilters from "./components/ReconciliationFilters";
import ReconciliationTable from "./components/ReconciliationTable";
import ManualRunModal from "./components/ManualRunModal";
import ExpireStaleChallengesModal from "./components/ExpireStaleChallengesModal";

function normalizeItemsResponse(res) {
  const r = res || {};
  if (Array.isArray(r?.data?.items)) return r.data.items;
  if (Array.isArray(r?.data?.data?.items)) return r.data.data.items;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(r?.data)) return r.data;
  return [];
}

function normalizePagination(res) {
  const p =
    res?.meta?.pagination ||
    res?.data?.meta?.pagination ||
    res?.pagination ||
    res?.data?.pagination ||
    res?.data?.data?.pagination ||
    null;
  if (!p) return null;

  const page = Number(p?.page ?? p?.currentPage ?? 1);
  const limit = Number(p?.limit ?? p?.pageSize ?? 20);
  const total = Number(p?.total ?? p?.totalItems ?? 0);
  const totalPages = Number(p?.totalPages ?? (Number.isFinite(limit) && limit > 0 ? Math.ceil(total / limit) : 1));

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    hasPrev: p?.hasPrev ?? undefined,
    hasNext: p?.hasNext ?? undefined,
  };
}

function normalizeSummary(res, items) {
  const s = res?.meta?.summary || res?.data?.meta?.summary || res?.summary || res?.data?.summary || null;
  if (s && typeof s === "object") {
    return {
      totalReports: Number(s?.totalReports ?? s?.total ?? 0),
      completedReports: Number(s?.completedReports ?? s?.completed ?? 0),
      reportsWithMismatches: Number(s?.reportsWithMismatches ?? s?.withMismatches ?? 0),
      activeReports: Number(s?.activeReports ?? s?.running ?? s?.queued ?? 0),
    };
  }

  const rows = Array.isArray(items) ? items : [];
  const completed = rows.filter((r) =>
    ["completed", "completed_with_warnings"].includes(String(r?.status || "").toLowerCase())
  ).length;
  const mismatches = rows.filter((r) => {
    const n = Number(r?.mismatchesTotal ?? r?.mismatchCount ?? 0);
    return n > 0;
  }).length;
  const active = rows.filter((r) =>
    ["queued", "running"].includes(String(r?.status || "").toLowerCase())
  ).length;

  return {
    totalReports: rows.length,
    completedReports: completed,
    reportsWithMismatches: mismatches,
    activeReports: active,
  };
}

function parseCreatedAt(r) {
  return r?.startedAt || r?.createdAt || null;
}

function matchQueuedReport(queuedSignature, item) {
  if (!queuedSignature) return false;
  const { provider, dateStrYYYYMMDD, gatewayConfigurationId } = queuedSignature;
  if (!provider) return false;
  const p = String(item?.provider || "").toLowerCase();
  if (p !== String(provider || "").toLowerCase()) return false;
  const cfg = String(item?.gatewayConfigurationId || item?.configId || "default").toLowerCase();
  if (String(gatewayConfigurationId || "default").toLowerCase() !== cfg) return false;
  if (dateStrYYYYMMDD) {
    const createdAt = parseCreatedAt(item);
    if (createdAt) {
      try {
        const d = new Date(createdAt);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        if (`${y}${m}${day}` !== String(dateStrYYYYMMDD)) return false;
      } catch {
        return false;
      }
    }
  }
  return true;
}

function ReportsPageClient() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "startedAt",
    order: "desc",
    provider: "",
    statuses: [],
    dateFrom: "",
    dateTo: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({
    totalReports: 0,
    completedReports: 0,
    reportsWithMismatches: 0,
    activeReports: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [manualRunOpen, setManualRunOpen] = useState(false);
  const [expireOpen, setExpireOpen] = useState(false);

  const pollRef = useRef({ timer: null, stopAt: 0, signature: null });

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function stopPolling() {
    if (pollRef.current?.timer) {
      window.clearInterval(pollRef.current.timer);
      pollRef.current.timer = null;
    }
    pollRef.current.signature = null;
    pollRef.current.stopAt = 0;
  }

  function startPollingForQueued(sig) {
    stopPolling();
    pollRef.current.signature = sig || null;
    pollRef.current.stopAt = Date.now() + 5 * 60 * 1000;
    pollRef.current.timer = window.setInterval(() => {
      if (Date.now() > pollRef.current.stopAt) {
        stopPolling();
        toast.info("Stopped polling for queued reconciliation run after 5 minutes.");
        return;
      }
      setRefreshKey((v) => v + 1);
    }, 10000);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      setSummaryLoading(true);
      try {
        const res = await getReconciliationReports({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          provider: filters.provider || undefined,
          statuses: Array.isArray(filters.statuses) && filters.statuses.length > 0 ? filters.statuses : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        });

        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = Array.isArray(rawItems) ? rawItems : [];
        setItems(normalized);

        const p = normalizePagination(res);
        setPagination(p);

        const s = normalizeSummary(res, normalized);
        setSummary(s);

        if (pollRef.current?.signature) {
          const match = normalized.find((item) => matchQueuedReport(pollRef.current.signature, item));
          if (match) {
            const status = String(match?.status || "").toLowerCase();
            if (status === "completed" || status === "completed_with_warnings") {
              toast.success(`Reconciliation report ${match?.id ? `#${String(match.id).slice(-6)}` : ""} finished.`);
              stopPolling();
            } else if (status === "failed") {
              toast.error(`Reconciliation report failed. Please review the report detail.`);
              stopPolling();
            }
          }
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load reconciliation reports.");
        setItems([]);
        setPagination(null);
      } finally {
        if (!alive) return;
        setLoading(false);
        setSummaryLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [
    filters.page,
    filters.limit,
    filters.sort,
    filters.order,
    filters.provider,
    filters.statuses,
    filters.dateFrom,
    filters.dateTo,
    refreshKey,
  ]);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  function handleManualQueued(result) {
    const data = result?.data || result || {};
    const sig = {
      provider: data?.provider || null,
      gatewayConfigurationId: data?.gatewayConfigurationId || data?.configId || "default",
      dateStrYYYYMMDD: data?.dateStrYYYYMMDD || null,
    };
    setFilters((prev) => ({ ...prev, page: "1" }));
    startPollingForQueued(sig);
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <ReconciliationHeader
        onRefresh={refresh}
        refreshing={loading}
        onOpenManualRun={() => setManualRunOpen(true)}
        onOpenExpireStale={() => setExpireOpen(true)}
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <ReconciliationSummaryCards summary={summary} loading={summaryLoading} />

      <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <ReconciliationFilters
          provider={filters.provider}
          statuses={filters.statuses}
          limit={filters.limit}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChangeProvider={(next) => setFilters((prev) => ({ ...prev, page: "1", provider: next }))}
          onChangeStatuses={(next) => setFilters((prev) => ({ ...prev, page: "1", statuses: next }))}
          onChangeLimit={(next) => setFilters((prev) => ({ ...prev, page: "1", limit: next }))}
          onChangeDateFrom={(next) => setFilters((prev) => ({ ...prev, page: "1", dateFrom: next }))}
          onChangeDateTo={(next) => setFilters((prev) => ({ ...prev, page: "1", dateTo: next }))}
        />
      </div>

      <ReconciliationTable
        items={items}
        loading={loading}
        pagination={pagination}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
        showingLabel={(shown, total) => `Showing ${shown} of ${total} reconciliation reports`}
        onRerun={() => refresh()}
        onDownload={() => undefined}
      />

      <ManualRunModal
        open={manualRunOpen}
        onClose={() => setManualRunOpen(false)}
        onQueued={handleManualQueued}
      />

      <ExpireStaleChallengesModal
        open={expireOpen}
        onClose={() => setExpireOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
}

const AdminReconciliationPage = () => {
  return (
    <ToastProvider>
      <ReportsPageClient />
    </ToastProvider>
  );
};

export default AdminReconciliationPage;

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { ToastProvider } from "@/app/admin/campaigns/components/ToastProvider";
import {
  getReconciliationReportDetail } from "@/services/adminReconciliation";
import ReconciliationDetailHeader from "../components/ReconciliationDetailHeader";
import ReconciliationDetailKpis from "../components/ReconciliationDetailKpis";
import CategoryFilterBar from "../components/CategoryFilterBar";
import DiscrepanciesTable from "../components/DiscrepanciesTable";
import ResolveDiscrepancyDialog from "../components/ResolveDiscrepancyDialog";

function normalizeReport(raw) {
  const r = raw?.report ?? raw?.data?.report ?? raw?.data?.item ?? raw?.data ?? raw ?? {};
  return r;
}

function normalizeItems(res) {
  const r = res || {};
  const d = res?.data || {};
  if (Array.isArray(r?.discrepancies)) return r.discrepancies;
  if (Array.isArray(d?.discrepancies)) return d.discrepancies;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data?.items)) return d.data.items;
  return [];
}

function normalizePagination(res) {
  const p =
    res?.meta?.pagination ||
    res?.data?.meta?.pagination ||
    res?.pagination ||
    res?.data?.pagination ||
    res?.data?.data?.pagination ||
    res?.discrepancies?.meta?.pagination ||
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

function extractCounts(report) {
  const r = report || {};
  const counts = r?.categoryCounts || r?.categoryBreakdown || r?.stats?.byCategory || {};
  if (!counts || typeof counts !== "object") return null;
  const out = {};
  for (const [k, v] of Object.entries(counts)) {
    const norm = String(k).toUpperCase().replace(/[^A-Z0-9]/g, "_");
    out[norm] = Number(v ?? 0);
  }
  return out;
}

function DetailPageClient({ paramsFromServer }) {
  const params = useParams() || paramsFromServer || {};
  const toast = useToast();

  const reportId = String(params?.reportId || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState({});
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    category: "ALL",
  });

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveDiscrepancyId, setResolveDiscrepancyId] = useState(null);
  const [resolveDiscrepancy, setResolveDiscrepancy] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  useEffect(() => {
    if (!reportId) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getReconciliationReportDetail(reportId, {
          page: filters.page,
          limit: filters.limit,
          category: filters.category || "ALL",
        });

        if (!alive) return;

        const r = normalizeReport(res);
        setReport(r);

        const rows = normalizeItems(res);
        setItems(Array.isArray(rows) ? rows : []);

        const p = normalizePagination(res) || (Array.isArray(rows) ? {
          page: Number(filters.page || 1),
          limit: Number(filters.limit || 20),
          total: rows.length,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
        } : null);
        setPagination(p);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load reconciliation report.");
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
  }, [reportId, filters.page, filters.limit, filters.category, refreshKey]);

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const counts = extractCounts(report);
  const reportCurrency = String(report?.currency || report?.providerCurrency || "USD");

  function handleOpenResolve(id, discrepancy) {
    setResolveDiscrepancyId(id);
    setResolveDiscrepancy(discrepancy);
    setResolveOpen(true);
  }

  function handleResolveSuccess() {
    setFilters((prev) => ({ ...prev }));
    refresh();
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <ReconciliationDetailHeader
        reportId={reportId}
        report={report}
        onRefresh={refresh}
        refreshing={loading}
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <ReconciliationDetailKpis report={report} loading={loading} />

      <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Filter by category</div>
            <div className="mt-2">
              <CategoryFilterBar
                selected={filters.category || "ALL"}
                onChange={(next) => setFilters((prev) => ({ ...prev, page: "1", category: next || "ALL" }))}
                counts={counts}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <select
              value={String(filters.limit || "20")}
              onChange={(e) => setFilters((prev) => ({ ...prev, page: "1", limit: e.target.value }))}
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>
        </div>
      </div>

      <DiscrepanciesTable
        reportId={reportId}
        reportCurrency={reportCurrency}
        items={items}
        loading={loading}
        pagination={pagination}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
        showingLabel={(shown, total) => `Showing ${shown} of ${total} discrepancies`}
        onOpenResolve={handleOpenResolve}
        onRefresh={refresh}
      />

      <ResolveDiscrepancyDialog
        open={resolveOpen}
        reportId={reportId}
        discrepancyId={resolveDiscrepancyId}
        discrepancy={resolveDiscrepancy}
        onClose={() => {
          setResolveOpen(false);
          setResolveDiscrepancyId(null);
          setResolveDiscrepancy(null);
        }}
        onSuccess={handleResolveSuccess}
      />
    </main>
  );
}

const AdminReconciliationDetailPage = () => {
  return (
    <ToastProvider>
      <DetailPageClient />
    </ToastProvider>
  );
};

export default AdminReconciliationDetailPage;

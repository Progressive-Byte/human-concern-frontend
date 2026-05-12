"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { apiBase } from "@/utils/constants";
import { formatCurrency } from "@/utils/helpers";
import { getAdminDonations, getAdminDonationsExportUrl, getAdminDonationsSummary } from "@/services/admin";
import DonationsHeader from "./components/DonationsHeader";
import DonationsSummaryCards from "./components/DonationsSummaryCards";
import DonationsFilters from "./components/DonationsFilters";
import DonationsTable from "./components/DonationsTable";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function toISODate(date) {
  try {
    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function getPresetRange(preset) {
  const key = String(preset || "").toLowerCase();
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (key === "today") {
    const d = toISODate(end);
    return { from: d, to: d };
  }

  if (key === "last7") {
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { from: toISODate(start), to: toISODate(end) };
  }

  if (key === "last30") {
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    return { from: toISODate(start), to: toISODate(end) };
  }

  if (key === "thismonth") {
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { from: toISODate(start), to: toISODate(end) };
  }

  return { from: "", to: "" };
}

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

function normalizeDonation(raw) {
  const id = String(raw?.id || raw?._id || "");

  const donorObj = raw?.donor && typeof raw.donor === "object" ? raw.donor : null;
  const donorName = String(donorObj?.name || raw?.donorName || raw?.name || raw?.donorFullName || "—");
  const donorEmail = String(donorObj?.email || raw?.donorEmail || raw?.email || "");

  const campaignObj = raw?.campaign && typeof raw.campaign === "object" ? raw.campaign : null;
  const campaignName = String(campaignObj?.name || raw?.campaignName || raw?.formName || raw?.campaignTitle || "—");

  const causes = Array.isArray(raw?.causes) ? raw.causes : [];

  const amount = typeof raw?.amount === "number" ? raw.amount : Number(raw?.amount || 0);
  const tipAmount =
    typeof raw?.tipAmount === "number"
      ? raw.tipAmount
      : typeof raw?.tip === "number"
        ? raw.tip
        : typeof raw?.tipCollected === "number"
          ? raw.tipCollected
          : Number(raw?.tipAmount || raw?.tip || 0);
  const currency = String(raw?.currency || "USD");
  const status = String(raw?.status || raw?.paymentStatus || "").toLowerCase();
  const createdAt = raw?.createdAt || raw?.at || raw?.timestamp || null;

  return {
    id,
    donor: { name: donorName, email: donorEmail },
    campaignName,
    causes,
    amount,
    tipAmount,
    currency,
    status,
    createdAt,
  };
}

function unwrapObject(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  if (res?.data?.data && typeof res.data.data === "object" && !Array.isArray(res.data.data)) return res.data.data;
  return res && typeof res === "object" ? res : null;
}

export default function AdminDonationsPage() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "createdAt",
    order: "desc",
    q: "",
    status: "",
    datePreset: "all",
    from: "",
    to: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    completedTransactions: 0,
    totalAmount: 0,
    tipsCollected: 0,
    currency: "USD",
  });

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  const queryScope = useMemo(() => {
    const base = {
      q: debouncedQ,
      status: filters.status,
      from: filters.from || undefined,
      to: filters.to || undefined,
    };
    return base;
  }, [debouncedQ, filters.status, filters.from, filters.to]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminDonations({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
          from: filters.from || undefined,
          to: filters.to || undefined,
        });

        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeDonation);
        setItems(normalized);
        setPagination(normalizePagination(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load transactions.");
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
  }, [
    filters.page,
    filters.limit,
    filters.sort,
    filters.order,
    filters.status,
    filters.from,
    filters.to,
    debouncedQ,
    refreshKey,
  ]);

  useEffect(() => {
    let alive = true;

    async function loadSummary() {
      setSummaryLoading(true);
      try {
        const res = await getAdminDonationsSummary(queryScope);
        if (!alive) return;
        const s = unwrapObject(res) || {};

        const currency = String(s?.currency || summary.currency || "USD");
        setSummary({
          totalTransactions: Number(s?.totalTransactions ?? s?.total ?? 0),
          completedTransactions: Number(s?.completedTransactions ?? s?.completed ?? 0),
          totalAmount: Number(s?.totalAmount ?? 0),
          tipsCollected: Number(s?.tipsCollected ?? s?.totalTips ?? 0),
          currency,
        });
      } catch {
        if (!alive) return;
        const currency = items[0]?.currency || summary.currency || "USD";
        const completed = items.filter((d) => ["completed", "succeeded"].includes(String(d?.status || "").toLowerCase())).length;
        const totalAmount = items.reduce((acc, d) => acc + Number(d?.amount || 0), 0);
        const tipsCollected = items.reduce((acc, d) => acc + Number(d?.tipAmount || 0), 0);
        const totalTransactions = Number(pagination?.total ?? items.length ?? 0);
        setSummary({ totalTransactions, completedTransactions: completed, totalAmount, tipsCollected, currency });
      } finally {
        if (!alive) return;
        setSummaryLoading(false);
      }
    }

    loadSummary();
    return () => {
      alive = false;
    };
  }, [queryScope, refreshKey]);

  function handleExport() {
    try {
      const endpoint = getAdminDonationsExportUrl({
        sort: filters.sort,
        order: filters.order,
        q: debouncedQ,
        status: filters.status,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });

      const base = String(apiBase || "/api/v1/").replace(/\/$/, "");
      const url = `${base}${endpoint}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e?.message || "Export failed.");
    }
  }

  const currency = String(summary?.currency || "USD");

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <DonationsHeader
        onExport={handleExport}
        onRefresh={refresh}
        refreshing={loading}
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <DonationsSummaryCards summary={summary} loading={summaryLoading} currency={currency} />

      <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <DonationsFilters
          q={filters.q}
          status={filters.status}
          limit={filters.limit}
          datePreset={filters.datePreset}
          from={filters.from}
          to={filters.to}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
          onChangeLimit={(next) => setFilters((prev) => ({ ...prev, page: "1", limit: next }))}
          onChangeDatePreset={(next) => {
            const key = String(next || "all");
            if (key === "custom") {
              setFilters((prev) => ({ ...prev, page: "1", datePreset: "custom" }));
              return;
            }
            if (key === "all") {
              setFilters((prev) => ({ ...prev, page: "1", datePreset: "all", from: "", to: "" }));
              return;
            }
            const range = getPresetRange(key);
            setFilters((prev) => ({ ...prev, page: "1", datePreset: key, from: range.from, to: range.to }));
          }}
          onChangeFrom={(next) => setFilters((prev) => ({ ...prev, page: "1", datePreset: "custom", from: next }))}
          onChangeTo={(next) => setFilters((prev) => ({ ...prev, page: "1", datePreset: "custom", to: next }))}
        />
      </div>

      <DonationsTable
        items={items}
        loading={loading}
        pagination={pagination}
        currency={currency}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
        showingLabel={(shown, total) => `Showing ${shown} of ${total} transactions`}
        formatAmount={(v) => formatCurrency(Number(v || 0), currency)}
      />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { formatCurrency } from "@/utils/helpers";
import { getAdminSchedules } from "@/services/admin";
import SchedulesHeader from "./components/SchedulesHeader";
import SchedulesSummaryCards from "./components/SchedulesSummaryCards";
import SchedulesFilters from "./components/SchedulesFilters";
import SchedulesTable from "./components/SchedulesTable";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
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

  const page = Number(p?.page ?? 1);
  const limit = Number(p?.limit ?? 20);
  const total = Number(p?.total ?? 0);
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

function normalizeSummary(res) {
  const s = res?.meta?.summary || res?.data?.meta?.summary || res?.summary || res?.data?.summary || null;
  if (!s || typeof s !== "object") return null;
  return {
    totalSchedules: Number(s?.totalSchedules || 0),
    activeSchedules: Number(s?.activeSchedules || 0),
    uniqueDonors: Number(s?.uniqueDonors || 0),
    estMonthlyValue: Number(s?.estMonthlyValue || 0),
  };
}

function normalizeScheduleRow(raw) {
  const donationId = String(raw?.donationId || raw?.scheduleId || "");
  const formName = String(raw?.formName || "—");
  const donorDisplay = raw?.donorDisplay && typeof raw.donorDisplay === "object" ? raw.donorDisplay : null;
  const donorLabel = String(donorDisplay?.label || "—");
  const donorEmail = donorDisplay?.email ? String(donorDisplay.email) : "";
  const frequencyLabel = String(raw?.frequencyLabel || "—");
  const primaryCauseLabel = String(raw?.primaryCauseLabel || "—");
  const scheduleStatus = String(raw?.scheduleStatus || "").toLowerCase();
  const nextDueDate = raw?.nextDueDate || null;
  const installmentAmount = typeof raw?.installmentAmount === "number" ? raw.installmentAmount : Number(raw?.installmentAmount || 0);
  const currency = String(raw?.currency || "USD");
  const causeType = raw?.causeType ? String(raw.causeType) : "";

  return {
    donationId,
    formName,
    donor: { label: donorLabel, email: donorEmail },
    frequencyLabel,
    primaryCauseLabel,
    scheduleStatus,
    nextDueDate,
    installmentAmount,
    currency,
    causeType,
  };
}

function escapeCsvCell(value) {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export default function AdminSchedulesPage() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "nextDueDate",
    order: "asc",
    q: "",
    status: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ totalSchedules: 0, activeSchedules: 0, estMonthlyValue: 0, uniqueDonors: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminSchedules({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
        });

        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeScheduleRow);
        setItems(normalized);
        setPagination(normalizePagination(res));

        const s = normalizeSummary(res);
        if (s) setSummary(s);
        else {
          const activeSchedules = normalized.filter((x) => String(x?.scheduleStatus || "").toLowerCase() === "active").length;
          const totalSchedules = Number(normalizePagination(res)?.total ?? normalized.length ?? 0);
          const estMonthlyValue = normalized.reduce((acc, x) => acc + Number(x?.installmentAmount || 0), 0);
          const uniqueDonors = new Set(normalized.map((x) => `${x?.donor?.label || ""}|${x?.donor?.email || ""}`)).size;
          setSummary({ totalSchedules, activeSchedules, estMonthlyValue, uniqueDonors });
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load schedules.");
        setItems([]);
        setPagination(null);
        setSummary({ totalSchedules: 0, activeSchedules: 0, estMonthlyValue: 0, uniqueDonors: 0 });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [filters.page, filters.limit, filters.sort, filters.order, filters.status, debouncedQ, refreshKey]);

  const currency = useMemo(() => String(items?.[0]?.currency || "USD"), [items]);

  function handleExport() {
    try {
      const rows = Array.isArray(items) ? items : [];
      if (rows.length === 0) {
        toast.info("No rows to export.");
        return;
      }

      const header = ["donationId", "donorLabel", "donorEmail", "formName", "primaryCauseLabel", "causeType", "frequencyLabel", "installmentAmount", "currency", "nextDueDate", "scheduleStatus"];
      const lines = [header.join(",")];
      for (const r of rows) {
        lines.push(
          [
            r.donationId,
            r?.donor?.label,
            r?.donor?.email,
            r.formName,
            r.primaryCauseLabel,
            r.causeType,
            r.frequencyLabel,
            r.installmentAmount,
            r.currency,
            r.nextDueDate,
            r.scheduleStatus,
          ]
            .map(escapeCsvCell)
            .join(",")
        );
      }

      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedules.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e?.message || "Export failed.");
    }
  }

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <SchedulesHeader onExport={handleExport} onRefresh={refresh} refreshing={loading} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <SchedulesSummaryCards summary={summary} loading={loading} currency={currency} formatAmount={(v) => formatCurrency(Number(v || 0), currency)} />

      <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <SchedulesFilters
          q={filters.q}
          status={filters.status}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <SchedulesTable
        items={items}
        loading={loading}
        pagination={pagination}
        currency={currency}
        formatAmount={(v) => formatCurrency(Number(v || 0), currency)}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
      />
    </main>
  );
}


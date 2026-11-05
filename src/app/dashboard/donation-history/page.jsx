"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { DownloadIcon } from "@/components/common/SvgIcon";
import { exportUserDonationsCsv, getUserDonationsList } from "@/services/donationService";
import { FilterBar } from "./components/FilterBar";
import { DonationTable } from "./components/DonationTable";
import { DonationHistoryFallback } from "./components/DonationHistoryFallback";
function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

const DEFAULT_CAUSE_OPTIONS = [{ value: "all", label: "All Types" }];
const PAGE_SIZE = 20;

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function DonationHistoryPage() {
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [causeOptions, setCauseOptions] = useState(DEFAULT_CAUSE_OPTIONS);

  const debouncedSearch = useDebouncedValue(search, 300);

  // A new search or type filter always starts from the first page.
  const handleSearchChange = (next) => {
    setSearch(next);
    setPage(1);
  };

  const handleCauseChange = (next) => {
    setCause(next);
    setPage(1);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserDonationsList({
          page: String(page), limit: String(PAGE_SIZE), q: debouncedSearch,
          filter: cause, sort: "date", order: "desc",
        });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        const rawCauses = res?.meta?.filters?.causes || res?.data?.meta?.filters?.causes || [];
        const rawPagination = res?.meta?.pagination || res?.data?.meta?.pagination || null;
        const pages = Math.max(1, Number(rawPagination?.pages) || 1);
        // Data can shrink (e.g. status change); keep the page inside range.
        if (page > pages) {
          setPage(pages);
          return;
        }
        setItems(nextItems);
        setPagination({
          page: Number(rawPagination?.page) || page,
          limit: Number(rawPagination?.limit) || PAGE_SIZE,
          total: Number(rawPagination?.total) || 0,
          pages,
        });
        const opts = (Array.isArray(rawCauses) ? rawCauses : [])
          .map((c) => ({
            value: String(c?.key || "").trim(),
            label: `${String(c?.label || "Cause")}${typeof c?.count === "number" ? ` (${c.count})` : ""}`,
          }))
          .filter((o) => o.value);
        setCauseOptions(opts.length ? opts : DEFAULT_CAUSE_OPTIONS);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
        setCauseOptions(DEFAULT_CAUSE_OPTIONS);
        setError(e?.message || "Failed to load donations.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [debouncedSearch, cause, page]);

  const rows = useMemo(() =>
    (Array.isArray(items) ? items : []).map((it, idx) => ({
      // One row per payment now, so the payment id keeps the list keys unique.
      id:        String(it?.transactionId || it?.id || it?.donationId || idx),
      donationId: String(it?.donationId || ""),
      transactionId: String(it?.transactionId || ""),
      date:      formatDate(it?.date) || "—",
      campaign:  String(it?.campaign?.name || "").trim() || "—",
      // Leave blank when the API didn't tell us, so we never show a wrong "One-time".
      typeKey:   it?.type?.key ? String(it.type.key) : "",
      typeLabel: it?.type?.label ? String(it.type.label) : "",
      causes:    (Array.isArray(it?.causes) ? it.causes : [])
        .map((c) => ({ id: String(c?.id || ""), name: String(c?.name || "").trim() }))
        .filter((c) => c.name),
      base:      Number(it?.baseAmount ?? it?.amount ?? 0),
      tip:       Number(it?.tipAmount ?? 0),
      total:     Number(it?.totalAmount ?? it?.amount ?? 0),
      currency:  String(it?.currency || "USD"),
      status:    String(it?.status?.label || "").trim() || "—",
      statusKey: String(it?.status?.key || ""),
      addons:    Array.isArray(it?.addons) ? it.addons : [],
    })),
  [items]);

  const handleExportCsv = async () => {
    try {
      const csv = await exportUserDonationsCsv({ q: debouncedSearch, filter: cause, sort: "date", order: "desc" });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "Export failed.");
    }
  };

  return (
    <>
      <DashboardHeader
        title="Donation History"
        subtitle="View all your past donations"
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 transition-colors cursor-pointer"
          >
            {DownloadIcon}
            Export CSV
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-solid border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <FilterBar
          search={search}
          onSearchChange={handleSearchChange}
          cause={cause}
          onCauseChange={handleCauseChange}
          causeOptions={causeOptions}
        />

        <DonationTable loading={loading} rows={rows} onError={setError} />

        {pagination.pages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-solid border-[#E5E7EB] bg-white px-5 py-4">
            <div className="text-[13px] text-[#6B7280]">
              {`Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} payments`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || loading}
                className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[13px] text-[#6B7280]">{`Page ${pagination.page} of ${pagination.pages}`}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages || loading}
                className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

const DonationHistory = () => (
  <Suspense fallback={<DonationHistoryFallback />}>
    <DonationHistoryPage />
  </Suspense>
);

export default DonationHistory;

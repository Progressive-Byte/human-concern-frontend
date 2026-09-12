"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { formatCurrency } from "@/utils/helpers";
import { SUPPORTED_FORM_CURRENCY_OPTIONS } from "@/utils/currencies";
import { getAdminCampaigns, getAdminForms, getAdminFundBreakdown, exportAdminFundBreakdown } from "@/services/admin";
import FundBreakdownHeader from "./components/FundBreakdownHeader";
import FundBreakdownSummaryCards from "./components/FundBreakdownSummaryCards";
import FundBreakdownFilters from "./components/FundBreakdownFilters";
import FundBreakdownTable from "./components/FundBreakdownTable";

const EMPTY_SUMMARY = { funds: 0, payments: 0, uniqueDonors: 0, totalsByCurrency: [] };

const DEFAULT_FILTERS = {
  page: "1",
  limit: "20",
  sort: "amount",
  order: "desc",
  q: "",
  currency: "",
  campaignIds: [],
  formIds: [],
  from: "",
  to: "",
};

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
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
  const totalPages = Number(
    p?.totalPages ?? (Number.isFinite(limit) && limit > 0 ? Math.ceil(total / limit) : 1)
  );

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  };
}

function normalizeSummary(res) {
  const s = res?.meta?.summary || res?.data?.meta?.summary || res?.summary || null;
  if (!s || typeof s !== "object") return EMPTY_SUMMARY;

  return {
    funds: Number(s?.funds || 0),
    payments: Number(s?.payments || 0),
    uniqueDonors: Number(s?.uniqueDonors || 0),
    totalsByCurrency: Array.isArray(s?.totalsByCurrency)
      ? s.totalsByCurrency.map((item) => ({
          currency: String(item?.currency || ""),
          amount: Number(item?.amount || 0),
        }))
      : [],
  };
}

function normalizeFundRow(raw) {
  return {
    fundCode: String(raw?.fundCode ?? ""),
    currency: String(raw?.currency || ""),
    amount: Number(raw?.amount || 0),
    payments: Number(raw?.payments || 0),
    donationCount: Number(raw?.donationCount || 0),
    uniqueDonors: Number(raw?.uniqueDonors || 0),
    formsCount: Number(raw?.formsCount || 0),
    campaignsCount: Number(raw?.campaignsCount || 0),
    causes: Array.isArray(raw?.causes) ? raw.causes.filter(Boolean).map(String) : [],
    lastPaymentAt: raw?.lastPaymentAt || null,
  };
}

const AdminFundBreakdownPage = () => {
  const toast = useToast();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  const [campaignOptions, setCampaignOptions] = useState([]);
  const [allFormOptions, setAllFormOptions] = useState([]);

  // Filter option lists — loaded once; the form list cascades from the campaign selection.
  useEffect(() => {
    let alive = true;

    async function loadOptions() {
      try {
        const [campaignRes, formRes] = await Promise.all([
          getAdminCampaigns({ page: "1", limit: "200" }),
          getAdminForms({ page: "1", limit: "500" }),
        ]);
        if (!alive) return;

        setCampaignOptions(
          normalizeItemsResponse(campaignRes)
            .map((c) => ({ value: String(c?.id || c?._id || ""), label: String(c?.name || "Untitled campaign") }))
            .filter((option) => option.value)
        );

        setAllFormOptions(
          normalizeItemsResponse(formRes)
            .map((f) => ({
              value: String(f?.id || f?._id || ""),
              label: String(f?.name || "Untitled form"),
              campaignId: String(f?.campaignId || f?.campaign?.id || f?.campaign?._id || ""),
            }))
            .filter((option) => option.value)
        );
      } catch {
        // The dropdowns degrade to empty; the breakdown table still works.
      }
    }

    loadOptions();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminFundBreakdown({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          currency: filters.currency,
          campaignIds: filters.campaignIds,
          formIds: filters.formIds,
          from: filters.from,
          to: filters.to,
        });

        if (!alive) return;

        setItems(normalizeItemsResponse(res).map(normalizeFundRow));
        setPagination(normalizePagination(res));
        setSummary(normalizeSummary(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load the fund breakdown.");
        setItems([]);
        setPagination(null);
        setSummary(EMPTY_SUMMARY);
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
    filters.currency,
    filters.campaignIds,
    filters.formIds,
    filters.from,
    filters.to,
    debouncedQ,
    refreshKey,
  ]);

  const formOptions = useMemo(() => {
    if (!filters.campaignIds.length) return allFormOptions;
    return allFormOptions.filter((option) => filters.campaignIds.includes(option.campaignId));
  }, [allFormOptions, filters.campaignIds]);

  const currencyOptions = useMemo(() => {
    const codes = new Set(SUPPORTED_FORM_CURRENCY_OPTIONS.map((option) => option.code));
    items.forEach((row) => {
      if (row.currency) codes.add(row.currency);
    });
    if (filters.currency) codes.add(filters.currency);
    return Array.from(codes).sort();
  }, [items, filters.currency]);

  const formatAmount = (amount, curr) => formatCurrency(Number(amount || 0), String(curr || "USD"));

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  // Unpaginated CSV built server-side, so "export" means every row matching the
  // filters — not just the page on screen.
  async function handleExport() {
    try {
      setExporting(true);

      const csv = await exportAdminFundBreakdown({
        sort: filters.sort,
        order: filters.order,
        q: debouncedQ,
        currency: filters.currency,
        campaignIds: filters.campaignIds,
        formIds: filters.formIds,
        from: filters.from,
        to: filters.to,
      });

      const text = typeof csv === "string" ? csv : "";
      if (!text.trim() || text.trim().split("\n").length <= 1) {
        toast.info("No rows to export.");
        return;
      }

      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fund-breakdown-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e?.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <FundBreakdownHeader onExport={handleExport} onRefresh={refresh} refreshing={loading} exporting={exporting} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <FundBreakdownSummaryCards summary={summary} loading={loading} formatAmount={formatAmount} />

      {/* z-20: hc-hover-lift sets will-change:transform, which makes both this card and the
          table card stacking contexts. Without a z-index here the later (table) card paints over
          this one and traps the multi-select panels underneath it. */}
      <div className="relative z-20 hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <FundBreakdownFilters
          q={filters.q}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          from={filters.from}
          onChangeFrom={(next) => setFilters((prev) => ({ ...prev, page: "1", from: next }))}
          to={filters.to}
          onChangeTo={(next) => setFilters((prev) => ({ ...prev, page: "1", to: next }))}
          currency={filters.currency}
          currencies={currencyOptions}
          onChangeCurrency={(next) => setFilters((prev) => ({ ...prev, page: "1", currency: next }))}
          campaigns={campaignOptions}
          campaignIds={filters.campaignIds}
          onChangeCampaignIds={(next) => setFilters((prev) => ({ ...prev, page: "1", campaignIds: next }))}
          forms={formOptions}
          formIds={filters.formIds}
          onChangeFormIds={(next) => setFilters((prev) => ({ ...prev, page: "1", formIds: next }))}
          onReset={() => setFilters({ ...DEFAULT_FILTERS })}
        />
      </div>

      <FundBreakdownTable
        items={items}
        loading={loading}
        pagination={pagination}
        formatAmount={formatAmount}
        sort={filters.sort}
        order={filters.order}
        onChangeSort={(nextSort, nextOrder) =>
          setFilters((prev) => ({ ...prev, page: "1", sort: nextSort, order: nextOrder }))
        }
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
      />
    </main>
  );
};

export default AdminFundBreakdownPage;

"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminCampaigns } from "@/services/admin";
import CampaignsHeader from "./components/CampaignsHeader";
import CampaignsSummaryCards from "./components/CampaignsSummaryCards";
import CampaignsFilters from "./components/CampaignsFilters";
import CampaignsTable from "./components/CampaignsTable";
import CampaignUpsertModal from "./components/CampaignUpsertModal";
import { AlertIcon } from "@/components/common/SvgIcon";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function AdminCampaignsPage() {
  const [filters, setFilters] = useState({
    page: "1",
    limit: "10",
    sort: "createdAt",
    order: "desc",
    q: "",
    status: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create");
  const [upsertCampaignId, setUpsertCampaignId] = useState("");

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertCampaignId("");
    setUpsertOpen(true);
  }

  function openEdit(campaignId) {
    setUpsertMode("edit");
    setUpsertCampaignId(String(campaignId || ""));
    setUpsertOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminCampaigns({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
        });
        if (!alive) return;
        setItems(res?.data?.items || []);
        setMeta(res?.meta || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load campaigns.");
        setItems([]);
        setMeta(null);
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

  const currency = useMemo(() => items?.find((i) => i?.currency)?.currency || "USD", [items]);
  const summary = meta?.summary || {};
  const pagination = meta?.pagination || null;

  function setPage(next) {
    setFilters((prev) => ({ ...prev, page: String(next) }));
  }

  return (
    <main className="min-w-0 p-4 md:p-6 space-y-6">
      <CampaignsHeader onCreate={openCreate} />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <CampaignsSummaryCards summary={summary} currency={currency} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <CampaignsFilters
          q={filters.q}
          status={filters.status}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <CampaignsTable
        items={items}
        currency={currency}
        loading={loading}
        pagination={pagination}
        onPrevPage={() => setPage(Math.max(1, Number(pagination?.page || 1) - 1))}
        onNextPage={() => setPage(Number(pagination?.page || 1) + 1)}
        onEdit={openEdit}
        onRefresh={refresh}
      />

      <CampaignUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        campaignId={upsertCampaignId}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
}

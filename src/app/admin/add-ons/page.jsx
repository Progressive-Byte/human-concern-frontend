"use client";

import { useEffect, useMemo, useState } from "react";
import { archiveAdminAddOn, getAdminAddOns, restoreAdminAddOn, toggleAdminAddOn } from "@/services/admin";
import AddOnsHeader from "./components/AddOnsHeader";
import AddOnsSummaryCards from "./components/AddOnsSummaryCards";
import AddOnsFilters from "./components/AddOnsFilters";
import AddOnsTable from "./components/AddOnsTable";
import AddOnUpsertModal from "./components/AddOnUpsertModal";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { AlertIcon } from "@/components/common/SvgIcon";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function normalizeItemsResponse(res) {
  return res?.data?.items || res?.data?.data?.items || res?.items || [];
}

function normalizePagination(res) {
  const p = res?.meta?.pagination || res?.data?.meta?.pagination || res?.data?.data?.meta?.pagination || null;
  if (!p) return null;

  const page = Number(p.page || 1);
  const limit = Number(p.limit || 20);
  const total = Number(p.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { page, limit, total, totalPages };
}

function normalizeAddOn(raw) {
  const id = String(raw?.id || raw?._id || "");
  const iconEmoji = String(raw?.iconEmoji || raw?.icon || raw?.emoji || "");
  const addonName = String(raw?.addonName || raw?.name || "");
  const shortDescription = String(raw?.shortDescription || raw?.description || "");
  const amountFieldLabel = String(raw?.amountFieldLabel || "");
  const amount = typeof raw?.amount === "number" ? raw.amount : Number(raw?.amount || 0);
  const labelUnderAmount = String(raw?.labelUnderAmount || "");
  const enabled = Boolean(raw?.enabled ?? false);
  const status = String(raw?.status || "");
  const pricing = raw?.pricing || null;

  return { id, iconEmoji, addonName, shortDescription, amountFieldLabel, amount, labelUnderAmount, enabled, status, pricing };
}

export default function AdminAddOnsPage() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "createdAt",
    order: "desc",
    q: "",
    status: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create");
  const [upsertAddOn, setUpsertAddOn] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertAddOn(null);
    setUpsertOpen(true);
  }

  function openEdit(addOn) {
    setUpsertMode("edit");
    setUpsertAddOn(addOn || null);
    setUpsertOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminAddOns({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
        });
        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeAddOn);
        setItems(normalized);
        setPagination(normalizePagination(res));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load add-ons.");
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
    debouncedQ,
    refreshKey,
  ]);

  async function handleToggleEnabled(addOnId, nextEnabled) {
    const prevItems = items;
    setItems((prev) => prev.map((a) => (a.id === addOnId ? { ...a, enabled: nextEnabled } : a)));

    try {
      await toggleAdminAddOn(addOnId, Boolean(nextEnabled));
      toast.success(nextEnabled ? "Enabled" : "Disabled");
    } catch (e) {
      setItems(prevItems);
      toast.error(e?.message || "Failed to update.");
    }
  }

  async function handleArchive(addOn) {
    const id = addOn?.id;
    if (!id) return;

    try {
      await archiveAdminAddOn(id);
      toast.success("Archived");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Archive failed.");
    }
  }

  async function handleRestore(addOn) {
    const id = addOn?.id;
    if (!id) return;

    try {
      await restoreAdminAddOn(id);
      toast.success("Restored");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Restore failed.");
    }
  }

  const summary = useMemo(() => {
    const total = items.length;
    const enabled = items.filter((i) => i.enabled).length;
    const archived = items.filter((i) => String(i.status).toLowerCase() === "archived").length;
    return { total, enabled, archived };
  }, [items]);

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <AddOnsHeader onCreate={openCreate} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <AddOnsSummaryCards summary={summary} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <AddOnsFilters
          q={filters.q}
          status={filters.status}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <AddOnsTable
        items={items}
        loading={loading}
        pagination={pagination}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
        onEdit={openEdit}
        onToggleEnabled={handleToggleEnabled}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <AddOnUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        addOn={upsertAddOn}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
}


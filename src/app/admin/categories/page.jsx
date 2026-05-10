"use client";

import { useEffect, useMemo, useState } from "react";
import { archiveAdminCategory, getAdminCategories, restoreAdminCategory } from "@/services/admin";
import CategoriesHeader from "./components/CategoriesHeader";
import CategoriesSummaryCards from "./components/CategoriesSummaryCards";
import CategoriesFilters from "./components/CategoriesFilters";
import CategoriesTable from "./components/CategoriesTable";
import CategoryUpsertModal from "./components/CategoryUpsertModal";
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

function normalizeMeta(res) {
  return res?.meta || res?.data?.meta || res?.data?.data?.meta || null;
}

function normalizeCategory(raw) {
  const id = String(raw?._id || raw?.id || "");
  const key = String(raw?.key || "");
  const name = String(raw?.name || "");
  const status = String(raw?.status || "");
  const createdAt = String(raw?.createdAt || "");
  const updatedAt = String(raw?.updatedAt || "");

  return { id, key, name, status, createdAt, updatedAt };
}

export default function AdminCategoriesPage() {
  const toast = useToast();

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
  const [upsertCategory, setUpsertCategory] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertCategory(null);
    setUpsertOpen(true);
  }

  function openEdit(category) {
    setUpsertMode("edit");
    setUpsertCategory(category || null);
    setUpsertOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminCategories({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
        });
        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeCategory);
        setItems(normalized);
        setMeta(normalizeMeta(res));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load categories.");
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

  async function handleArchive(category) {
    const id = category?.id;
    if (!id) return;

    try {
      await archiveAdminCategory(id);
      toast.success("Archived");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Archive failed.");
    }
  }

  async function handleRestore(category) {
    const id = category?.id;
    if (!id) return;

    try {
      await restoreAdminCategory(id);
      toast.success("Restored");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Restore failed.");
    }
  }

  const computedSummary = useMemo(() => {
    const total = items.length;
    const active = items.filter((c) => String(c.status).toLowerCase() === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [items]);

  const pagination = meta?.pagination || meta?.meta?.pagination || null;

  function setPage(next) {
    setFilters((prev) => ({ ...prev, page: String(next) }));
  }

  const currentPage = Number(pagination?.page || filters.page || 1);
  const limit = Number(pagination?.limit || filters.limit || 10);
  const total = Number(pagination?.total || 0);
  const totalPages = total ? Math.max(1, Math.ceil(total / Math.max(1, limit))) : 1;

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <CategoriesHeader onCreate={openCreate} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <CategoriesSummaryCards summary={meta?.summary || computedSummary} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <CategoriesFilters
          q={filters.q}
          status={filters.status}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <CategoriesTable
        items={items}
        loading={loading}
        pagination={{ page: currentPage, totalPages, total, limit }}
        onPrevPage={() => setPage(Math.max(1, currentPage - 1))}
        onNextPage={() => setPage(Math.min(totalPages, currentPage + 1))}
        onEdit={openEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <CategoryUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        category={upsertCategory}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
}

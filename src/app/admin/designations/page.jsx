"use client";

import { useEffect, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import {
  getAdminDesignations,
  createAdminDesignation,
  updateAdminDesignation,
  archiveAdminDesignation,
  restoreAdminDesignation,
} from "@/services/admin";
import DesignationsHeader from "./components/DesignationsHeader";
import DesignationsFilters from "./components/DesignationsFilters";
import DesignationsTable from "./components/DesignationsTable";
import DesignationUpsertModal from "./components/DesignationUpsertModal";

const DEFAULT_FILTERS = { page: "1", limit: "20", sort: "code", order: "asc", q: "", status: "" };

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
    null;
  if (!p) return null;

  const page = Number(p?.page ?? 1);
  const limit = Number(p?.limit ?? 20);
  const total = Number(p?.total ?? 0);
  const totalPages = Number(p?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1));

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 ? limit : 20,
    total: total >= 0 ? total : 0,
    totalPages: totalPages > 0 ? totalPages : 1,
  };
}

function normalizeDesignationRow(raw) {
  return {
    id: String(raw?.id || raw?._id || ""),
    code: String(raw?.code ?? ""),
    name: String(raw?.name ?? ""),
    status: String(raw?.status || "active"),
  };
}

const AdminDesignationsPage = () => {
  const toast = useToast();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminDesignations({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
        });

        if (!alive) return;

        setItems(normalizeItemsResponse(res).map(normalizeDesignationRow));
        setPagination(normalizePagination(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load designations.");
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
  }, [filters.page, filters.limit, filters.sort, filters.order, filters.status, debouncedQ, refreshKey]);

  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  function openCreate() {
    setEditing(null);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit({ name, code }) {
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateAdminDesignation(editing.id, { name, code });
        toast.info("Designation updated.");
      } else {
        await createAdminDesignation({ name, code });
        toast.info("Designation created.");
      }
      setModalOpen(false);
      setEditing(null);
      refresh();
    } catch (e) {
      setFormError(e?.message || "Failed to save the designation.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(row) {
    setBusyId(row.id);
    try {
      if (row.status === "archived") await restoreAdminDesignation(row.id);
      else await archiveAdminDesignation(row.id);
      refresh();
    } catch (e) {
      toast.error(e?.message || "Failed to update the designation.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <DesignationsHeader onRefresh={refresh} refreshing={loading} onCreate={openCreate} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <div className="relative z-20 hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <DesignationsFilters
          q={filters.q}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          status={filters.status}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
          onReset={() => setFilters({ ...DEFAULT_FILTERS })}
        />
      </div>

      <DesignationsTable
        items={items}
        loading={loading}
        pagination={pagination}
        busyId={busyId}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        onPrevPage={() => setFilters((prev) => ({ ...prev, page: String(Math.max(1, currentPage - 1)) }))}
        onNextPage={() => setFilters((prev) => ({ ...prev, page: String(Math.min(totalPages, currentPage + 1)) }))}
      />

      {modalOpen ? (
        <DesignationUpsertModal
          key={editing?.id ?? "new"}
          initial={editing}
          saving={saving}
          error={formError}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </main>
  );
};

export default AdminDesignationsPage;

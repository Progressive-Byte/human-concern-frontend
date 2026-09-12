"use client";

import { useEffect, useMemo, useState } from "react";
import { archiveAdminDesignation, getAdminDesignations, restoreAdminDesignation } from "@/services/admin";
import DesignationsHeader from "./components/DesignationsHeader";
import DesignationsSummaryCards from "./components/DesignationsSummaryCards";
import DesignationsFilters from "./components/DesignationsFilters";
import DesignationsTable from "./components/DesignationsTable";
import DesignationUpsertModal from "./components/DesignationUpsertModal";
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

function normalizeDesignation(raw) {
  const id = String(raw?._id || raw?.id || "");
  const code = String(raw?.code ?? "");
  const name = String(raw?.name || "");
  const status = String(raw?.status || "");

  return { id, code, name, status };
}

const AdminDesignationsPage = () => {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "50",
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
  const [upsertDesignation, setUpsertDesignation] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertDesignation(null);
    setUpsertOpen(true);
  }

  function openEdit(designation) {
    setUpsertMode("edit");
    setUpsertDesignation(designation || null);
    setUpsertOpen(true);
  }

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

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeDesignation);
        setItems(normalized);
        setMeta(res?.meta || res?.data?.meta || res?.data?.data?.meta || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load designations.");
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

  async function handleArchive(designation) {
    const id = designation?.id;
    if (!id) return;

    try {
      await archiveAdminDesignation(id);
      toast.success("Archived");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Archive failed.");
    }
  }

  async function handleRestore(designation) {
    const id = designation?.id;
    if (!id) return;

    try {
      await restoreAdminDesignation(id);
      toast.success("Restored");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Restore failed.");
    }
  }

  const summary = useMemo(() => {
    const total = items.length;
    const active = items.filter((d) => String(d.status).toLowerCase() === "active").length;
    const archived = items.filter((d) => String(d.status).toLowerCase() === "archived").length;
    return { total, active, archived };
  }, [items]);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <DesignationsHeader onCreate={openCreate} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <DesignationsSummaryCards summary={meta?.summary || summary} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <DesignationsFilters
          q={filters.q}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          status={filters.status}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <DesignationsTable
        items={items}
        loading={loading}
        onEdit={openEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <DesignationUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        designation={upsertDesignation}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
};

export default AdminDesignationsPage;

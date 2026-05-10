"use client";

import { useEffect, useMemo, useState } from "react";
import { archiveAdminCause, deleteAdminCause, getAdminCauses, restoreAdminCause, updateAdminCause } from "@/services/admin";
import CausesHeader from "./components/CausesHeader";
import CausesSummaryCards from "./components/CausesSummaryCards";
import CausesFilters from "./components/CausesFilters";
import CausesTable from "./components/CausesTable";
import CauseUpsertModal from "./components/CauseUpsertModal";
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

function normalizeCause(raw) {
  const id = String(raw?._id || raw?.id || "");
  const name = String(raw?.name || raw?.title || "");
  const description = String(raw?.description || "");
  const icon = String(raw?.iconEmoji || raw?.icon || raw?.emoji || "");
  const zakatEligible = Boolean(raw?.zakatEligible ?? raw?.isZakatEligible ?? raw?.zakat_eligible ?? false);
  const enabled = Boolean(raw?.enabled ?? raw?.isEnabled ?? false);
  const status = String(raw?.status || "");

  return { id, name, description, icon, zakatEligible, enabled, status };
}

export default function AdminCausesPage() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "50",
    sort: "createdAt",
    order: "desc",
    q: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create");
  const [upsertCause, setUpsertCause] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertCause(null);
    setUpsertOpen(true);
  }

  function openEdit(cause) {
    setUpsertMode("edit");
    setUpsertCause(cause || null);
    setUpsertOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminCauses({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
        });
        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeCause);
        setItems(normalized);
        setMeta(res?.meta || res?.data?.meta || res?.data?.data?.meta || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load causes.");
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
  }, [filters.page, filters.limit, filters.sort, filters.order, debouncedQ, refreshKey]);

  async function handleToggleEnabled(causeId, nextEnabled) {
    const prevItems = items;
    setItems((prev) => prev.map((c) => (c.id === causeId ? { ...c, enabled: nextEnabled } : c)));

    try {
      const current = prevItems.find((c) => c.id === causeId) || null;
      await updateAdminCause(causeId, { enabled: Boolean(nextEnabled), iconEmoji: String(current?.icon || "❤️") });
      toast.success(nextEnabled ? "Enabled" : "Disabled");
    } catch (e) {
      setItems(prevItems);
      toast.error(e?.message || "Failed to update.");
    }
  }

  async function handleDelete(cause) {
    const id = cause?.id;
    if (!id) return;

    try {
      await deleteAdminCause(id);
      toast.success("Deleted");
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      toast.error(e?.message || "Delete failed.");
    }
  }

  async function handleArchive(cause) {
    const id = cause?.id;
    if (!id) return;

    try {
      await archiveAdminCause(id);
      toast.success("Archived");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Archive failed.");
    }
  }

  async function handleRestore(cause) {
    const id = cause?.id;
    if (!id) return;

    try {
      await restoreAdminCause(id);
      toast.success("Restored");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Restore failed.");
    }
  }

  const summary = useMemo(() => {
    const total = items.length;
    const enabled = items.filter((c) => c.enabled).length;
    const zakatEligible = items.filter((c) => c.zakatEligible).length;
    return { total, enabled, zakatEligible };
  }, [items]);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <CausesHeader onCreate={openCreate} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <CausesSummaryCards summary={meta?.summary || summary} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <CausesFilters
          q={filters.q}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
        />
      </div>

      <CausesTable
        items={items}
        loading={loading}
        onEdit={openEdit}
        onToggleEnabled={handleToggleEnabled}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <CauseUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        cause={upsertCause}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
}

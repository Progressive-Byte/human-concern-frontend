"use client";

import { useEffect, useMemo, useState } from "react";
import { archiveAdminObjective, getAdminObjectives, restoreAdminObjective } from "@/services/admin";
import ObjectivesHeader from "./components/ObjectivesHeader";
import ObjectivesSummaryCards from "./components/ObjectivesSummaryCards";
import ObjectivesFilters from "./components/ObjectivesFilters";
import ObjectivesTable from "./components/ObjectivesTable";
import ObjectiveUpsertModal from "./components/ObjectiveUpsertModal";
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

function normalizeObjective(raw) {
  const id = String(raw?.id || raw?._id || "");
  const name = String(raw?.name || "");
  const slug = String(raw?.slug || "");
  const description = String(raw?.description || "");
  const iconEmoji = String(raw?.iconEmoji || raw?.icon || raw?.emoji || "");
  const ramadanOnly = Boolean(raw?.ramadanOnly ?? false);
  const status = String(raw?.status || "");
  const createdAt = String(raw?.createdAt || "");

  return { id, name, slug, description, iconEmoji, ramadanOnly, status, createdAt };
}

export default function AdminObjectivesPage() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "createdAt",
    order: "desc",
    q: "",
    status: "",
    ramadanOnly: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create");
  const [upsertObjective, setUpsertObjective] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertObjective(null);
    setUpsertOpen(true);
  }

  function openEdit(objective) {
    setUpsertMode("edit");
    setUpsertObjective(objective || null);
    setUpsertOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminObjectives({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
          ramadanOnly: filters.ramadanOnly,
        });
        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        const normalized = (Array.isArray(rawItems) ? rawItems : []).map(normalizeObjective);
        setItems(normalized);
        setMeta(res?.meta || res?.data?.meta || res?.data?.data?.meta || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load objectives.");
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
  }, [
    filters.page,
    filters.limit,
    filters.sort,
    filters.order,
    filters.status,
    filters.ramadanOnly,
    debouncedQ,
    refreshKey,
  ]);

  async function handleArchive(objective) {
    const id = objective?.id;
    if (!id) return;

    try {
      await archiveAdminObjective(id);
      toast.success("Archived");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Archive failed.");
    }
  }

  async function handleRestore(objective) {
    const id = objective?.id;
    if (!id) return;

    try {
      await restoreAdminObjective(id);
      toast.success("Restored");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Restore failed.");
    }
  }

  const summary = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => String(i.status).toLowerCase() === "active").length;
    const ramadanOnly = items.filter((i) => i.ramadanOnly).length;
    return { total, active, ramadanOnly };
  }, [items]);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <ObjectivesHeader onCreate={openCreate} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <ObjectivesSummaryCards summary={meta?.summary || summary} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <ObjectivesFilters
          q={filters.q}
          status={filters.status}
          ramadanOnly={filters.ramadanOnly}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
          onChangeRamadanOnly={(next) => setFilters((prev) => ({ ...prev, page: "1", ramadanOnly: next }))}
        />
      </div>

      <ObjectivesTable
        items={items}
        loading={loading}
        onEdit={openEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <ObjectiveUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        objective={upsertObjective}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </main>
  );
}

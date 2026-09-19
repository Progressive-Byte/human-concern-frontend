"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminRoles,
  getAdminSystemUsers,
  activateAdminSystemUser,
  deactivateAdminSystemUser,
} from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { AlertIcon } from "@/components/common/SvgIcon";
import UsersSummaryCards from "./UsersSummaryCards";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";
import UserUpsertModal from "./UserUpsertModal";
import ResetPasswordModal from "./ResetPasswordModal";

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

function normalizeUser(raw) {
  const roles = Array.isArray(raw?.roles) ? raw.roles : [];
  return {
    id: String(raw?._id || raw?.id || ""),
    name: String(raw?.name || ""),
    email: String(raw?.email || ""),
    status: String(raw?.status || ""),
    lastLoginAt: raw?.lastLoginAt || null,
    roles: roles.map((r) => ({
      id: String(r?.id || r?._id || ""),
      key: String(r?.key || ""),
      name: String(r?.name || ""),
    })),
  };
}

function normalizeRole(raw) {
  return {
    id: String(raw?._id || raw?.id || ""),
    key: String(raw?.key || ""),
    name: String(raw?.name || ""),
    permissionKeys: Array.isArray(raw?.permissionKeys) ? raw.permissionKeys : [],
    isSystem: Boolean(raw?.isSystem),
  };
}

const UsersTab = () => {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "10",
    sort: "createdAt",
    order: "desc",
    q: "",
    roleId: "",
    status: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create");
  const [upsertUser, setUpsertUser] = useState(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertUser(null);
    setUpsertOpen(true);
  }

  function openEdit(user) {
    setUpsertMode("edit");
    setUpsertUser(user || null);
    setUpsertOpen(true);
  }

  function openReset(user) {
    setResetUser(user || null);
    setResetOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function loadRoles() {
      setRolesError("");
      try {
        const res = await getAdminRoles();
        if (!alive) return;
        const raw = normalizeItemsResponse(res);
        setRoles((Array.isArray(raw) ? raw : []).map(normalizeRole));
      } catch (err) {
        if (!alive) return;
        setRolesError(err?.message || "Failed to load roles.");
      }
    }

    loadRoles();
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminSystemUsers({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          roleId: filters.roleId,
          status: filters.status,
        });
        if (!alive) return;

        const rawItems = normalizeItemsResponse(res);
        setItems((Array.isArray(rawItems) ? rawItems : []).map(normalizeUser));
        setMeta(normalizeMeta(res));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load system users.");
        setItems([]);
        setMeta(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [filters.page, filters.limit, filters.sort, filters.order, filters.roleId, filters.status, debouncedQ, refreshKey]);

  async function handleSetStatus(user, nextStatus) {
    const id = user?.id;
    if (!id) return;

    try {
      if (nextStatus === "active") await activateAdminSystemUser(id);
      else await deactivateAdminSystemUser(id);
      toast.success(nextStatus === "active" ? "User activated" : "User deactivated");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Action failed.");
    }
  }

  const computedSummary = useMemo(() => {
    const total = items.length;
    const active = items.filter((u) => String(u.status).toLowerCase() === "active").length;
    const disabled = items.filter((u) => String(u.status).toLowerCase() === "disabled").length;
    return { total, active, disabled };
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
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/10">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          Create User
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      {rolesError ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-amber-800">{rolesError}</div>
        </div>
      ) : null}

      <UsersSummaryCards summary={meta?.summary || computedSummary} loading={loading} />

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <UsersFilters
          q={filters.q}
          roleId={filters.roleId}
          status={filters.status}
          roles={roles}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeRoleId={(next) => setFilters((prev) => ({ ...prev, page: "1", roleId: next }))}
          onChangeStatus={(next) => setFilters((prev) => ({ ...prev, page: "1", status: next }))}
        />
      </div>

      <UsersTable
        items={items}
        loading={loading}
        pagination={{ page: currentPage, totalPages, total, limit }}
        onPrevPage={() => setPage(Math.max(1, currentPage - 1))}
        onNextPage={() => setPage(Math.min(totalPages, currentPage + 1))}
        onEdit={openEdit}
        onResetPassword={openReset}
        onSetStatus={handleSetStatus}
      />

      <UserUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        user={upsertUser}
        roles={roles}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />

      <ResetPasswordModal
        open={resetOpen}
        user={resetUser}
        onClose={() => setResetOpen(false)}
        onSuccess={() => refresh()}
      />
    </div>
  );
};

export default UsersTab;

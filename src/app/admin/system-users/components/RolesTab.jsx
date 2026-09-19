"use client";

import { useEffect, useState } from "react";
import { getAdminRoles, getAdminPermissions, deleteAdminRole } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { AlertIcon } from "@/components/common/SvgIcon";
import RolesTable from "./RolesTable";
import RoleUpsertModal from "./RoleUpsertModal";

function normalizeItemsResponse(res) {
  return res?.data?.items || res?.data?.data?.items || res?.items || [];
}

function normalizeGroups(res) {
  const groups = res?.data?.groups || res?.groups || res?.data?.data?.groups || [];
  return Array.isArray(groups) ? groups : [];
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

const RolesTab = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create");
  const [upsertRole, setUpsertRole] = useState(null);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  function openCreate() {
    setUpsertMode("create");
    setUpsertRole(null);
    setUpsertOpen(true);
  }

  function openEdit(role) {
    setUpsertMode("edit");
    setUpsertRole(role || null);
    setUpsertOpen(true);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [rolesRes, permsRes] = await Promise.all([getAdminRoles(), getAdminPermissions()]);
        if (!alive) return;

        const rawRoles = normalizeItemsResponse(rolesRes);
        setRoles((Array.isArray(rawRoles) ? rawRoles : []).map(normalizeRole));
        setPermissionGroups(normalizeGroups(permsRes));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load roles.");
        setRoles([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  async function handleDelete(role) {
    const id = role?.id;
    if (!id) return;

    try {
      await deleteAdminRole(id);
      toast.success("Role deleted");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Delete failed.");
    }
  }

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
          Create Role
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <RolesTable items={roles} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

      <RoleUpsertModal
        open={upsertOpen}
        mode={upsertMode}
        role={upsertRole}
        permissionGroups={permissionGroups}
        onClose={() => setUpsertOpen(false)}
        onSuccess={() => refresh()}
      />
    </div>
  );
};

export default RolesTab;

"use client";

import { useEffect, useMemo, useState } from "react";
import { createAdminRole, updateAdminRole } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import PermissionMatrix from "./PermissionMatrix";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const RoleUpsertModal = ({ open, mode, role, permissionGroups, onClose, onSuccess }) => {
  const toast = useToast();
  const isEdit = mode === "edit";
  const isSystemRole = Boolean(role?.isSystem);
  const readOnly = isEdit && isSystemRole;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [permissionKeys, setPermissionKeys] = useState([]);

  const title = useMemo(() => {
    if (readOnly) return "View System Role";
    return isEdit ? "Edit Role" : "Create Role";
  }, [isEdit, readOnly]);

  const primaryLabel = useMemo(() => (isEdit ? "Save Changes" : "Create Role"), [isEdit]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);

    if (!isEdit) {
      setName("");
      setKey("");
      setPermissionKeys([]);
      return;
    }

    setName(String(role?.name || ""));
    setKey(String(role?.key || ""));
    setPermissionKeys(Array.isArray(role?.permissionKeys) ? [...role.permissionKeys] : []);
  }, [open, isEdit, role]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (readOnly) return;
    setError("");

    const trimmedName = String(name || "").trim();
    if (!trimmedName) {
      setError("Role name is required.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const id = String(role?.id || "");
        if (!id) throw new Error("Missing role id.");
        await updateAdminRole(id, { name: trimmedName, permissionKeys });
        toast.success("Role updated");
      } else {
        const payload = { name: trimmedName, permissionKeys };
        const derivedKey = slugify(key) || slugify(trimmedName);
        if (derivedKey) payload.key = derivedKey;
        await createAdminRole(payload);
        toast.success("Role created");
      }

      onSuccess?.();
      onClose?.();
    } catch (e2) {
      const msg = e2?.message || "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative max-h-[calc(100vh-32px)] w-full max-w-[880px] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Tick the permissions this role can access. Users get the combined permissions of all their roles.
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {readOnly ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              System roles are managed automatically and cannot be changed.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Role Name</div>
                <input
                  value={name}
                  disabled={readOnly}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="e.g. Content Editor"
                />
              </div>

              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Key</div>
                <input
                  value={key}
                  disabled={readOnly || isEdit}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="auto from name"
                />
                <div className="mt-1 text-[12px] text-[#6B7280]">Lowercase id used by the API. Fixed after creation.</div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Permissions</div>
              <PermissionMatrix
                groups={permissionGroups}
                value={permissionKeys}
                onChange={setPermissionKeys}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                {readOnly ? "Close" : "Cancel"}
              </button>
              {!readOnly ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-60"
                >
                  {loading ? "Saving..." : primaryLabel}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleUpsertModal;

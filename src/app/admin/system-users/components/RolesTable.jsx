"use client";

import { useEffect, useRef, useState } from "react";
import RowActionsPanel from "@/app/admin/components/RowActionsPanel";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";

const RolesTable = ({ items, loading, onEdit, onDelete }) => {
  const rows = Array.isArray(items) ? items : [];
  const [openId, setOpenId] = useState("");
  const [confirmRole, setConfirmRole] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!openId) return;
    function onDocDown(e) {
      const el = wrapRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setOpenId("");
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [openId]);

  async function runDelete() {
    if (!confirmRole?.id) return;
    setLoadingDelete(true);
    try {
      await onDelete?.(confirmRole);
    } finally {
      setLoadingDelete(false);
      setConfirmRole(null);
    }
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Roles</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Role permissions decide which areas and actions each user can access.
        </p>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <div className="space-y-3 px-5 py-4">
          <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No roles found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Role</th>
                <th className="py-3 pr-4">Key</th>
                <th className="py-3 pr-4">Permissions</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((role) => (
                <tr
                  key={role?.id || role?.key}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-[#111827]">{role?.name || "—"}</div>
                  </td>
                  <td className="py-4 pr-4 align-top font-mono text-[12px] text-[#6B7280]">{role?.key || "—"}</td>
                  <td className="py-4 pr-4 align-top text-[#6B7280]">
                    {Array.isArray(role?.permissionKeys) ? role.permissionKeys.length : 0}
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                        role?.isSystem ? "bg-red-500/10 text-red-700" : "bg-[#F3F4F6] text-[#374151]"
                      }`}
                    >
                      {role?.isSystem ? "System" : "Custom"}
                    </span>
                  </td>
                  <td className="py-4 pr-5 align-top text-right">
                    <div ref={openId === role.id ? wrapRef : null} className="relative inline-flex">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-red-500/10"
                        aria-label="Row actions"
                        onClick={() => setOpenId((v) => (v === role.id ? "" : role.id))}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#111827]" fill="none">
                          <path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </button>

                      <RowActionsPanel
                        open={openId === role.id}
                        anchorRef={wrapRef}
                        className="w-[190px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-2 shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenId("");
                            onEdit?.(role);
                          }}
                          className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                        >
                          <span>{role?.isSystem ? "View" : "Edit"}</span>
                        </button>

                        {!role?.isSystem ? (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenId("");
                              setConfirmRole(role);
                            }}
                            className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-red-600 transition hover:bg-red-500/10"
                          >
                            <span>Delete</span>
                          </button>
                        ) : null}
                      </RowActionsPanel>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmRole)}
        title="Delete role?"
        description={
          confirmRole
            ? `"${confirmRole.name || confirmRole.key}" will be removed. Roles assigned to users cannot be deleted.`
            : ""
        }
        confirmText="Delete"
        loading={loadingDelete}
        onClose={() => setConfirmRole(null)}
        onConfirm={runDelete}
      />
    </section>
  );
};

export default RolesTable;

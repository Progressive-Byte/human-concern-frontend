"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RowActionsPanel from "@/app/admin/components/RowActionsPanel";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";
import { useAdminAuth } from "@/context/AdminAuthContext";

function buildMenu({ isSelf, status }) {
  const items = [{ key: "edit", label: "Edit" }];

  if (!isSelf) {
    if (String(status || "").toLowerCase() === "active") {
      items.push({ key: "deactivate", label: "Deactivate" });
    } else {
      items.push({ key: "activate", label: "Activate" });
    }
    items.push({ key: "reset-password", label: "Reset Password" });
  }

  return items;
}

function getConfirmCopy(action) {
  if (action === "deactivate") {
    return {
      title: "Deactivate user?",
      description: "A disabled user cannot sign in to the admin panel.",
      confirmText: "Deactivate",
    };
  }
  if (action === "activate") {
    return {
      title: "Activate user?",
      description: "This will restore the user's access to the admin panel.",
      confirmText: "Activate",
    };
  }
  return { title: "Confirm action", description: "", confirmText: "Confirm" };
}

const UserRowActions = ({ item, onEdit, onResetPassword, onSetStatus }) => {
  const { admin } = useAdminAuth();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [loading, setLoading] = useState(false);

  const isSelf = Boolean(admin?.id && item?.id && String(admin.id) === String(item.id));
  const menu = useMemo(() => buildMenu({ isSelf, status: item?.status }), [isSelf, item?.status]);

  useEffect(() => {
    if (!open) return;
    function onDocDown(e) {
      const el = wrapRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  async function runAction(action) {
    if (!item?.id) return;
    setLoading(true);
    try {
      if (action === "activate") await onSetStatus?.(item, "active");
      if (action === "deactivate") await onSetStatus?.(item, "disabled");
    } finally {
      setLoading(false);
      setConfirmAction("");
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-red-500/10"
        aria-label="Row actions"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#111827]" fill="none">
          <path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      <RowActionsPanel
        open={open}
        anchorRef={wrapRef}
        className="w-[200px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-2 shadow-lg"
      >
        {menu.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              setOpen(false);
              if (m.key === "edit") onEdit?.(item);
              else if (m.key === "reset-password") onResetPassword?.(item);
              else setConfirmAction(m.key);
            }}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <span>{m.label}</span>
          </button>
        ))}
      </RowActionsPanel>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={getConfirmCopy(confirmAction).title}
        description={getConfirmCopy(confirmAction).description}
        confirmText={getConfirmCopy(confirmAction).confirmText}
        loading={loading}
        onClose={() => setConfirmAction("")}
        onConfirm={() => runAction(confirmAction)}
      />
    </div>
  );
};

export default UserRowActions;

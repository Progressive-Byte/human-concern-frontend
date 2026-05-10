"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";

function buildMenu(status) {
  const s = String(status || "").toLowerCase();
  const items = [{ key: "edit", label: "Edit" }];

  if (s === "archived") items.push({ key: "restore", label: "Restore" });
  else items.push({ key: "archive", label: "Archive" });

  return items;
}

function getConfirmCopy(action) {
  if (action === "archive") return { title: "Archive category?", description: "Archived categories are removed from active use.", confirmText: "Archive" };
  if (action === "restore") return { title: "Restore category?", description: "This will restore the category from archived state.", confirmText: "Restore" };
  return { title: "Confirm action", description: "", confirmText: "Confirm" };
}

export default function CategoryRowActions({ item, onEdit, onArchive, onRestore }) {
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [loading, setLoading] = useState(false);

  const menu = useMemo(() => buildMenu(item?.status), [item?.status]);

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
      if (action === "archive") await onArchive?.(item);
      if (action === "restore") await onRestore?.(item);
    } finally {
      setLoading(false);
      setConfirmAction("");
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-red-500/10"
        aria-label="Row actions"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#111827]" fill="none">
          <path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="hc-animate-dropdown absolute right-0 top-[44px] z-20 w-[200px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-2 shadow-lg">
          {menu.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setOpen(false);
                if (m.key === "edit") onEdit?.(item);
                else setConfirmAction(m.key);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      ) : null}

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
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./ToastProvider";
import {
  archiveAdminCampaign,
  publishAdminCampaign,
  restoreAdminCampaign,
  unpublishAdminCampaign,
} from "@/services/admin";

function buildMenu(status) {
  const s = String(status || "").toLowerCase();
  const items = [{ key: "view", label: "View" }, { key: "edit", label: "Edit" }];

  if (s === "draft") items.push({ key: "publish", label: "Publish" }, { key: "archive", label: "Archive" });
  if (s === "published") items.push({ key: "unpublish", label: "Unpublish" }, { key: "archive", label: "Archive" });
  if (s === "archived") items.push({ key: "restore", label: "Restore" });

  return items;
}

function getConfirmCopy(action) {
  if (action === "publish") return { title: "Publish campaign?", description: "This will make the campaign available as published." };
  if (action === "unpublish") return { title: "Unpublish campaign?", description: "This will move the campaign back from published state." };
  if (action === "archive") return { title: "Archive campaign?", description: "Archived campaigns are removed from active use." };
  if (action === "restore") return { title: "Restore campaign?", description: "This will restore the campaign from archived state." };
  return { title: "Confirm action", description: "" };
}

export default function CampaignRowActions({ item, onEdit, onRefresh }) {
  const router = useRouter();
  const toast = useToast();
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
    const id = item?.id;
    if (!id) return;

    setLoading(true);
    try {
      if (action === "publish") await publishAdminCampaign(id);
      if (action === "unpublish") await unpublishAdminCampaign(id);
      if (action === "archive") await archiveAdminCampaign(id);
      if (action === "restore") await restoreAdminCampaign(id);

      toast.success(
        action === "publish"
          ? "Published"
          : action === "unpublish"
            ? "Unpublished"
            : action === "archive"
              ? "Archived"
              : action === "restore"
                ? "Restored"
                : "Done"
      );
      onRefresh?.();
    } catch (e) {
      const msg = e?.message || "Action failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
      setConfirmAction("");
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white"
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
                if (m.key === "edit") onEdit?.(item?.id);
                else if (m.key === "view") router.push(`/admin/campaigns/${item?.id}`);
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
        confirmText="Confirm"
        loading={loading}
        onClose={() => setConfirmAction("")}
        onConfirm={() => runAction(confirmAction)}
      />
    </div>
  );
}


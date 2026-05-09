"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { archiveAdminForm, publishAdminForm, restoreAdminForm, unpublishAdminForm } from "@/services/admin";

function buildMenu(status) {
  const s = String(status || "").toLowerCase();
  const items = [];

  items.push({ key: "edit", label: "Edit" });
  if (s === "draft") items.push({ key: "publish", label: "Publish" }, { key: "archive", label: "Archive" });
  if (s === "published") items.push({ key: "unpublish", label: "Move to Draft" }, { key: "archive", label: "Archive" });
  if (s === "archived") items.push({ key: "restore", label: "Restore" });

  return items;
}

function getConfirmCopy(action) {
  if (action === "publish") return { title: "Publish form?", description: "This will make the form available as published." };
  if (action === "unpublish") return { title: "Move to draft?", description: "This will move the form back to draft state." };
  if (action === "archive") return { title: "Archive form?", description: "Archived forms are removed from active use." };
  if (action === "restore") return { title: "Restore form?", description: "This will restore the form from archived state." };
  return { title: "Confirm action", description: "" };
}

export default function FormRowActions({ item, onRefresh, campaignIdFilter = "" }) {
  const router = useRouter();
  const toast = useToast();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [loading, setLoading] = useState(false);

  const id = item?.id || item?.formId || item?._id;
  const campaignId = item?.campaignId || item?.campaign?._id || item?.campaign?.id || campaignIdFilter;
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
    if (!id) return;
    setLoading(true);
    try {
      if (action === "publish") await publishAdminForm(id);
      if (action === "unpublish") await unpublishAdminForm(id);
      if (action === "archive") await archiveAdminForm(id);
      if (action === "restore") await restoreAdminForm(id);

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
      toast.error(e?.message || "Action failed.");
    } finally {
      setLoading(false);
      setConfirmAction("");
    }
  }

  if (!id) {
    return <span className="text-[12px] text-[#6B7280]">—</span>;
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
                if (m.key === "edit") {
                  const cid = String(campaignId || "").trim();
                  if (!cid) {
                    toast.error("Missing campaignId for this form");
                    return;
                  }
                  router.push(
                    `/admin/forms/new?step=basics&campaignId=${encodeURIComponent(cid)}&formId=${encodeURIComponent(String(id))}`
                  );
                  return;
                }
                setConfirmAction(m.key);
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

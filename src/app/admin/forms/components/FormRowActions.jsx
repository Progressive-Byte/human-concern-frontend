"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RowActionsPanel from "@/app/admin/components/RowActionsPanel";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/admin/campaigns/components/ConfirmDialog";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { archiveAdminForm, publishAdminForm, restoreAdminForm, unpublishAdminForm } from "@/services/admin";
import { hcusaSiteUrl, home } from "@/utils/constants";

function buildMenu(status, formKind) {
  const s = String(status || "").toLowerCase();
  const items = [];

  items.push({ key: "edit", label: "Edit" });
  // The public link only resolves once the form is published. A simple form opens on the HCUSA
  // site's standalone page; a complex one on this platform's own campaign page.
  items.push({ key: "copyUrl", label: "Copy Form URL", disabled: s !== "published" });
  // Only a simple form has an embed page; the complex wizard is not built to sit in an iframe.
  if (formKind === "simple") {
    items.push({ key: "embed", label: "Embed Code", disabled: s !== "published" });
  }
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

const FormRowActions = ({ item, onRefresh, campaignIdFilter = "" }) => {
  const router = useRouter();
  const toast = useToast();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [embedOpen, setEmbedOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const id = item?.id || item?.formId || item?._id;
  const campaignId = item?.campaignId || item?.campaign?._id || item?.campaign?.id || campaignIdFilter;
  // Rows saved before the field existed have no value and behave as complex.
  const formKind = item?.formKind === "simple" ? "simple" : "complex";
  const menu = useMemo(() => buildMenu(item?.status, formKind), [item?.status, formKind]);

  /**
   * Public link for this specific donation form.
   *
   * A complex form lives on this platform's own site: {home}/{slug}/1.
   * A simple form is drawn by the HCUSA site, on its standalone page: {hcusaSiteUrl}/donate/form.
   * `siteUrl` is the API and would be wrong for both.
   */
  async function copyFormUrl() {
    const slug = String(item?.slug || "").trim();
    if (!slug) {
      toast.error("This form has no public link yet.");
      return;
    }

    const url =
      formKind === "simple"
        ? `${hcusaSiteUrl}/donate/form?slug=${encodeURIComponent(slug)}`
        : `${home}/${encodeURIComponent(slug)}/1`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Form URL copied");
    } catch {
      window.prompt("Copy this form URL", url);
    }
  }

  /**
   * The snippet a site owner pastes into WordPress or any other page.
   *
   * It is an iframe of the embed page, so the form keeps running on the HCUSA site: the same
   * fields, the same card step, and the same payment call to the donation platform. A widget
   * script would have to ship all of that again.
   */
  function buildEmbedCode() {
    const slug = String(item?.slug || "").trim();
    if (!slug) return "";

    const url = `${hcusaSiteUrl}/donate/embed?slug=${encodeURIComponent(slug)}`;

    return `<iframe src="${url}" title="Donation form" loading="lazy" style="width:100%;max-width:480px;height:900px;border:0;display:block;margin:0 auto;"></iframe>`;
  }

  async function copyEmbedCode() {
    const code = buildEmbedCode();

    if (!code) {
      toast.error("This form has no public link yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast.success("Embed code copied");
    } catch {
      window.prompt("Copy this embed code", code);
    }
  }

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
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white"
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
        className="w-[200px] rounded-2xl border border-solid border-[#E5E7EB] bg-white p-2 shadow-lg"
      >
          {menu.map((m) => (
            <button
              key={m.key}
              type="button"
              disabled={Boolean(m.disabled)}
              title={m.disabled ? "Publish this form first" : undefined}
              onClick={() => {
                if (m.disabled) return;
                setOpen(false);
                if (m.key === "edit") {
                  const cid = String(campaignId || "").trim();
                  if (!cid) {
                    toast.error("Missing campaignId for this form");
                    return;
                  }
                  if (formKind === "simple") {
                    router.push(
                      `/admin/forms/simple/new?campaignId=${encodeURIComponent(cid)}&formId=${encodeURIComponent(String(id))}`
                    );
                    return;
                  }
                  router.push(
                    `/admin/forms/new?step=basics&campaignId=${encodeURIComponent(cid)}&formId=${encodeURIComponent(String(id))}`
                  );
                  return;
                }
                if (m.key === "copyUrl") {
                  copyFormUrl();
                  return;
                }
                if (m.key === "embed") {
                  setEmbedOpen(true);
                  return;
                }
                setConfirmAction(m.key);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium transition ${
                m.disabled
                  ? "cursor-not-allowed text-[#9CA3AF]"
                  : "cursor-pointer text-[#111827] hover:bg-[#F9FAFB]"
              }`}
            >
              <span>{m.label}</span>
            </button>
          ))}
      </RowActionsPanel>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={getConfirmCopy(confirmAction).title}
        description={getConfirmCopy(confirmAction).description}
        confirmText="Confirm"
        loading={loading}
        onClose={() => setConfirmAction("")}
        onConfirm={() => runAction(confirmAction)}
      />

      {embedOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => setEmbedOpen(false)}
            className="absolute inset-0 cursor-pointer bg-black/40"
            aria-label="Close"
          />

          <div className="relative w-full max-w-[560px] rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5 shadow-lg">
            <div className="text-[16px] font-semibold text-[#111827]">Embed Code</div>
            <p className="mt-1 text-[12px] text-[#6B7280]">
              Paste this into a WordPress page or any other site. Change the height if the form is
              cut off.
            </p>

            <textarea
              readOnly
              rows={5}
              value={buildEmbedCode()}
              onFocus={(e) => e.target.select()}
              className="mt-3 w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 font-mono text-[12px] leading-relaxed text-[#111827]"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmbedOpen(false)}
                className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={copyEmbedCode}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-red-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default FormRowActions;
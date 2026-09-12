"use client";

import { useEffect, useMemo, useState } from "react";
import { createAdminDesignation, updateAdminDesignation } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

const DesignationUpsertModal = ({ open, mode, designation, onClose, onSuccess }) => {
  const toast = useToast();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const title = useMemo(() => (isEdit ? "Edit Designation" : "Create New Designation"), [isEdit]);
  const primaryLabel = useMemo(() => (isEdit ? "Save Changes" : "Create Designation"), [isEdit]);

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
      setCode("");
      return;
    }

    setName(String(designation?.name || ""));
    setCode(String(designation?.code || ""));
  }, [open, isEdit, designation]);

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
    setError("");

    const payload = {
      name: String(name || "").trim(),
      code: String(code || "").trim(),
    };

    if (!payload.name) {
      setError("Designation name is required.");
      return;
    }
    if (!payload.code) {
      setError("Designation code is required.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const id = String(designation?.id || "");
        if (!id) throw new Error("Missing designation id.");
        await updateAdminDesignation(id, payload);
        toast.success("Designation updated");
      } else {
        await createAdminDesignation(payload);
        toast.success("Designation created");
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

      <div className="hc-animate-dropdown relative w-full max-w-[560px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">Designation codes are used to tag donations for reporting.</div>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Designation Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="e.g. AF - Afghanistan"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Designation Code</div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                placeholder="e.g. 100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : primaryLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesignationUpsertModal;

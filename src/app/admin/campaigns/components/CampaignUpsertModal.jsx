"use client";

import { useEffect, useMemo, useState } from "react";
import { createAdminCampaign, getAdminCampaignById, getAdminCampaigns, updateAdminCampaign } from "@/services/admin";
import { useToast } from "./ToastProvider";

const CampaignUpsertModal = ({ open, mode, campaignId, onClose, onSuccess }) => {
  const toast = useToast();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  /**
   * Suggest possibly-duplicate campaigns while the admin types the name.
   * Warning only — it never blocks creation. All setState lives inside the timer callback.
   */
  const [similarCampaigns, setSimilarCampaigns] = useState([]);

  useEffect(() => {
    if (!open) return undefined;

    const term = String(name || "").trim();
    let alive = true;

    const timer = setTimeout(
      async () => {
        if (term.length < 4) {
          if (alive) setSimilarCampaigns([]);
          return;
        }

        try {
          const res = await getAdminCampaigns({ page: "1", limit: "5", q: term });
          if (!alive) return;

          const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
          setSimilarCampaigns(
            (Array.isArray(items) ? items : [])
              .filter((c) => String(c?.id || c?._id || "") !== String(campaignId || ""))
              .map((c) => ({
                id: String(c?.id || c?._id || ""),
                name: String(c?.name || "Untitled campaign"),
                status: String(c?.status || ""),
              }))
              .filter((c) => c.id)
          );
        } catch {
          if (alive) setSimilarCampaigns([]);
        }
      },
      term.length < 4 ? 0 : 400
    );

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [open, name, campaignId]);

  const title = useMemo(() => (isEdit ? "Edit Campaign" : "Create Campaign"), [isEdit]);
  const primaryLabel = useMemo(() => (isEdit ? "Save Changes" : "Create Campaign"), [isEdit]);

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
      setSlug("");
      setDescription("");
      return;
    }

    if (!campaignId) return;

    let alive = true;
    setFetching(true);
    (async () => {
      try {
        const res = await getAdminCampaignById(campaignId);
        if (!alive) return;
        const d = res?.data?.data || res?.data?.item || res?.data?.campaign || res?.data || {};
        setName(String(d?.name || ""));
        setSlug(String(d?.slug || ""));
        setDescription(String(d?.description || ""));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load campaign.");
      } finally {
        if (!alive) return;
        setFetching(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, isEdit, campaignId]);

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
      description: String(description || "").trim(),
    };

    if (!payload.name) {
      setError("Name is required.");
      return;
    }
    if (!payload.description) {
      setError("Description is required.");
      return;
    }

    if (isEdit) {
      const nextSlug = String(slug || "").trim();
      if (nextSlug) payload.slug = nextSlug;
    }

    setLoading(true);
    try {
      const res = isEdit ? await updateAdminCampaign(campaignId, payload) : await createAdminCampaign(payload);
      toast.success(isEdit ? "Campaign updated" : "Campaign created");
      onSuccess?.(res?.data || null);
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

      <div className="hc-animate-dropdown relative w-full max-w-[560px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">{title}</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              {isEdit ? "Update campaign container fields." : "Create a campaign container (draft)."}
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

          {fetching ? (
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
              {isEdit ? <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" /> : null}
              <div className="h-28 animate-pulse rounded-xl bg-[#F3F4F6]" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                  placeholder="Campaign name"
                />
              </div>

              {similarCampaigns.length > 0 ? (
                <div className="rounded-xl border border-dashed border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                  <div className="text-[13px] font-semibold text-[#92400E]">
                    A similar campaign already exists: {similarCampaigns[0].name}
                  </div>
                  <p className="mt-1 text-[12px] text-[#92400E]">
                    Review it first so you don&apos;t create a duplicate. This is only a suggestion — you
                    can still create this campaign.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {similarCampaigns.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => window.open(`/admin/campaigns/${encodeURIComponent(c.id)}`, "_blank", "noopener,noreferrer")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-semibold text-[#92400E] transition hover:bg-[#FEF3C7]"
                      >
                        {c.name}
                        {c.status ? <span className="text-[11px] font-medium text-[#B45309]">({c.status})</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isEdit ? (
                <div>
                  <div className="mb-2 text-[13px] font-semibold text-[#111827]">Slug</div>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                    placeholder="campaign-slug"
                  />
                </div>
              ) : null}

              <div>
                <div className="mb-2 text-[13px] font-semibold text-[#111827]">Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                  placeholder="Describe this campaign container"
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
          )}
        </div>
      </div>
    </div>
  );
}
export default CampaignUpsertModal;
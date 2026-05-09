"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAdminFormMedia, updateAdminFormMedia } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { siteUrl } from "@/utils/constants";
import WizardFooterNav from "./WizardFooterNav";

function normalizeMediaResponse(res) {
  return res?.data?.data || res?.data?.item || res?.data?.media || res?.data || {};
}

function toImageObj(value) {
  if (!value) return null;
  if (typeof value === "string") return { path: value, alt: "" };
  const path = String(value?.path || "").trim();
  if (!path) return null;
  return { path, alt: String(value?.alt || "").trim() };
}

function toImageList(value) {
  const list = Array.isArray(value) ? value : [];
  return list.map(toImageObj).filter(Boolean);
}

function resolveAssetUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${siteUrl}${p}`;
  return `${siteUrl}/${p}`;
}

function isValidUrl(value) {
  const s = String(value || "").trim();
  if (!s) return true;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function PreviewEmpty({ label = "Select an image to preview" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 16V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 16l4-4a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 0 2.8 0L17 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 20h7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-[12px] text-[#6B7280]">{label}</div>
    </div>
  );
}

export default function WizardStepMedia({ campaignId, formId, onExit, onSaved }) {
  const toast = useToast();

  const thumbnailInputRef = useRef(null);
  const sliderInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [sliderFiles, setSliderFiles] = useState([]);
  const [sliderPreviewUrls, setSliderPreviewUrls] = useState([]);

  const [videoUrl, setVideoUrl] = useState("");

  const [serverThumbnail, setServerThumbnail] = useState(null);
  const [serverSliderImages, setServerSliderImages] = useState([]);

  const hasLocalThumbnail = Boolean(thumbnailFile && thumbnailPreviewUrl);
  const hasLocalSlider = sliderFiles.length > 0 && sliderPreviewUrls.length > 0;

  const activeThumbnailPreview = hasLocalThumbnail ? thumbnailPreviewUrl : resolveAssetUrl(serverThumbnail?.path);
  const activeSliderPreviews = useMemo(() => {
    if (hasLocalSlider) return sliderPreviewUrls;
    return serverSliderImages.map((x) => resolveAssetUrl(x.path)).filter(Boolean);
  }, [hasLocalSlider, sliderPreviewUrls, serverSliderImages]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      for (const u of sliderPreviewUrls) URL.revokeObjectURL(u);
    };
  }, []);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setTopError("");

    (async () => {
      try {
        const res = await getAdminFormMedia(formId);
        if (!alive) return;
        const d = normalizeMediaResponse(res);

        const thumb = toImageObj(d?.thumbnailImage);
        const sliders = toImageList(d?.sliderImages);
        const video = String(d?.videoUrl || "").trim();

        setServerThumbnail(thumb);
        setServerSliderImages(sliders);
        setVideoUrl(video);
      } catch (e) {
        if (!alive) return;
        setTopError(e?.message || "Failed to load media.");
        setServerThumbnail(null);
        setServerSliderImages([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  function chooseThumbnail() {
    thumbnailInputRef.current?.click?.();
  }

  function chooseSliders() {
    sliderInputRef.current?.click?.();
  }

  function onThumbnailChange(e) {
    const file = e?.target?.files?.[0] || null;
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  }

  function onSliderChange(e) {
    const files = Array.from(e?.target?.files || []);
    for (const u of sliderPreviewUrls) URL.revokeObjectURL(u);
    const clipped = files.slice(0, 10);
    setSliderFiles(clipped);
    setSliderPreviewUrls(clipped.map((f) => URL.createObjectURL(f)));
  }

  function removeThumbnail() {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(null);
    setThumbnailPreviewUrl("");
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  }

  function removeSliderAt(index) {
    setSliderFiles((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      next.splice(index, 1);
      return next;
    });
    setSliderPreviewUrls((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const removed = next.splice(index, 1)[0];
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
    if (sliderInputRef.current) sliderInputRef.current.value = "";
  }

  async function save({ goNext } = { goNext: false }) {
    setTopError("");

    if (!campaignId) {
      toast.error("Missing campaignId");
      return { ok: false };
    }
    if (!formId) {
      toast.error("Complete Basics first");
      return { ok: false };
    }

    const nextVideoUrl = String(videoUrl || "").trim();
    if (!isValidUrl(nextVideoUrl)) {
      toast.error("Video URL must be a valid URL");
      return { ok: false };
    }

    const hasAnyFile = Boolean(thumbnailFile) || sliderFiles.length > 0;
    const hasServerThumbnail = Boolean(serverThumbnail?.path);

    let body;
    if (hasAnyFile) {
      const fd = new FormData();
      if (thumbnailFile) fd.append("thumbnailImage", thumbnailFile);
      for (const f of sliderFiles) fd.append("sliderImages", f);
      if (nextVideoUrl) fd.append("videoUrl", nextVideoUrl);
      body = fd;
      if (!thumbnailFile && !hasServerThumbnail) {
        toast.error("Thumbnail image is required");
        return { ok: false };
      }
    } else {
      const thumb = serverThumbnail?.path
        ? { path: serverThumbnail.path, alt: serverThumbnail.alt || undefined }
        : undefined;
      body = JSON.stringify({
        ...(thumb ? { thumbnailImage: thumb } : {}),
        ...(Array.isArray(serverSliderImages) && serverSliderImages.length
          ? { sliderImages: serverSliderImages.map((x) => ({ path: x.path, alt: x.alt || undefined })) }
          : {}),
        ...(nextVideoUrl ? { videoUrl: nextVideoUrl } : { videoUrl: "" }),
      });
    }

    setSaving(true);
    try {
      const res = await updateAdminFormMedia(formId, body);
      const d = normalizeMediaResponse(res);
      const thumb = toImageObj(d?.thumbnailImage) || serverThumbnail;
      const sliders = toImageList(d?.sliderImages) || serverSliderImages;

      setServerThumbnail(thumb);
      setServerSliderImages(sliders);
      if (typeof d?.videoUrl === "string") setVideoUrl(d.videoUrl);

      toast.success("Media saved");
      onSaved?.();

      if (goNext) {
        onExit?.({ nextStep: "review" });
      }
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save media.";
      setTopError(String(msg).includes("FORM_NOT_EDITABLE") ? "Form can’t be edited (not draft)." : msg);
      toast.error(msg);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }

  if (!formId) {
    return (
      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600">
        Missing formId. Please complete Basics first to create the draft form.
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onExit?.({ nextStep: "basics" })}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Back to Basics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topError ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {topError}
        </div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Campaign Media</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Add images and media to make your campaign stand out</p>
        </div>

        <div className="mt-5 space-y-6">
          <div>
            <div className="text-[13px] font-semibold text-[#111827]">
              Thumbnail Image <span className="text-red-600">*</span>
            </div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Used as the main preview image</div>

            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={onThumbnailChange} className="hidden" />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={chooseThumbnail}
                disabled={saving}
                className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Choose Image
              </button>
              {thumbnailFile ? <div className="text-[12px] text-[#6B7280]">{thumbnailFile.name}</div> : null}
              {thumbnailFile ? (
                <button
                  type="button"
                  onClick={removeThumbnail}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
              {loading ? (
                <div className="h-56 w-full animate-pulse rounded-2xl bg-white" />
              ) : activeThumbnailPreview ? (
                <img src={activeThumbnailPreview} alt="Thumbnail preview" className="w-full max-h-80 object-contain rounded-2xl bg-white" />
              ) : (
                <PreviewEmpty />
              )}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-[#111827]">Slider Images (Optional)</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Up to 10 images</div>

            <input
              ref={sliderInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onSliderChange}
              className="hidden"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={chooseSliders}
                disabled={saving}
                className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Choose Images
              </button>
              {sliderFiles.length ? <div className="text-[12px] text-[#6B7280]">{sliderFiles.length} selected</div> : null}
            </div>

            {loading ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="h-28 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
                ))}
              </div>
            ) : activeSliderPreviews.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <PreviewEmpty label="Select images to preview" />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {activeSliderPreviews.map((src, idx) => {
                  const canRemoveLocal = hasLocalSlider;
                  return (
                    <div key={`${src}-${idx}`} className="hc-hover-lift relative rounded-2xl border border-[#E5E7EB] bg-white p-2">
                      {canRemoveLocal ? (
                        <button
                          type="button"
                          onClick={() => removeSliderAt(idx)}
                          disabled={saving}
                          className="absolute right-2 top-2 rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      ) : null}
                      <img src={src} alt={`Slider preview ${idx + 1}`} className="w-full aspect-[4/3] object-cover rounded-xl" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Video URL (Optional)</div>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <div className="mt-1 text-[12px] text-[#6B7280]">Must be a valid URL</div>
            </div>
          </div>
        </div>
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "addons" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        nextLabel="Next"
      />
    </div>
  );
}

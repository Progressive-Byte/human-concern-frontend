"use client";

import { useEffect, useState } from "react";
import { getAdminFormUnavailablePage, updateAdminFormUnavailablePage } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import useStepAutosave from "../hooks/useStepAutosave";
import FieldError from "./FieldError";
import WizardFooterNav from "./WizardFooterNav";

function normalizeUnavailableResponse(res) {
  const d = res?.data?.data || res?.data || {};
  const up = d?.unavailablePage || d;
  return up && typeof up === "object" ? up : {};
}

function isValidButtonUrl(value) {
  const s = String(value || "").trim();
  if (!s) return true;
  return /^(https?:\/\/|\/)/.test(s);
}

function textOrEmpty(value) {
  return String(value ?? "");
}

const WizardStepUnavailable = ({ campaignId, formId, onExit, onSaved }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [primaryLabel, setPrimaryLabel] = useState("");
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [secondaryLabel, setSecondaryLabel] = useState("");
  const [secondaryUrl, setSecondaryUrl] = useState("");

  function applyServerValue(up) {
    setTitle(textOrEmpty(up?.title));
    setDescription(textOrEmpty(up?.description));
    setPrimaryLabel(textOrEmpty(up?.primaryButton?.label));
    setPrimaryUrl(textOrEmpty(up?.primaryButton?.url));
    setSecondaryLabel(textOrEmpty(up?.secondaryButton?.label));
    setSecondaryUrl(textOrEmpty(up?.secondaryButton?.url));
  }

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
        const res = await getAdminFormUnavailablePage(formId);
        if (!alive) return;
        applyServerValue(normalizeUnavailableResponse(res));
      } catch (e) {
        if (!alive) return;
        setTopError(e?.message || "Failed to load the unavailable page.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  // Same autosave contract as every other step: all editable fields are deps, and the
  // silent save runs the real PATCH + re-read.
  useStepAutosave({
    formId,
    deps: [title, description, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl],
    ready: !loading,
    persist: () => save({ silent: true }),
  });

  function validate() {
    const errors = {};
    const values = { title: title.trim(), description: description.trim() };

    const buttons = [
      ["primaryButton", primaryLabel.trim(), primaryUrl.trim()],
      ["secondaryButton", secondaryLabel.trim(), secondaryUrl.trim()],
    ];
    for (const [key, label, url] of buttons) {
      if (Boolean(label) !== Boolean(url)) {
        errors[key] = "Button label and URL are required together";
        continue;
      }
      if (url && !isValidButtonUrl(url)) {
        errors[`${key}.url`] = "Enter an http(s) link or a path starting with /";
      }
    }

    const payload = {
      title: values.title,
      description: values.description,
      primaryButton: { label: primaryLabel.trim(), url: primaryUrl.trim() },
      secondaryButton: { label: secondaryLabel.trim(), url: secondaryUrl.trim() },
    };

    return { errors, payload };
  }

  async function save({ goNext = false, silent = false } = {}) {
    if (!silent) setTopError("");

    if (!campaignId) {
      if (!silent) toast.error("Missing campaignId");
      return { ok: false, error: "Missing campaignId" };
    }
    if (!formId) {
      if (!silent) toast.error("Complete Basics first");
      return { ok: false, error: "Complete Basics first" };
    }

    const { errors, payload } = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      if (!silent) toast.error("Fix the highlighted fields");
      return { ok: false, error: "Fix the highlighted fields" };
    }
    setFieldErrors({});

    if (!silent) setSaving(true);
    try {
      const res = await updateAdminFormUnavailablePage(formId, payload);
      // Reflect exactly what the server stored, so Save Draft and autosave agree.
      applyServerValue(normalizeUnavailableResponse(res));
      if (!silent) toast.success("Unavailable page saved");
      onSaved?.();
      if (goNext) onExit?.({ nextStep: "review" });
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save the unavailable page.";
      if (!silent) {
        setTopError(String(msg).includes("FORM_NOT_EDITABLE") ? "Form can’t be edited (not draft)." : msg);
        toast.error(msg);
      }
      return { ok: false, error: msg };
    } finally {
      if (!silent) setSaving(false);
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

  const inputClass =
    "w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60";

  return (
    <div className="space-y-6">
      {topError ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {topError}
        </div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Unavailable Page</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Shown on the public page while this form is not published. Optional — sensible defaults are
            used when left empty.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign currently unavailable"
              maxLength={120}
              disabled={saving}
              className={inputClass}
            />
            <FieldError message={fieldErrors.title} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="This campaign is not currently accepting donations."
              maxLength={500}
              disabled={saving}
              className="min-h-30 w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
            />
            <FieldError message={fieldErrors.description} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Primary Button Label</div>
              <input
                value={primaryLabel}
                onChange={(e) => setPrimaryLabel(e.target.value)}
                placeholder="Go to Homepage"
                maxLength={60}
                disabled={saving}
                className={inputClass}
              />
              <FieldError message={fieldErrors.primaryButton} />
            </div>
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Primary Button URL</div>
              <input
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                placeholder="/"
                maxLength={500}
                disabled={saving}
                className={inputClass}
              />
              <FieldError message={fieldErrors["primaryButton.url"]} />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Secondary Button Label</div>
              <input
                value={secondaryLabel}
                onChange={(e) => setSecondaryLabel(e.target.value)}
                placeholder="View Other Campaigns"
                maxLength={60}
                disabled={saving}
                className={inputClass}
              />
              <FieldError message={fieldErrors.secondaryButton} />
            </div>
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Secondary Button URL</div>
              <input
                value={secondaryUrl}
                onChange={(e) => setSecondaryUrl(e.target.value)}
                placeholder="/campaigns"
                maxLength={500}
                disabled={saving}
                className={inputClass}
              />
              <FieldError message={fieldErrors["secondaryButton.url"]} />
            </div>
          </div>
          <div className="text-[12px] text-[#6B7280]">
            URLs must be an http(s) link or a path starting with <span className="font-semibold">/</span>.
            Leave a button fully empty to hide it.
          </div>
        </div>
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "media" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        previewHref={formId ? `/admin/forms/preview/1?formId=${encodeURIComponent(formId)}` : ""}
        nextLabel="Next"
      />
    </div>
  );
};

export default WizardStepUnavailable;

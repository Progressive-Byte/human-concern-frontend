"use client";

import { useEffect, useMemo, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { createAdminCampaignForm, getAdminCategories, getAdminFormBasics, getAdminForms, updateAdminFormBasics } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

// Hardcoded for now. "Special" is a UI grouping only — the stored value is always the concrete type.
const SPECIAL_TYPES = [
  { value: "normal", label: "Normal Campaign", hint: "No special handling" },
  { value: "ramadan", label: "Ramadan Campaign", hint: "Extra requirements apply" },
  { value: "qurbani", label: "Qurbani Campaign", hint: "Coming soon", disabled: true },
];
import useStepAutosave from "../hooks/useStepAutosave";
import { siteUrl } from "@/utils/constants";
import FieldError from "./FieldError";
import WizardFooterNav from "./WizardFooterNav";

function isMongoId(value) {
  return /^[a-fA-F0-9]{24}$/.test(String(value || "").trim());
}

function isDigits(value) {
  return /^[0-9]+$/.test(String(value || "").trim());
}

function isInternalCampaignId(value) {
  return /^[0-9]+(-[0-9]+)*$/.test(String(value || "").trim());
}

function buildGeneratedInternalCampaignId() {
  const suffix = Math.floor(100 + Math.random() * 900);
  return `1-${suffix}`;
}

function resolveAssetUrl(value) {
  const raw =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? value?.url || value?.path || value?.location || value?.src
        : "";
  const p = String(raw || "").trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${siteUrl}${p}`;
  return `${siteUrl}/${p}`;
}

function normalizeBasicsResponse(res) {
  return res?.data?.data || res?.data?.item || res?.data?.basics || res?.data || {};
}

function isActiveCategory(cat) {
  const status = String(cat?.status || "").trim().toLowerCase();
  if (!status) return true;
  return status === "active";
}

// Internal Basics fields hidden from the UI.
//
// These are HIDDEN, not removed: their state, handlers and payload entries are all
// kept, so any value already saved on a form round-trips untouched, and re-enabling
// a field is a one-line change here. Hidden fields are also optional in validation.
// (Fund codes live in their own dedicated place; the separate "Causes" wizard step
// is unrelated and unaffected.)
const HIDDEN_INTERNAL_FIELDS = new Set(["fundCause", "fundCode", "beneficiaryId", "locationId"]);

function isInternalFieldVisible(key) {
  return !HIDDEN_INTERNAL_FIELDS.has(key);
}

// Hidden fields are optional; visible fields stay required. Either way, a value
// that IS provided must still satisfy its format/length rules.
function validateInternalField(errors, key, value, rules = {}) {
  const v = String(value || "");
  if (!v) {
    if (isInternalFieldVisible(key)) errors[`internal.${key}`] = "Required";
    return;
  }
  if (rules.digitsOnly && !isDigits(v)) {
    errors[`internal.${key}`] = "Digits only";
    return;
  }
  if (rules.maxLength && v.length > rules.maxLength) {
    errors[`internal.${key}`] = rules.maxMessage;
  }
}

const WizardStepBasics = ({ campaignId, initialFormId = "", onExit, onSaved }) => {
  const toast = useToast();

  const [formId, setFormId] = useState(String(initialFormId || ""));
  const [loading, setLoading] = useState(Boolean(initialFormId));
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [internalCampaignId, setInternalCampaignId] = useState("");
  const [fundCause, setFundCause] = useState("");
  const [fundCode, setFundCode] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [collaborating, setCollaborating] = useState(false);
  const [collaborationOrganizationName, setCollaborationOrganizationName] = useState("");
  const [collaborationOrganizationImage, setCollaborationOrganizationImage] = useState("");
  const [collaborationImageFile, setCollaborationImageFile] = useState(null);
  const [collaborationImagePreview, setCollaborationImagePreview] = useState("");
  const [collaborationImageRemoved, setCollaborationImageRemoved] = useState(false);
  const [campaignType, setCampaignType] = useState("normal");
  const [specialOpen, setSpecialOpen] = useState(false);
  const isSpecialType = campaignType === "ramadan" || campaignType === "qurbani";
  const [categoryIds, setCategoryIds] = useState([]);
  const [featured, setFeatured] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  // Autosave only once the draft exists — creating it stays an explicit action.
  useStepAutosave({
    formId,
    deps: [
      internalCampaignId,
      fundCause,
      fundCode,
      beneficiaryId,
      locationId,
      shortDescription,
      displayName,
      description,
      collaborating,
      collaborationOrganizationName,
      campaignType,
      categoryIds,
      featured,
    ],
    ready: !loading,
    persist: () => save({ silent: true }),
  });

  /**
   * Duplicate-form hint while typing the public name.
   *
   * Deliberately isolated from autosave: `similarForms` is NOT in the autosave deps and this
   * never touches `loading`, so a read-only lookup can't move the baseline or trigger a save.
   * Every setState happens inside the timer callback (never synchronously in the effect).
   */
  const [similarForms, setSimilarForms] = useState([]);

  useEffect(() => {
    const term = String(displayName || "").trim();
    let alive = true;

    const timer = setTimeout(
      async () => {
        if (term.length < 4) {
          if (alive) setSimilarForms([]);
          return;
        }

        try {
          const res = await getAdminForms({ page: "1", limit: "5", q: term });
          if (!alive) return;

          const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
          const currentId = String(formId || "").trim();

          setSimilarForms(
            (Array.isArray(items) ? items : [])
              .filter((f) => String(f?.id || f?._id || "") !== currentId)
              .map((f) => ({
                id: String(f?.id || f?._id || ""),
                name: String(f?.basics?.public?.displayName || f?.name || "Untitled form"),
                campaignId: String(f?.campaignId || f?.campaign?.id || f?.campaign?._id || ""),
                status: String(f?.status || ""),
              }))
              .filter((f) => f.id)
          );
        } catch {
          if (alive) setSimilarForms([]);
        }
      },
      term.length < 4 ? 0 : 400
    );

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [displayName, formId]);

  useEffect(() => {
    if (formId) return;
    if (!campaignId) return;
    if (String(internalCampaignId || "").trim()) return;
    const key = `hc_admin_form_internal_campaign_id:${String(campaignId).trim()}`;
    try {
      const existing = String(sessionStorage.getItem(key) || "").trim();
      if (existing) {
        setInternalCampaignId(existing);
        return;
      }
      const next = buildGeneratedInternalCampaignId();
      sessionStorage.setItem(key, next);
      setInternalCampaignId(next);
    } catch {
      setInternalCampaignId(buildGeneratedInternalCampaignId());
    }
  }, [formId, campaignId, internalCampaignId]);

  const categoryOptions = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const filteredCategoryOptions = useMemo(() => {
    const q = String(categoryQuery || "").trim().toLowerCase();
    if (!q) return categoryOptions;
    return categoryOptions.filter((c) => {
      const name = String(c?.name || c?.title || c?.slug || "").toLowerCase();
      const id = String(c?.id || c?._id || "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [categoryOptions, categoryQuery]);
  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const c of categoryOptions) {
      const id = String(c?.id || c?._id || "").trim();
      if (!id) continue;
      map.set(id, String(c?.name || c?.title || c?.slug || "Category"));
    }
    return map;
  }, [categoryOptions]);

  useEffect(() => {
    let alive = true;
    setCategoriesLoading(true);
    setCategoriesError("");
    (async () => {
      try {
        const res = await getAdminCategories({ page: "1", limit: "200", order: "asc", status: "active" });
        if (!alive) return;
        const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
        const list = Array.isArray(items) ? items : [];
        setCategories(list.filter(isActiveCategory));
      } catch (e) {
        if (!alive) return;
        setCategories([]);
        setCategoriesError(e?.message || "Failed to load categories.");
      } finally {
        if (!alive) return;
        setCategoriesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (categoriesLoading) return;
    const idSet = new Set(
      categoryOptions
        .map((c) => String(c?.id || c?._id || "").trim())
        .filter(Boolean)
    );
    if (!idSet.size) return;
    setCategoryIds((prev) => (Array.isArray(prev) ? prev.filter((id) => idSet.has(String(id).trim())) : []));
  }, [categoriesLoading, categoryOptions]);

  useEffect(() => {
    if (!formId) return;
    let alive = true;
    setLoading(true);
    setTopError("");
    (async () => {
      try {
        const res = await getAdminFormBasics(formId);
        if (!alive) return;
        const d = normalizeBasicsResponse(res);
        const internal = d?.internal || {};
        const pub = d?.public || {};

        setInternalCampaignId(String(internal?.campaignId || ""));
        setFundCause(String(internal?.fundCause || ""));
        setFundCode(String(internal?.fundCode ?? ""));
        setBeneficiaryId(String(internal?.beneficiaryId ?? ""));
        setShortDescription(String(internal?.shortDescription || ""));
        setLocationId(String(internal?.locationId || ""));

        setDisplayName(String(pub?.displayName || ""));
        setDescription(String(pub?.description || ""));
        const orgName = String(pub?.collaborationOrganizationName || "").trim();
        const orgImageRaw = pub?.collaborationOrganizationImage;
        const orgImage =
          typeof orgImageRaw === "string"
            ? orgImageRaw.trim()
            : String(orgImageRaw?.path || orgImageRaw?.url || orgImageRaw?.location || "").trim();
        setCollaborationOrganizationName(orgName);
        setCollaborationOrganizationImage(orgImage);
        setCollaborationImageFile(null);
        setCollaborationImagePreview("");
        setCollaborationImageRemoved(false);
        setCollaborating(Boolean(orgName) || Boolean(orgImage));
        const storedType = String(pub?.campaignType || "normal");
        // Legacy durations are no longer a type — duration comes from the start/end dates.
        setCampaignType(storedType === "seasonal" || storedType === "ongoing" ? "normal" : storedType);
        setSpecialOpen(storedType === "ramadan" || storedType === "qurbani");
        setCategoryIds(
          Array.isArray(pub?.categoryIds)
            ? pub.categoryIds.map((x) => String(x).trim()).filter(Boolean)
            : []
        );
        setFeatured(Boolean(pub?.featured));
      } catch (e) {
        if (!alive) return;
        setTopError(e?.message || "Failed to load basics.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [formId]);

  function validate() {
    const errors = {};

    const internal = {
      campaignId: String(internalCampaignId || "").trim(),
      fundCause: String(fundCause || "").trim(),
      fundCode: String(fundCode || "").trim(),
      beneficiaryId: String(beneficiaryId || "").trim(),
      shortDescription: String(shortDescription || "").trim(),
      locationId: String(locationId || "").trim(),
    };

    const pub = {
      displayName: String(displayName || "").trim(),
      description: String(description || "").trim(),
      collaborationOrganizationName: String(collaborationOrganizationName || "").trim(),
      collaborationOrganizationImage: String(collaborationOrganizationImage || "").trim(),
      campaignType: String(campaignType || "").trim(),
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
      featured: Boolean(featured),
    };

    if (!internal.campaignId) errors["internal.campaignId"] = "Missing generated id";
    else if (internal.campaignId.length > 32) errors["internal.campaignId"] = "Max 32 characters";
    else if (!isInternalCampaignId(internal.campaignId)) errors["internal.campaignId"] = "Invalid format";

    // Hidden-from-UI fields: optional, but still validated when a value exists.
    validateInternalField(errors, "fundCause", internal.fundCause, { maxLength: 200, maxMessage: "Max 200 characters" });
    validateInternalField(errors, "fundCode", internal.fundCode, { digitsOnly: true, maxLength: 64, maxMessage: "Max 64 digits" });
    validateInternalField(errors, "beneficiaryId", internal.beneficiaryId, { digitsOnly: true, maxLength: 64, maxMessage: "Max 64 digits" });
    validateInternalField(errors, "locationId", internal.locationId, { maxLength: 100, maxMessage: "Max 100 characters" });

    if (!internal.shortDescription) errors["internal.shortDescription"] = "Required";
    else if (internal.shortDescription.length > 200) errors["internal.shortDescription"] = "Max 200 characters";

    if (!pub.displayName) errors["public.displayName"] = "Required";
    else if (pub.displayName.length < 3) errors["public.displayName"] = "Min 3 characters";
    else if (pub.displayName.length > 80) errors["public.displayName"] = "Max 80 characters";

    if (pub.description && pub.description.length > 500) errors["public.description"] = "Max 500 characters";

    if (!["normal", "ramadan", "qurbani"].includes(pub.campaignType)) errors["public.campaignType"] = "Choose a campaign type";

    const uniqueCats = Array.from(new Set(pub.categoryIds.map((x) => String(x).trim()).filter(Boolean)));
    if (uniqueCats.length < 1) errors["public.categoryIds"] = "Add at least 1 category";
    if (uniqueCats.length > 10) errors["public.categoryIds"] = "Max 10 categories";
    if (uniqueCats.some((id) => !isMongoId(id))) errors["public.categoryIds"] = "Each category must be a Mongo ObjectId (24 hex chars)";

    const payload = {
      internal: {
        campaignId: internal.campaignId,
        fundCause: internal.fundCause,
        fundCode: internal.fundCode,
        beneficiaryId: internal.beneficiaryId,
        shortDescription: internal.shortDescription,
        locationId: internal.locationId,
      },
      public: {
        displayName: pub.displayName,
        description: pub.description || undefined,
        ...(collaborating
          ? {
              collaborationOrganizationName: pub.collaborationOrganizationName || undefined,
              collaborationOrganizationImage: collaborationImageRemoved
                ? null
                : pub.collaborationOrganizationImage || undefined,
            }
          : {}),
        campaignType: pub.campaignType,
        categoryIds: uniqueCats,
        featured: pub.featured || undefined,
      },
    };

    return { errors, payload };
  }

  useEffect(() => {
    if (!collaborationImageFile) {
      setCollaborationImagePreview("");
      return;
    }
    const url = URL.createObjectURL(collaborationImageFile);
    setCollaborationImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [collaborationImageFile]);

  function buildBasicsFormData(payload) {
    const fd = new FormData();
    fd.append("internal", JSON.stringify(payload?.internal || {}));
    const pub = { ...(payload?.public || {}) };
    if (collaborationImageFile) {
      delete pub.collaborationOrganizationImage;
    }
    fd.append("public", JSON.stringify(pub));
    if (collaborationImageFile) fd.append("collaborationOrganizationImage", collaborationImageFile);
    return fd;
  }

  function toggleCategoryId(id) {
    const key = String(id || "").trim();
    if (!key) return;

    setCategoryIds((prev) => {
      const current = Array.isArray(prev) ? prev.map((x) => String(x).trim()).filter(Boolean) : [];
      if (current.includes(key)) return current.filter((x) => x !== key);
      if (current.length >= 10) {
        toast.error("Max 10 categories");
        return current;
      }
      return [...current, key];
    });
  }

  async function save({ silent = false } = {}) {
    if (!silent) {
      setTopError("");
      setFieldErrors({});
    }

    const { errors, payload } = validate();
    if (Object.keys(errors).length) {
      if (!silent) {
        setFieldErrors(errors);
        toast.error("Fix the highlighted fields");
      }
      return { ok: false, error: "Fix the highlighted fields" };
    }

    if (!campaignId) {
      if (!silent) toast.error("Missing campaignId");
      return { ok: false, error: "Missing campaignId" };
    }

    if (!silent) setSaving(true);
    try {
      const refreshBasics = async (id) => {
        try {
          const res = await getAdminFormBasics(id);
          const d = normalizeBasicsResponse(res);
          const internal = d?.internal || {};
          const pub = d?.public || {};
          const orgName = String(pub?.collaborationOrganizationName || "").trim();
          const orgImageRaw = pub?.collaborationOrganizationImage;
          const orgImage =
            typeof orgImageRaw === "string"
              ? orgImageRaw.trim()
              : String(orgImageRaw?.path || orgImageRaw?.url || orgImageRaw?.location || "").trim();
          setInternalCampaignId(String(internal?.campaignId || ""));
          setCollaborationOrganizationName(orgName);
          setCollaborationOrganizationImage(orgImage);
          setCollaborating(Boolean(orgName) || Boolean(orgImage));
          setCollaborationImageFile(null);
          setCollaborationImagePreview("");
          setCollaborationImageRemoved(false);
        } catch {}
      };

      if (!formId) {
        const res = await createAdminCampaignForm(campaignId, payload);
        const createdId =
          res?.data?.formId || res?.data?.id || res?.data?.data?.formId || res?.data?.data?.id || res?.formId || res?.id;
        if (createdId) setFormId(String(createdId));
        if (createdId && collaborating && collaborationImageFile) {
          const fd = buildBasicsFormData(payload);
          await updateAdminFormBasics(String(createdId), fd);
        }
        if (createdId) {
          await refreshBasics(String(createdId));
        }
        onSaved?.(createdId || null);
        if (!silent) toast.success("Basics saved");
        return { ok: true, formId: createdId || null };
      }

      if (collaborating && collaborationImageFile) {
        const fd = buildBasicsFormData(payload);
        await updateAdminFormBasics(formId, fd);
      } else {
        await updateAdminFormBasics(formId, payload);
      }
      await refreshBasics(formId);
      onSaved?.(formId);
      if (!silent) toast.success("Basics saved");
      return { ok: true, formId };
    } catch (e) {
      const msg = e?.message || "Failed to save basics.";
      if (!silent) {
        setTopError(msg);

        const nextErrors = {};
        if (String(msg).includes("FUND_CODE_IN_USE")) nextErrors["internal.fundCode"] = "Fund code already in use";
        if (String(msg).includes("BENEFICIARY_ID_IN_USE")) nextErrors["internal.beneficiaryId"] = "Beneficiary id already in use";
        if (String(msg).includes("FORM_NOT_EDITABLE")) setTopError("Form can’t be edited (not draft).");
        if (Object.keys(nextErrors).length) setFieldErrors(nextErrors);

        toast.error(msg);
      }
      return { ok: false, error: msg };
    } finally {
      if (!silent) setSaving(false);
    }
  }

  async function handleNext() {
    const res = await save();
    if (!res.ok) return;
    const nextFormId = String(res.formId || formId || "").trim();
    toast.success("Basics complete");
    onExit?.({ nextStep: "goals-dates", formId: nextFormId || undefined });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
          <div className="h-6 w-1/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
          <div className="h-6 w-1/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
            <div className="h-28 animate-pulse rounded-xl bg-[#F3F4F6]" />
            <div className="h-28 animate-pulse rounded-xl bg-[#F3F4F6]" />
          </div>
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

      <section className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Internal Basics</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">Internal configuration used by the admin system.</p>
          </div>
          {formId ? <div className="text-[12px] text-[#6B7280]">Form ID: {formId}</div> : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Form ID</div>
            <input
              value={internalCampaignId}
              placeholder="Generating..."
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-[13px] text-[#6B7280] outline-none"
              readOnly
              disabled={saving}
            />
            <FieldError message={fieldErrors["internal.campaignId"]} />
          </div>

          {isInternalFieldVisible("fundCause") ? (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">
                Fund Cause <span className="text-red-600">*</span>
              </div>
              <input
                value={fundCause}
                onChange={(e) => setFundCause(e.target.value)}
                placeholder="e.g. Child Sponsorship Program"
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <FieldError message={fieldErrors["internal.fundCause"]} />
            </div>
          ) : null}

          {isInternalFieldVisible("fundCode") ? (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">
                Fund Code <span className="text-red-600">*</span>
              </div>
              <input
                value={fundCode}
                onChange={(e) => setFundCode(e.target.value)}
                placeholder="digits only"
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <FieldError message={fieldErrors["internal.fundCode"]} />
            </div>
          ) : null}

          {isInternalFieldVisible("beneficiaryId") ? (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">
                Beneficiary ID <span className="text-red-600">*</span>
              </div>
              <input
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
                placeholder="digits only"
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <FieldError message={fieldErrors["internal.beneficiaryId"]} />
            </div>
          ) : null}

          {isInternalFieldVisible("locationId") ? (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">
                Location/Form Used <span className="text-red-600">*</span>
              </div>
              <input
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="Location ID"
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <FieldError message={fieldErrors["internal.locationId"]} />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Short Description <span className="text-red-600">*</span>
            </div>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Short description"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <div className="mt-1 text-[12px] text-[#6B7280]">{Math.min(200, String(shortDescription || "").length)}/200 characters</div>
            <FieldError message={fieldErrors["internal.shortDescription"]} />
          </div>
        </div>
      </section>

      <section className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold text-[#111827]">Public Basics</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Public facing information for this form.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Display Name (Public) <span className="text-red-600">*</span>
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Form display name"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors["public.displayName"]} />

            {similarForms.length > 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                <div className="text-[13px] font-semibold text-[#92400E]">
                  A similar form already exists: {similarForms[0].name}
                </div>
                <p className="mt-1 text-[12px] text-[#92400E]">
                  Review it before you continue, so you don&apos;t create a duplicate. This is only a
                  suggestion — you can still save this form.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {similarForms.map((f) => {
                    const href = f.campaignId
                      ? `/admin/forms/new?step=basics&campaignId=${encodeURIComponent(f.campaignId)}&formId=${encodeURIComponent(f.id)}`
                      : "/admin/forms";
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-semibold text-[#92400E] transition hover:bg-[#FEF3C7]"
                      >
                        {f.name}
                        {f.status ? <span className="text-[11px] font-medium text-[#B45309]">({f.status})</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description (max 500)"
                className="min-h-30 w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <div className="mt-1 text-[12px] text-[#6B7280]">{Math.min(500, description.length)}/500 characters</div>
              <FieldError message={fieldErrors["public.description"]} />
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13px] font-semibold text-[#111827]">Collaborating with</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">Optionally show a partner organization on the donation form.</div>
                </div>
                <Toggle
                  enabled={collaborating}
                  onChange={(next) => {
                    setCollaborating(Boolean(next));
                    if (!next) {
                      setCollaborationOrganizationName("");
                      setCollaborationOrganizationImage("");
                      setCollaborationImageFile(null);
                      setCollaborationImagePreview("");
                      setCollaborationImageRemoved(false);
                    }
                  }}
                />
              </div>

              {collaborating ? (
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <div className="mb-2 text-[13px] font-semibold text-[#111827]">Collaboration Organization Name</div>
                    <input
                      value={collaborationOrganizationName}
                      onChange={(e) => setCollaborationOrganizationName(e.target.value)}
                      placeholder="e.g. Human Concern International"
                      className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <div className="mb-2 text-[13px] font-semibold text-[#111827]">Collaboration Organization Image</div>
                    <div className="flex flex-col gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCollaborationImageFile(file);
                          setCollaborationImageRemoved(false);
                        }}
                        disabled={saving}
                        className="block w-full text-[13px] text-[#111827] file:mr-4 file:rounded-xl file:border-0 file:bg-[#111827]/5 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#111827] hover:file:bg-[#111827]/10"
                      />

                      {collaborationImagePreview || collaborationOrganizationImage ? (
                        <div className="overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-2">
                          <img
                            src={collaborationImagePreview || resolveAssetUrl(collaborationOrganizationImage)}
                            alt=""
                            className="h-28 w-full rounded-xl bg-[#F9FAFB] object-contain"
                          />
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[12px] text-[#6B7280]">Optional. Upload a PNG/JPG image.</div>
                        <button
                          type="button"
                          onClick={() => {
                            setCollaborationImageFile(null);
                            setCollaborationImagePreview("");
                            setCollaborationOrganizationImage("");
                            setCollaborationImageRemoved(true);
                          }}
                          disabled={saving || (!collaborationImagePreview && !collaborationOrganizationImage)}
                          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
              <div className="mb-3 text-[13px] font-semibold text-[#111827]">
                Campaign Type <span className="text-red-600">*</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setCampaignType("normal");
                    setSpecialOpen(false);
                  }}
                  disabled={saving}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                    !isSpecialType ? "border-red-600/30 bg-red-600/10" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="text-[13px] font-semibold text-[#111827]">Normal Campaign</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">A standard campaign — with or without an end date</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecialOpen(true);
                    if (!isSpecialType) setCampaignType("normal");
                  }}
                  disabled={saving}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                    isSpecialType ? "border-red-600/30 bg-red-600/10" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="text-[13px] font-semibold text-[#111827]">Special Campaign</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">Ramadan, Qurbani and other special campaigns</div>
                </button>
              </div>

              {specialOpen ? (
                <div className="mt-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FCFCFC] p-3">
                  <div className="mb-2 text-[12px] font-semibold text-[#6B7280]">Choose a special campaign type</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {SPECIAL_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          if (type.disabled) return;
                          setCampaignType(type.value);
                        }}
                        disabled={saving || type.disabled}
                        title={type.disabled ? "Not available yet" : undefined}
                        className={`rounded-xl border px-3 py-2 text-left transition ${
                          type.disabled
                            ? "cursor-not-allowed border-[#F1F1F1] bg-[#FAFAFA] opacity-60"
                            : campaignType === type.value
                              ? "cursor-pointer border-red-600/30 bg-red-600/10"
                              : "cursor-pointer border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                        }`}
                      >
                        <div className="text-[12px] font-semibold text-[#111827]">{type.label}</div>
                        <div className="mt-0.5 text-[11px] text-[#6B7280]">{type.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <FieldError message={fieldErrors["public.campaignType"]} />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">
                Categories <span className="text-red-600">*</span>
              </div>
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 focus-within:border-red-500/40">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9CA3AF]" fill="none">
                    <path
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                    disabled={saving || categoriesLoading}
                  />
                </div>

                <div className="mt-3 max-h-55 overflow-auto rounded-xl border border-[#E5E7EB] bg-white">
                  {categoriesLoading ? (
                    <div className="px-3 py-3 text-[13px] text-[#6B7280]">Loading categories...</div>
                  ) : filteredCategoryOptions.length === 0 ? (
                    <div className="px-3 py-3 text-[13px] text-[#6B7280]">No categories found</div>
                  ) : (
                    <div className="divide-y divide-[#F3F4F6]">
                      {filteredCategoryOptions.map((c) => {
                        const id = String(c?.id || c?._id || "").trim();
                        if (!id) return null;
                        const label = String(c?.name || c?.title || c?.slug || "Category");
                        const checked = Array.isArray(categoryIds) && categoryIds.map(String).includes(id);

                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleCategoryId(id)}
                            disabled={saving}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                                  checked ? "border-red-500/40 bg-[#111827] text-white" : "border-[#E5E7EB] bg-white"
                                }`}
                                aria-hidden="true"
                              >
                                {checked ? (
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                  </svg>
                                ) : null}
                              </span>
                              <span className="truncate">{label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {categoriesError ? <div className="mt-1 text-[12px] text-red-600">{categoriesError}</div> : null}
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Select 1–10 categories{categoriesLoading ? " (loading...)" : ""}.
              </div>
              {Array.isArray(categoryIds) && categoryIds.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {categoryIds.map((id) => (
                    <span
                      key={id}
                      className="hc-admin-accent-soft hc-admin-accent-text inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
                    >
                      {categoryNameById.get(String(id)) || String(id)}
                    </span>
                  ))}
                </div>
              ) : null}
              <FieldError message={fieldErrors["public.categoryIds"]} />
            </div>

            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13px] font-semibold text-[#111827]">Featured</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">Mark this form as featured (optional).</div>
                </div>
                <Toggle enabled={featured} onChange={setFeatured} />
              </div>
            </div>

          </div>
        </div>
      </section>

      <WizardFooterNav
        backDisabled
        saving={saving}
        onBack={() => onExit?.()}
        onSave={save}
        onNext={handleNext}
        previewHref={formId ? `/admin/forms/preview/1?formId=${encodeURIComponent(formId)}` : ""}
        nextLabel="Next"
      />
    </div>
  );
}
export default WizardStepBasics;

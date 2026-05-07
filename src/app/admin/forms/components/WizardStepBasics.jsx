"use client";

import { useEffect, useMemo, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { createAdminCampaignForm, getAdminCategories, getAdminFormBasics, updateAdminFormBasics } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import FieldError from "./FieldError";
import WizardFooterNav from "./WizardFooterNav";

function isMongoId(value) {
  return /^[a-fA-F0-9]{24}$/.test(String(value || "").trim());
}

function isSlugLike(value) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(value || "").trim());
}

function isDigits(value) {
  return /^[0-9]+$/.test(String(value || "").trim());
}

function isInternalCampaignId(value) {
  return /^[0-9]+(-[0-9]+)*$/.test(String(value || "").trim());
}

function normalizeBasicsResponse(res) {
  return res?.data?.data || res?.data?.item || res?.data?.basics || res?.data || {};
}

export default function WizardStepBasics({ campaignId, initialFormId = "", onExit }) {
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
  const [designation, setDesignation] = useState("");
  const [locationId, setLocationId] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("seasonal");
  const [categoryIds, setCategoryIds] = useState([]);
  const [featured, setFeatured] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

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
        const res = await getAdminCategories({ page: "1", limit: "200", order: "asc" });
        if (!alive) return;
        const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
        setCategories(Array.isArray(items) ? items : []);
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
        setDesignation(String(internal?.designation || ""));
        setShortDescription(String(internal?.shortDescription || ""));
        setLocationId(String(internal?.locationId || ""));

        setDisplayName(String(pub?.displayName || ""));
        setDescription(String(pub?.description || ""));
        setCampaignType(String(pub?.campaignType || "seasonal"));
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
      designation: String(designation || "").trim(),
      shortDescription: String(shortDescription || "").trim(),
      locationId: String(locationId || "").trim(),
    };

    const pub = {
      displayName: String(displayName || "").trim(),
      description: String(description || "").trim(),
      campaignType: String(campaignType || "").trim(),
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
      featured: Boolean(featured),
    };

    if (!internal.campaignId) errors["internal.campaignId"] = "Required";
    else if (internal.campaignId.length > 32) errors["internal.campaignId"] = "Max 32 characters";
    else if (!isInternalCampaignId(internal.campaignId)) errors["internal.campaignId"] = "Use digits and hyphens only (example: 1-435)";

    if (!internal.fundCause) errors["internal.fundCause"] = "Required";
    else if (internal.fundCause.length > 200) errors["internal.fundCause"] = "Max 200 characters";

    if (!internal.fundCode) errors["internal.fundCode"] = "Required";
    else if (!isDigits(internal.fundCode)) errors["internal.fundCode"] = "Digits only";
    else if (internal.fundCode.length > 64) errors["internal.fundCode"] = "Max 64 digits";

    if (!internal.beneficiaryId) errors["internal.beneficiaryId"] = "Required";
    else if (!isDigits(internal.beneficiaryId)) errors["internal.beneficiaryId"] = "Digits only";
    else if (internal.beneficiaryId.length > 64) errors["internal.beneficiaryId"] = "Max 64 digits";

    if (!internal.designation) errors["internal.designation"] = "Required";
    else if (internal.designation.length > 64) errors["internal.designation"] = "Max 64 characters";

    if (!internal.shortDescription) errors["internal.shortDescription"] = "Required";
    else if (internal.shortDescription.length > 64) errors["internal.shortDescription"] = "Max 64 characters";
    else if (!isSlugLike(internal.shortDescription)) errors["internal.shortDescription"] = "Use lowercase letters, digits, and hyphens only";

    if (!internal.locationId) errors["internal.locationId"] = "Required";
    else if (internal.locationId.length > 100) errors["internal.locationId"] = "Max 100 characters";

    if (!pub.displayName) errors["public.displayName"] = "Required";
    else if (pub.displayName.length < 3) errors["public.displayName"] = "Min 3 characters";
    else if (pub.displayName.length > 80) errors["public.displayName"] = "Max 80 characters";

    if (pub.description && pub.description.length > 500) errors["public.description"] = "Max 500 characters";

    if (pub.campaignType !== "seasonal" && pub.campaignType !== "ongoing") errors["public.campaignType"] = "Choose seasonal or ongoing";

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
        designation: internal.designation,
        shortDescription: internal.shortDescription,
        locationId: internal.locationId,
      },
      public: {
        displayName: pub.displayName,
        description: pub.description || undefined,
        campaignType: pub.campaignType,
        categoryIds: uniqueCats,
        featured: pub.featured || undefined,
      },
    };

    return { errors, payload };
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

  async function save() {
    setTopError("");
    setFieldErrors({});

    const { errors, payload } = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Fix the highlighted fields");
      return { ok: false };
    }

    if (!campaignId) {
      toast.error("Missing campaignId");
      return { ok: false };
    }

    setSaving(true);
    try {
      if (!formId) {
        const res = await createAdminCampaignForm(campaignId, payload);
        const createdId =
          res?.data?.formId || res?.data?.id || res?.data?.data?.formId || res?.data?.data?.id || res?.formId || res?.id;
        if (createdId) setFormId(String(createdId));
        toast.success("Basics saved");
        return { ok: true, formId: createdId || null };
      }

      await updateAdminFormBasics(formId, payload);
      toast.success("Basics saved");
      return { ok: true, formId };
    } catch (e) {
      const msg = e?.message || "Failed to save basics.";
      setTopError(msg);

      const nextErrors = {};
      if (String(msg).includes("FUND_CODE_IN_USE")) nextErrors["internal.fundCode"] = "Fund code already in use";
      if (String(msg).includes("BENEFICIARY_ID_IN_USE")) nextErrors["internal.beneficiaryId"] = "Beneficiary id already in use";
      if (String(msg).includes("FORM_NOT_EDITABLE")) setTopError("Form can’t be edited (not draft).");
      if (Object.keys(nextErrors).length) setFieldErrors(nextErrors);

      toast.error(msg);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    const res = await save();
    if (!res.ok) return;
    toast.success("Basics complete. Next step will be added next.");
    onExit?.();
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
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Campaign ID - Form ID <span className="text-red-600">*</span>
            </div>
            <input
              value={internalCampaignId}
              onChange={(e) => setInternalCampaignId(e.target.value)}
              placeholder="e.g. 1-435"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors["internal.campaignId"]} />
          </div>

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

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Designation <span className="text-red-600">*</span>
            </div>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. XX - General"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors["internal.designation"]} />
          </div>

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

          <div className="md:col-span-2">
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Short Description <span className="text-red-600">*</span>
            </div>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. child-sponsorship"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <div className="mt-1 text-[12px] text-[#6B7280]">Lowercase letters, digits, and hyphens only.</div>
            <FieldError message={fieldErrors["internal.shortDescription"]} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="text-[11px] font-semibold tracking-wide text-[#6B7280]">PREVIEW</div>
          <div className="mt-2 text-[13px] text-[#111827]">
            {displayName ? (
              <span className="font-semibold">{displayName}</span>
            ) : (
              <span className="text-[#6B7280]">Complete all fields to see preview</span>
            )}
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

            <div className="mt-4">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description (max 500)"
                className="min-h-[120px] w-full resize-none rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
                disabled={saving}
              />
              <div className="mt-1 text-[12px] text-[#6B7280]">{Math.min(500, description.length)}/500 characters</div>
              <FieldError message={fieldErrors["public.description"]} />
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
                  onClick={() => setCampaignType("seasonal")}
                  disabled={saving}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                    campaignType === "seasonal" ? "border-red-600/30 bg-red-600/10" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="text-[13px] font-semibold text-[#111827]">Seasonal</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">Time-bound campaign with start/end date</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignType("ongoing")}
                  disabled={saving}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                    campaignType === "ongoing" ? "border-red-600/30 bg-red-600/10" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="text-[13px] font-semibold text-[#111827]">Ongoing</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">Continuous campaign with no fixed end date</div>
                </button>
              </div>
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

                <div className="mt-3 max-h-[220px] overflow-auto rounded-xl border border-[#E5E7EB] bg-white">
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
                                  checked ? "border-red-500/40 bg-red-600 text-white" : "border-[#E5E7EB] bg-white"
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
                      className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-700"
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
        nextLabel="Next"
      />
    </div>
  );
}

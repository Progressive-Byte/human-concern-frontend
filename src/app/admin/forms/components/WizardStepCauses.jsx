"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminCauses, getAdminDesignations, getAdminFormCauses, updateAdminFormCauses } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import WizardFooterNav from "./WizardFooterNav";
import useStepAutosave from "../hooks/useStepAutosave";

function normalizeItemsResponse(res) {
  const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
  return Array.isArray(items) ? items : [];
}

function normalizeSelectedCauseIds(res) {
  const raw =
    res?.data?.causeIds ||
    res?.data?.data?.causeIds ||
    res?.causeIds ||
    res?.data?.items ||
    res?.data?.data?.items ||
    res?.items ||
    [];

  const list = Array.isArray(raw) ? raw : [];
  const ids = list
    .map((x) => (typeof x === "string" ? x : x?._id || x?.id))
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  return Array.from(new Set(ids));
}

function isSelectableCause(cause) {  if (!cause) return false;
  if (cause.enabled === false) return false;
  const status = String(cause.status || "").trim().toLowerCase();
  if (status && status !== "active") return false;
  return true;
}

// The form's per-cause designations come back as [{ causeId, designationId }]; the wizard
// edits them as a simple causeId -> designationId map.
function normalizeCauseDesignations(res) {
  const raw =
    res?.data?.causeDesignations ||
    res?.data?.data?.causeDesignations ||
    res?.causeDesignations ||
    [];
  const list = Array.isArray(raw) ? raw : [];
  const map = {};
  for (const link of list) {
    const causeId = String(link?.causeId || "").trim();
    const designationId = String(link?.designationId || "").trim();
    if (causeId && designationId) map[causeId] = designationId;
  }
  return map;
}

function SkeletonGrid() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl border border-[#E5E7EB] bg-white" />
            <div className="h-5 w-5 rounded-full border border-[#E5E7EB] bg-white" />
          </div>
          <div className="mt-3 h-4 w-2/3 rounded bg-[#E5E7EB]" />
          <div className="mt-2 h-3 w-full rounded bg-[#E5E7EB]" />
          <div className="mt-1 h-3 w-5/6 rounded bg-[#E5E7EB]" />
          <div className="mt-3 h-5 w-28 rounded-full border border-[#E5E7EB] bg-white" />
        </div>
      ))}
    </div>
  );
}

const WizardStepCauses = ({ campaignId, formId, onExit, onSaved }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");

  const [allCauses, setAllCauses] = useState([]);
  const [selectedCauseIds, setSelectedCauseIds] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [designationByCause, setDesignationByCause] = useState({});

  const causes = useMemo(() => (Array.isArray(allCauses) ? allCauses : []), [allCauses]);
  const designations = useMemo(() => (Array.isArray(allDesignations) ? allDesignations : []), [allDesignations]);
  const selectedCauseIdSet = useMemo(
    () => new Set(selectedCauseIds.map((id) => String(id).trim()).filter(Boolean)),
    [selectedCauseIds]
  );
  const selectedCount = selectedCauseIds.length;

  // Autosave once the step has loaded (the draft must already exist).
  useStepAutosave({
    formId,
    deps: [selectedCauseIds, designationByCause],
    ready: !loading,
    persist: () => save({ silent: true }),
  });

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
        const [causesRes, selectedRes, designationsRes] = await Promise.all([
          getAdminCauses({ page: "1", limit: "200", order: "asc", status: "active", enabled: "true" }),
          getAdminFormCauses(formId),
          getAdminDesignations({ page: "1", limit: "200", order: "asc", status: "active" }),
        ]);
        if (!alive) return;

        const nextAll = normalizeItemsResponse(causesRes).filter(isSelectableCause);
        const nextSelected = normalizeSelectedCauseIds(selectedRes);
        const enabledIdSet = new Set(
          nextAll
            .map((c) => String(c?._id || c?.id || "").trim())
            .filter(Boolean)
        );

        setAllCauses(nextAll);
        setSelectedCauseIds(nextSelected.filter((id) => enabledIdSet.has(id)));
        setAllDesignations(normalizeItemsResponse(designationsRes));
        setDesignationByCause(normalizeCauseDesignations(selectedRes));
      } catch (e) {
        if (!alive) return;
        setAllCauses([]);
        setSelectedCauseIds([]);
        setAllDesignations([]);
        setDesignationByCause({});
        setTopError(e?.message || "Failed to load causes.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  function toggleCauseId(cause) {
    const id = String(cause?._id || cause?.id || "").trim();
    if (!id) return;
    if (!isSelectableCause(cause)) return;

    setSelectedCauseIds((prev) => {
      const current = Array.isArray(prev) ? prev.map((x) => String(x).trim()).filter(Boolean) : [];
      const has = current.includes(id);
      if (has) return current.filter((x) => x !== id);
      return Array.from(new Set([...current, id]));
    });
  }

  async function save({ goNext, silent = false } = { goNext: false }) {
    if (!silent) setTopError("");

    if (!campaignId) {
      if (!silent) toast.error("Missing campaignId");
      return { ok: false, error: "Missing campaignId" };
    }
    if (!formId) {
      if (!silent) toast.error("Complete Basics first");
      return { ok: false, error: "Complete Basics first" };
    }

    const enabledIdSet = new Set(
      causes
        .map((c) => String(c?._id || c?.id || "").trim())
        .filter(Boolean)
    );
    const selectedIds = Array.from(new Set(selectedCauseIds.map((x) => String(x).trim()).filter(Boolean))).filter((id) =>
      enabledIdSet.has(id)
    );
    const payload = {
      causeIds: selectedIds,
      // Optional — a cause with no designation simply reports as "Unassigned".
      causeDesignations: selectedIds
        .map((causeId) => ({ causeId, designationId: designationByCause[causeId] }))
        .filter((link) => Boolean(link.designationId)),
    };

    if (!silent) setSaving(true);
    try {
      await updateAdminFormCauses(formId, payload);
      if (!silent) toast.success("Causes saved");
      onSaved?.();

      if (goNext) {
        onExit?.({ nextStep: "objectives" });
      }
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save causes.";
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

  return (
    <div className="space-y-6">
      {topError ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {topError}
        </div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Allowed Donation Causes</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">Select which donation causes apply to this form</p>
          </div>

          <div className="text-[13px] text-[#6B7280] sm:text-right">
            <span className="text-[#111827] font-semibold">{selectedCount} Selected</span> Out of {causes.length}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : causes.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#6B7280]">No causes available.</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {causes.map((cause) => {
              const id = String(cause?._id || cause?.id || "").trim();
              const selected = id ? selectedCauseIds.includes(id) : false;
              const selectable = isSelectableCause(cause);
              const emoji = String(cause?.iconEmoji || "").trim();
              const name = String(cause?.name || "").trim();
              const desc = String(cause?.description || "").trim();
              const zakatEligible = Boolean(cause?.zakatEligible);

              return (
                <button
                  key={id || name || desc}
                  type="button"
                  onClick={() => toggleCauseId(cause)}
                  disabled={!selectable || saving}
                  className={`hc-hover-lift relative w-full text-left rounded-2xl border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 focus-visible:ring-offset-2 ${
                    selected ? "border-red-600/40 bg-red-600/5" : "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white"
                  } ${!selectable || saving ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-[#E5E7EB]">
                      <span className="text-[18px] leading-none">{emoji}</span>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected ? "border-[#111827] bg-[#111827]" : "border-[#D1D5DB] bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 3.25L4.75 8.5L2 5.75"
                            stroke="white"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#111827]">{name || "Cause"}</span>
                    {cause?.fundCode ? (
                      <span className="inline-flex items-center rounded-full bg-[#111827] px-2 py-1 text-[10px] font-semibold text-white">
                        {cause.fundCode}
                      </span>
                    ) : null}
                  </div>
                  {desc ? <div className="mt-1 text-[12px] leading-snug text-[#6B7280]">{desc}</div> : null}

                  <div className="mt-3 inline-flex items-center rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#111827] border border-[#E5E7EB]">
                    {zakatEligible ? "Zakat Eligible" : "Not Zakat Eligible"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedCount > 0 ? (
          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="text-[13px] font-semibold text-[#111827]">Designation per selected cause</div>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              Optional — a cause with no designation reports as “Unassigned”.
            </p>

            <div className="mt-3 space-y-2">
              {causes
                .filter((cause) => selectedCauseIdSet.has(String(cause?._id || cause?.id || "").trim()))
                .map((cause) => {
                  const causeId = String(cause?._id || cause?.id || "").trim();
                  return (
                    <div key={causeId} className="flex flex-wrap items-center gap-3">
                      <div className="min-w-[200px] flex-1 text-[13px] text-[#111827]">
                        {String(cause?.name || "Cause")}
                        {cause?.fundCode ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-semibold text-white">
                            {cause.fundCode}
                          </span>
                        ) : null}
                      </div>

                      <select
                        value={designationByCause[causeId] || ""}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setDesignationByCause((prev) => {
                            const next = { ...(prev || {}) };
                            if (nextValue) next[causeId] = nextValue;
                            else delete next[causeId];
                            return next;
                          });
                        }}
                        className="w-full max-w-[300px] cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#383838] outline-none focus:border-[#171717]/30"
                      >
                        <option value="">— None —</option>
                        {designations.map((designation) => {
                          const id = String(designation?._id || designation?.id || "").trim();
                          if (!id) return null;
                          return (
                            <option key={id} value={id}>
                              {designation?.code ? `${designation.code} — ` : ""}
                              {String(designation?.name || "")}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "goals-dates" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        previewHref={formId ? `/admin/forms/preview/1?formId=${encodeURIComponent(formId)}` : ""}
        nextLabel="Next"
      />
    </div>
  );
}
export default WizardStepCauses;

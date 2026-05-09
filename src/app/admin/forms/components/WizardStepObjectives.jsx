"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminFormObjectives, getAdminObjectives, updateAdminFormObjectives } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import WizardFooterNav from "./WizardFooterNav";

function normalizeItemsResponse(res) {
  const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
  return Array.isArray(items) ? items : [];
}

function normalizeSelectedObjectiveIds(res) {
  const raw =
    res?.data?.objectiveIds ||
    res?.data?.data?.objectiveIds ||
    res?.objectiveIds ||
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

function isSelectableObjective(obj) {
  if (!obj) return false;
  if (obj.enabled === false) return false;
  const status = String(obj.status || "").trim().toLowerCase();
  if (status && status !== "active") return false;
  return true;
}

function SkeletonGrid() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
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

export default function WizardStepObjectives({ campaignId, formId, onExit, onSaved }) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");

  const [allObjectives, setAllObjectives] = useState([]);
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState([]);

  const objectives = useMemo(() => (Array.isArray(allObjectives) ? allObjectives : []), [allObjectives]);
  const selectedCount = selectedObjectiveIds.length;

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
        const [objectivesRes, selectedRes] = await Promise.all([
          getAdminObjectives({ page: "1", limit: "200", order: "asc" }),
          getAdminFormObjectives(formId),
        ]);
        if (!alive) return;

        const nextAll = normalizeItemsResponse(objectivesRes).filter((o) => o?.enabled !== false);
        const nextSelected = normalizeSelectedObjectiveIds(selectedRes);
        const enabledIdSet = new Set(
          nextAll
            .map((o) => String(o?._id || o?.id || "").trim())
            .filter(Boolean)
        );

        setAllObjectives(nextAll);
        setSelectedObjectiveIds(nextSelected.filter((id) => enabledIdSet.has(id)));
      } catch (e) {
        if (!alive) return;
        setAllObjectives([]);
        setSelectedObjectiveIds([]);
        setTopError(e?.message || "Failed to load objectives.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  function toggleObjective(obj) {
    const id = String(obj?._id || obj?.id || "").trim();
    if (!id) return;
    if (!isSelectableObjective(obj)) return;

    setSelectedObjectiveIds((prev) => {
      const current = Array.isArray(prev) ? prev.map((x) => String(x).trim()).filter(Boolean) : [];
      const has = current.includes(id);
      if (has) return current.filter((x) => x !== id);
      return Array.from(new Set([...current, id]));
    });
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

    const enabledIdSet = new Set(
      objectives
        .map((o) => String(o?._id || o?.id || "").trim())
        .filter(Boolean)
    );
    const payload = {
      objectiveIds: Array.from(new Set(selectedObjectiveIds.map((x) => String(x).trim()).filter(Boolean))).filter((id) =>
        enabledIdSet.has(id)
      ),
    };

    setSaving(true);
    try {
      await updateAdminFormObjectives(formId, payload);
      toast.success("Objectives saved");
      onSaved?.();

      if (goNext) {
        onExit?.({ nextStep: "addons" });
      }
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save objectives.";
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Campaign Objectives</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">Select which objectives appear for donors in this form</p>
          </div>

          <div className="text-[13px] text-[#6B7280] sm:text-right">
            <span className="text-[#111827] font-semibold">{selectedCount} Selected</span> Out of {objectives.length}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : objectives.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#6B7280]">No objectives available.</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((obj) => {
              const id = String(obj?._id || obj?.id || "").trim();
              const selected = id ? selectedObjectiveIds.includes(id) : false;
              const selectable = isSelectableObjective(obj);
              const emoji = String(obj?.iconEmoji || "").trim();
              const name = String(obj?.name || "").trim();
              const desc = String(obj?.description || "").trim();
              const ramadanOnly = Boolean(obj?.ramadanOnly);

              return (
                <button
                  key={id || name || desc}
                  type="button"
                  onClick={() => toggleObjective(obj)}
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
                        selected ? "border-red-600 bg-red-600" : "border-[#D1D5DB] bg-white"
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

                  <div className="mt-3 text-[14px] font-semibold text-[#111827]">{name || "Objective"}</div>
                  {desc ? <div className="mt-1 text-[12px] leading-snug text-[#6B7280]">{desc}</div> : null}

                  {ramadanOnly ? (
                    <div className="mt-3 inline-flex items-center rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#111827] border border-[#E5E7EB]">
                      Ramadan Only
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "causes" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        nextLabel="Next"
      />
    </div>
  );
}

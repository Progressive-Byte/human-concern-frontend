"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminCauses, getAdminFormCauses, updateAdminFormCauses } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import WizardFooterNav from "./WizardFooterNav";

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

function isSelectableCause(cause) {
  if (!cause) return false;
  if (cause.enabled === false) return false;
  const status = String(cause.status || "").trim().toLowerCase();
  if (status && status !== "active") return false;
  return true;
}

function SkeletonGrid() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

export default function WizardStepCauses({ campaignId, formId, onExit }) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");

  const [allCauses, setAllCauses] = useState([]);
  const [selectedCauseIds, setSelectedCauseIds] = useState([]);

  const causes = useMemo(() => (Array.isArray(allCauses) ? allCauses : []), [allCauses]);
  const selectedCount = selectedCauseIds.length;

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
        const [causesRes, selectedRes] = await Promise.all([
          getAdminCauses({ page: "1", limit: "200", order: "asc" }),
          getAdminFormCauses(formId),
        ]);
        if (!alive) return;

        const nextAll = normalizeItemsResponse(causesRes);
        const nextSelected = normalizeSelectedCauseIds(selectedRes);

        setAllCauses(nextAll);
        setSelectedCauseIds(nextSelected);
      } catch (e) {
        if (!alive) return;
        setAllCauses([]);
        setSelectedCauseIds([]);
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

    const payload = { causeIds: Array.from(new Set(selectedCauseIds.map((x) => String(x).trim()).filter(Boolean))) };

    setSaving(true);
    try {
      await updateAdminFormCauses(formId, payload);
      toast.success("Causes saved");

      if (goNext) {
        onExit?.({ nextStep: "objectives" });
      }
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save causes.";
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
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                  <div className="mt-3 text-[14px] font-semibold text-[#111827]">{name || "Cause"}</div>
                  {desc ? <div className="mt-1 text-[12px] leading-snug text-[#6B7280]">{desc}</div> : null}

                  <div className="mt-3 inline-flex items-center rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#111827] border border-[#E5E7EB]">
                    {zakatEligible ? "Zakat Eligible" : "Not Zakat Eligible"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "goals-dates" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        nextLabel="Next"
      />
    </div>
  );
}


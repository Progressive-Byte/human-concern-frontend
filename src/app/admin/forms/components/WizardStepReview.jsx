"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminFormReview, publishAdminForm, unpublishAdminForm } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

function normalizeReviewResponse(res) {
  return res?.data?.data || res?.data || {};
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

function formatISODate(dateStr) {
  const s = String(dateStr || "").trim();
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "";
  const c = String(currency || "").trim() || "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n);
  } catch {
    return `${c} ${n}`;
  }
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 text-[11px] font-semibold text-[#111827]">
      {children}
    </span>
  );
}

function SummaryCard({ label, onEdit, children, errors }) {
  const errorList = toArray(errors);
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] tracking-wide text-[#6B7280] uppercase">{label}</div>
        {onEdit ? (
          <button type="button" onClick={onEdit} className="text-[12px] font-semibold text-[#111827] hover:underline">
            Edit
          </button>
        ) : (
          <div />
        )}
      </div>

      {errorList.length ? (
        <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-700">
          {errorList.map((e, idx) => (
            <div key={`${idx}-${String(e)}`}>{String(e)}</div>
          ))}
        </div>
      ) : null}

      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function WizardStepReview({ campaignId, formId, isRamadanForm, onExit, onSaved }) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [topError, setTopError] = useState("");

  const [review, setReview] = useState(null);

  const data = useMemo(() => (review && typeof review === "object" ? review : null), [review]);
  const sectionsCompleted = data?.sectionsCompleted || {};
  const errorsBySection = data?.errorsBySection || {};
  const canPublish = Boolean(data?.canPublish);

  const form = data?.form || {};
  const basics = form?.basics || {};

  const goalsDates = form?.goalsDates || {};
  const causes = Array.isArray(form?.causes) ? form.causes : [];
  const objectives = Array.isArray(form?.objectives) ? form.objectives : [];
  const addOns = Array.isArray(form?.addOns) ? form.addOns : [];

  const showObjectivesSection = isRamadanForm !== false && objectives.length > 0;

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
        const res = await getAdminFormReview(formId);
        if (!alive) return;
        setReview(normalizeReviewResponse(res));
      } catch (e) {
        if (!alive) return;
        setReview(null);
        setTopError(e?.message || "Failed to load review.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  async function publish() {
    setTopError("");

    if (!campaignId) {
      toast.error("Missing campaignId");
      return;
    }
    if (!formId) {
      toast.error("Missing formId");
      return;
    }
    if (!canPublish) {
      toast.error("Complete required sections to publish");
      return;
    }

    setPublishing(true);
    try {
      await publishAdminForm(formId);
      toast.success("Form published");
      onSaved?.();
      onExit?.({ nextStep: "finish" });
    } catch (e) {
      const msg = e?.message || "Failed to publish.";
      setTopError(msg);
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  }

  async function createOrMoveToDraft() {
    setTopError("");

    if (!formId) {
      toast.error("Missing formId");
      return;
    }

    const currentStatus = String(form?.status || "").trim().toLowerCase();
    if (currentStatus !== "published") {
      toast.success("Draft saved");
      onSaved?.();
      onExit?.({ nextStep: "finish" });
      return;
    }

    setDrafting(true);
    try {
      await unpublishAdminForm(formId);
      toast.success("Moved to draft");
      onSaved?.();
      onExit?.({ nextStep: "finish" });
    } catch (e) {
      const msg = e?.message || "Failed to move to draft.";
      setTopError(msg);
      toast.error(msg);
    } finally {
      setDrafting(false);
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
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Review Campaign</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Review all details before publishing your form</p>
        </div>

        {loading ? (
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="h-3 w-32 rounded bg-[#E5E7EB]" />
                <div className="mt-3 h-4 w-2/3 rounded bg-[#E5E7EB]" />
                <div className="mt-2 h-3 w-full rounded bg-[#E5E7EB]" />
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="mt-5 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            Unable to load review. Please try again.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <SummaryCard
              label="Basics"
              onEdit={() => onExit?.({ nextStep: "basics" })}
              errors={errorsBySection?.basics}
            >
              <div className="text-[14px] font-semibold text-[#111827]">{basics?.displayName || "—"}</div>
              {basics?.description ? (
                <div className="mt-1 text-[12px] text-[#6B7280] leading-snug">{basics.description}</div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {basics?.campaignType ? <Chip>{String(basics.campaignType)}</Chip> : null}
                {isRamadanForm === true ? <Chip>Ramadan</Chip> : null}
              </div>
            </SummaryCard>

            <SummaryCard label="Goals & Timeline" onEdit={() => onExit?.({ nextStep: "goals-dates" })} errors={errorsBySection?.goalsDates}>
              <div className="space-y-2">
                {goalsDates?.goalAmount ? (
                  <div className="text-[14px] font-semibold text-[#111827]">
                    {formatMoney(goalsDates.goalAmount, goalsDates.currency)} goal
                  </div>
                ) : null}
                <div className="text-[12px] text-[#6B7280]">
                  {formatISODate(goalsDates?.startAt) || "—"}
                  {goalsDates?.endAt ? ` — ${formatISODate(goalsDates.endAt) || "—"}` : ""}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Boolean(goalsDates?.allowRecurringDonations) ? <Chip>Recurring Enabled</Chip> : null}
                  {Boolean(goalsDates?.enableTipping) ? <Chip>Tipping Enabled</Chip> : null}
                  {Boolean(goalsDates?.allowAnonymousDonations) ? <Chip>Anonymous Allowed</Chip> : null}
                </div>
              </div>
            </SummaryCard>

            <SummaryCard label="Causes" onEdit={() => onExit?.({ nextStep: "causes" })} errors={errorsBySection?.causes}>
              <div className="flex flex-wrap gap-2">
                {causes.length ? (
                  causes.map((c) => {
                    const id = String(c?.id || c?._id || c?.slug || c?.name || "").trim();
                    const emoji = String(c?.iconEmoji || "").trim();
                    const name = String(c?.name || "").trim();
                    return (
                      <Chip key={id}>
                        {emoji ? <span className="mr-1">{emoji}</span> : null}
                        <span>{name || "—"}</span>
                      </Chip>
                    );
                  })
                ) : (
                  <div className="text-[12px] text-[#6B7280]">No causes selected.</div>
                )}
              </div>
            </SummaryCard>

            {showObjectivesSection ? (
              <SummaryCard
                label="Objectives"
                onEdit={isRamadanForm === false ? null : () => onExit?.({ nextStep: "objectives" })}
                errors={errorsBySection?.objectives}
              >
                <div className="flex flex-wrap gap-2">
                  {objectives.map((o) => {
                    const id = String(o?.id || o?._id || o?.name || "").trim();
                    const name = String(o?.name || "").trim();
                    return <Chip key={id}>{name || "—"}</Chip>;
                  })}
                </div>
              </SummaryCard>
            ) : null}

            <SummaryCard label="Add-ons" onEdit={() => onExit?.({ nextStep: "addons" })} errors={errorsBySection?.addons}>
              {addOns.length ? (
                <div className="space-y-2">
                  {addOns.map((a) => {
                    const id = String(a?.id || a?._id || a?.addonName || "").trim();
                    const emoji = String(a?.iconEmoji || "").trim();
                    const name = String(a?.addonName || "").trim();
                    const amount = a?.amount;
                    const amountLabel = String(a?.amountFieldLabel || "Amount").trim();
                    return (
                      <div key={id} className="text-[12px] text-[#111827]">
                        <span className="mr-1">{emoji}</span>
                        <span className="font-semibold">{name}</span>
                        {amount !== undefined && amount !== null ? (
                          <span className="text-[#6B7280]"> — {amountLabel}: {formatMoney(amount, goalsDates?.currency || "USD")}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[12px] text-[#6B7280]">No add-ons selected.</div>
              )}
            </SummaryCard>
          </div>
        )}
      </section>

      {data && !canPublish ? (
        <div className="rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          Complete required sections to publish.
        </div>
      ) : null}

      <div className="sticky bottom-0">
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onExit?.({ nextStep: "media" })}
              disabled={publishing || drafting}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={createOrMoveToDraft}
                disabled={publishing || drafting}
                className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {drafting
                  ? "Saving..."
                  : String(form?.status || "").trim().toLowerCase() === "published"
                    ? "Move to Draft"
                    : "Create as Draft"}
              </button>
              <button
                type="button"
                onClick={publish}
                disabled={publishing || drafting || !canPublish}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

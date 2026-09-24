"use client";

import { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { getAdminFormGoalsDates, updateAdminFormGoalsDates } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import useStepAutosave from "../hooks/useStepAutosave";
import WizardFooterNav from "./WizardFooterNav";

const WizardStepPublicDisplay = ({ campaignId, formId, onExit, onSaved }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Public campaign page display switches — all default ON (the admin opts out).
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showStartEndDates, setShowStartEndDates] = useState(true);
  const [showAmountRaised, setShowAmountRaised] = useState(true);
  const [showTargetAmount, setShowTargetAmount] = useState(true);

  function applyServerValue(gd) {
    // Same rule as before this step existed: never set means ON.
    setShowProgressBar(gd?.showProgressBar !== false);
    setShowStartEndDates(gd?.showStartEndDates !== false);
    setShowAmountRaised(gd?.showAmountRaised !== false);
    setShowTargetAmount(gd?.showTargetAmount !== false);
  }

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await getAdminFormGoalsDates(formId);
        if (!alive) return;
        applyServerValue(res?.data?.data?.goalsDates);
      } catch (e) {
        if (!alive) return;
        toast.error(e?.message || "Failed to load public display settings.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  // Same autosave contract as every other step.
  useStepAutosave({
    formId,
    deps: [showProgressBar, showStartEndDates, showAmountRaised, showTargetAmount],
    ready: !loading,
    persist: () => save({ silent: true }),
  });

  async function save({ goNext = false, silent = false } = {}) {
    if (!campaignId) {
      if (!silent) toast.error("Missing campaignId");
      return { ok: false, error: "Missing campaignId" };
    }
    if (!formId) {
      if (!silent) toast.error("Complete Basics first");
      return { ok: false, error: "Complete Basics first" };
    }

    if (!silent) setSaving(true);
    try {
      // Only the four display keys: the API merges into goalsDates, so every other field
      // (goal, currency, dates, payment methods, presets) is left untouched.
      const res = await updateAdminFormGoalsDates(formId, {
        showProgressBar: Boolean(showProgressBar),
        showStartEndDates: Boolean(showStartEndDates),
        showAmountRaised: Boolean(showAmountRaised),
        showTargetAmount: Boolean(showTargetAmount),
      });
      // Reflect exactly what the server stored, so autosave and Save Draft agree.
      applyServerValue(res?.data?.data?.goalsDates || res?.data?.goalsDates);
      if (!silent) toast.success("Public display saved");
      onSaved?.();
      if (goNext) onExit?.({ nextStep: "review" });
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save public display settings.";
      if (!silent) {
        toast.error(String(msg).includes("FORM_NOT_EDITABLE") ? "Form can’t be edited (not draft)." : msg);
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
      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Public Display</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Choose what this campaign&apos;s public page shows. These are display settings only — they never
            change donation data or reporting.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Progress Bar</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Render the fundraising progress bar</div>
              </div>
              <Toggle enabled={showProgressBar} onChange={saving ? () => {} : setShowProgressBar} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Start/End Dates</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display the campaign&apos;s start and end dates</div>
              </div>
              <Toggle enabled={showStartEndDates} onChange={saving ? () => {} : setShowStartEndDates} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Amount Raised</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display the raised total as a number</div>
              </div>
              <Toggle enabled={showAmountRaised} onChange={saving ? () => {} : setShowAmountRaised} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Target Amount</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display the fundraising goal as a number</div>
              </div>
              <Toggle enabled={showTargetAmount} onChange={saving ? () => {} : setShowTargetAmount} />
            </div>
          </div>

          {!showAmountRaised ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
              The progress bar is hidden on the public page while <strong>Show Amount Raised</strong> is off — a
              percentage bar would still reveal roughly how much has been raised.
            </div>
          ) : null}

          <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-[12px] text-[#6B7280]">
            Leave the goal empty for an open-ended campaign — then no progress bar, target or remaining amount is
            shown anywhere.
          </div>
        </div>
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "unavailable-page" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        previewHref={formId ? `/admin/forms/preview/1?formId=${encodeURIComponent(formId)}` : ""}
        nextLabel="Next"
      />
    </div>
  );
};

export default WizardStepPublicDisplay;

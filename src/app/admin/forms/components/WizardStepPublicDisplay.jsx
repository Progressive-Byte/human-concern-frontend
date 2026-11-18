"use client";

import { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { getAdminFormPublicDisplay, updateAdminFormPublicDisplay } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import useStepAutosave from "../hooks/useStepAutosave";
import { getFormErrorMessage } from "@/utils/formValidationMessages";
import StepErrorSummary from "./StepErrorSummary";
import WizardFooterNav from "./WizardFooterNav";

const DEFAULT_DONATE_BUTTON_LABEL = "Support";
const MAX_LABEL_LENGTH = 40;

/**
 * The API wraps every payload as `{ data: { publicDisplay, sectionsCompleted } }` and the client
 * returns that body as-is. Read it without relying on the exact nesting, so a missing shape can
 * never be mistaken for "everything defaulted to ON".
 */
function readPublicDisplay(res) {
  const d = res?.data?.data || res?.data || {};
  const pd = d?.publicDisplay || d;
  return pd && typeof pd === "object" ? pd : {};
}

const WizardStepPublicDisplay = ({ campaignId, formId, onExit, onSaved }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");

  // Public campaign page display switches — all default ON (the admin opts out).
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showStartEndDates, setShowStartEndDates] = useState(true);
  const [showAmountRaised, setShowAmountRaised] = useState(true);
  const [showTargetAmount, setShowTargetAmount] = useState(true);
  const [showDonorCount, setShowDonorCount] = useState(true);
  // Blank means "use the default label" (Support) on the public Donate buttons.
  const [donateButtonLabel, setDonateButtonLabel] = useState("");
  // How the marketing opt-in checkbox starts on the donation form.
  const [marketingConsentMode, setMarketingConsentMode] = useState("checked");

  function applyServerValue(pd) {
    // Same rule as before this step existed: never set means ON.
    setShowProgressBar(pd?.showProgressBar !== false);
    setShowStartEndDates(pd?.showStartEndDates !== false);
    setShowAmountRaised(pd?.showAmountRaised !== false);
    setShowTargetAmount(pd?.showTargetAmount !== false);
    setShowDonorCount(pd?.showDonorCount !== false);
    // The API resolves the label, so strip the default back out to keep the field honest about
    // what is actually stored (empty = default).
    const label = String(pd?.donateButtonLabel || "").trim();
    setDonateButtonLabel(label === DEFAULT_DONATE_BUTTON_LABEL ? "" : label);
    const mode = String(pd?.marketingConsentMode || "").trim().toLowerCase();
    setMarketingConsentMode(["checked", "unchecked", "hidden"].includes(mode) ? mode : "checked");
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
        const res = await getAdminFormPublicDisplay(formId);
        if (!alive) return;
        applyServerValue(readPublicDisplay(res));
      } catch (e) {
        if (!alive) return;
        const msg = getFormErrorMessage(e, "We couldn’t load the public display settings. Please try again.");
        setTopError(msg);
        toast.error(msg);
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
    deps: [showProgressBar, showStartEndDates, showAmountRaised, showTargetAmount, showDonorCount, donateButtonLabel, marketingConsentMode],
    ready: !loading,
    persist: () => save({ silent: true }),
  });

  async function save({ goNext = false, silent = false } = {}) {
    if (!campaignId) {
      if (!silent) toast.error("This form is not linked to a campaign. Go back and choose a campaign.");
      return { ok: false, error: "This form is not linked to a campaign." };
    }
    if (!formId) {
      if (!silent) toast.error("Finish Basics first.");
      return { ok: false, error: "Finish Basics first." };
    }

    if (!silent) {
      setSaving(true);
      setTopError("");
    }
    try {
      // Its own endpoint and its own block, so this can never touch the goals/dates config.
      const res = await updateAdminFormPublicDisplay(formId, {
        showProgressBar: Boolean(showProgressBar),
        showStartEndDates: Boolean(showStartEndDates),
        showAmountRaised: Boolean(showAmountRaised),
        showTargetAmount: Boolean(showTargetAmount),
        showDonorCount: Boolean(showDonorCount),
        donateButtonLabel: String(donateButtonLabel || "").trim(),
        marketingConsentMode,
      });
      // Autosave already has the exact values it sent. Re-applying the response on a silent
      // save can overwrite a newer toggle that was changed while the request was running.
      if (!silent) applyServerValue(readPublicDisplay(res));
      setTopError("");
      if (!silent) toast.success("Public display saved");
      onSaved?.();
      if (goNext) onExit?.({ nextStep: "review" });
      return { ok: true };
    } catch (e) {
      const msg = getFormErrorMessage(e, "We couldn’t save the public display settings. Please try again.");
      setTopError(msg);
      if (!silent) {
        toast.error(msg);
      }
      return { ok: false, error: msg };
    } finally {
      if (!silent) setSaving(false);
    }
  }

  if (!formId) {
    return (
      <div className="hc-animate-fade-up rounded-2xl border border-solid border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600">
        Finish Basics first to create the form.
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onExit?.({ nextStep: "basics" })}
            className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Back to Basics
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60";

  return (
    <div className="space-y-4 md:space-y-6">
      <StepErrorSummary topError={topError} />

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Public Display</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Choose what this form&apos;s public page shows. These are display settings only — they never
            change donation data or reporting.
          </p>
        </div>

        <div className="mt-4 divide-y divide-[#F3F4F6] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Progress Bar</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Render the fundraising progress bar</div>
              </div>
              <Toggle enabled={showProgressBar} onChange={loading || saving ? () => {} : setShowProgressBar} />
            </div>
          </div>

          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Days Left</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display how many days are left until the end date</div>
              </div>
              <Toggle enabled={showStartEndDates} onChange={loading || saving ? () => {} : setShowStartEndDates} />
            </div>
          </div>

          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Amount Raised</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display the raised total as a number</div>
              </div>
              <Toggle enabled={showAmountRaised} onChange={loading || saving ? () => {} : setShowAmountRaised} />
            </div>
          </div>

          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Target Amount</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Display the fundraising goal as a number</div>
              </div>
              <Toggle enabled={showTargetAmount} onChange={loading || saving ? () => {} : setShowTargetAmount} />
            </div>
          </div>

          <div className="px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Show Donor Count</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">
                  Display the number of donors on the public page and in listings
                </div>
              </div>
              <Toggle enabled={showDonorCount} onChange={loading || saving ? () => {} : setShowDonorCount} />
            </div>
          </div>

          {!showAmountRaised ? (
            <div className="bg-amber-50 px-3.5 py-3 text-[12px] text-amber-800">
              The progress bar is hidden on the public page while <strong>Show Amount Raised</strong> is off — a
              percentage bar would still reveal roughly how much has been raised.
            </div>
          ) : null}

          <div className="bg-[#FAFAFA] px-3.5 py-3 text-[12px] text-[#6B7280]">
            Leave the goal empty for an open-ended form — then no progress bar, target or remaining amount is
            shown anywhere.
          </div>
        </div>
      </section>

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Donate Button</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            The label used on the Donate button, on this form&apos;s public page and in listings.
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Button text</div>
          <input
            value={donateButtonLabel}
            onChange={(e) => setDonateButtonLabel(e.target.value)}
            placeholder={DEFAULT_DONATE_BUTTON_LABEL}
            maxLength={MAX_LABEL_LENGTH}
            disabled={saving}
            className={inputClass}
          />
          <div className="mt-2 text-[12px] text-[#6B7280]">
            Leave empty to use <span className="font-semibold">{DEFAULT_DONATE_BUTTON_LABEL}</span>. Maximum{" "}
            {MAX_LABEL_LENGTH} characters.
          </div>
        </div>
      </section>

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Marketing Opt-in</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            The “email updates” checkbox on this form&apos;s donation form.
          </p>
        </div>

        <div className="mt-4 max-w-md">
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Default state</div>
          <select
            value={marketingConsentMode}
            onChange={(e) => setMarketingConsentMode(e.target.value)}
            disabled={saving}
            className={inputClass}
          >
            <option value="checked">Checked by default (donor can uncheck)</option>
            <option value="unchecked">Unchecked by default (donor can check)</option>
            <option value="hidden">Hidden (collect no consent)</option>
          </select>
          <div className="mt-2 text-[12px] text-[#6B7280]">
            Forms that never set this stay on “Checked by default”. The donor&apos;s final choice is
            stored with every donation.
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

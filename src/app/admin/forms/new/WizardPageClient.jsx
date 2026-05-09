"use client";

import { useRouter, useSearchParams } from "next/navigation";
import FormWizardShell from "../components/FormWizardShell";
import WizardStepBasics from "../components/WizardStepBasics";
import WizardStepGoalsDates from "../components/WizardStepGoalsDates";
import WizardStepCauses from "../components/WizardStepCauses";
import WizardStepPlaceholder from "../components/WizardStepPlaceholder";

export default function WizardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const step = searchParams.get("step") || "basics";
  const campaignId = searchParams.get("campaignId") || "";
  const initialFormId = searchParams.get("formId") || "";

  function navigateToStep(nextStep, nextFormId = initialFormId) {
    const s = String(nextStep || "").trim();
    if (!s) return;
    const params = new URLSearchParams();
    params.set("step", s);
    params.set("campaignId", campaignId);
    const fid = String(nextFormId || "").trim();
    if (fid) params.set("formId", fid);
    router.push(`/admin/forms/new?${params.toString()}`);
  }

  if (!campaignId) {
    return (
      <div className="min-w-0 p-4 md:p-6">
        <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600">
          Missing campaignId. Go back and select a campaign first.
          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/forms")}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Back to Forms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormWizardShell step={step} title="Create Form">
      {step === "basics" ? (
        <WizardStepBasics
          campaignId={campaignId}
          initialFormId={initialFormId}
          onExit={({ nextStep, formId } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, formId || initialFormId);
              return;
            }
            router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`);
          }}
        />
      ) : step === "goals-dates" ? (
        <WizardStepGoalsDates
          campaignId={campaignId}
          formId={initialFormId}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, initialFormId);
              return;
            }
            router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`);
          }}
        />
      ) : step === "causes" ? (
        <WizardStepCauses
          campaignId={campaignId}
          formId={initialFormId}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, initialFormId);
              return;
            }
            router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`);
          }}
        />
      ) : step === "objectives" ? (
        <WizardStepPlaceholder
          title="Objectives"
          description="Pick objectives to show on the public campaign page."
          onBack={() => navigateToStep("causes", initialFormId)}
          onNext={() => navigateToStep("addons", initialFormId)}
        />
      ) : step === "addons" ? (
        <WizardStepPlaceholder
          title="Add-ons"
          description="Attach add-ons that donors can optionally include."
          onBack={() => navigateToStep("objectives", initialFormId)}
          onNext={() => navigateToStep("media", initialFormId)}
        />
      ) : step === "media" ? (
        <WizardStepPlaceholder
          title="Media"
          description="Upload thumbnail and slider images for this form."
          onBack={() => navigateToStep("addons", initialFormId)}
          onNext={() => navigateToStep("review", initialFormId)}
        />
      ) : (
        <WizardStepPlaceholder
          title="Review"
          description="Review readiness to publish."
          onBack={() => navigateToStep("media", initialFormId)}
          onNext={() => router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`)}
          nextLabel="Finish"
        />
      )}
    </FormWizardShell>
  );
}

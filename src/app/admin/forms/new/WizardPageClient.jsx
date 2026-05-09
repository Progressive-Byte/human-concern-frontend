"use client";

import { useRouter, useSearchParams } from "next/navigation";
import FormWizardShell from "../components/FormWizardShell";
import WizardStepBasics from "../components/WizardStepBasics";
import WizardStepGoalsDates from "../components/WizardStepGoalsDates";

export default function WizardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const step = searchParams.get("step") || "basics";
  const campaignId = searchParams.get("campaignId") || "";
  const initialFormId = searchParams.get("formId") || "";

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
      {step === "goals-dates" ? (
        <WizardStepGoalsDates
          campaignId={campaignId}
          formId={initialFormId}
          onExit={({ nextStep } = {}) => {
            const next = String(nextStep || "").trim();
            if (next) {
              const params = new URLSearchParams();
              params.set("step", next);
              params.set("campaignId", campaignId);
              if (initialFormId) params.set("formId", initialFormId);
              router.push(`/admin/forms/new?${params.toString()}`);
              return;
            }
            router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`);
          }}
        />
      ) : (
        <WizardStepBasics
          campaignId={campaignId}
          initialFormId={initialFormId}
          onExit={() => router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`)}
        />
      )}
    </FormWizardShell>
  );
}

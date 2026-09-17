"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormWizardShell from "../components/FormWizardShell";
import FormEditorGuardProvider, { useFormEditorGuard } from "../components/FormEditorGuardProvider";
import WizardStepBasics from "../components/WizardStepBasics";
import WizardStepGoalsDates from "../components/WizardStepGoalsDates";
import WizardStepCauses from "../components/WizardStepCauses";
import WizardStepObjectives from "../components/WizardStepObjectives";
import WizardStepAddons from "../components/WizardStepAddons";
import WizardStepMedia from "../components/WizardStepMedia";
import WizardStepUnavailable from "../components/WizardStepUnavailable";
import WizardStepReview from "../components/WizardStepReview";
import WizardStepPlaceholder from "../components/WizardStepPlaceholder";
import { getAdminCategories, getAdminFormBasics, getAdminFormById } from "@/services/admin";

function isActiveCategory(cat) {
  const status = String(cat?.status || "").trim().toLowerCase();
  if (!status) return true;
  return status === "active";
}

const WizardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guard = useFormEditorGuard();

  const step = searchParams.get("step") || "basics";
  const campaignId = searchParams.get("campaignId") || "";
  const initialFormId = searchParams.get("formId") || "";

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [basicsCategoryIds, setBasicsCategoryIds] = useState([]);
  const [sectionsCompleted, setSectionsCompleted] = useState({});

  function goToStep(nextStep, nextFormId = initialFormId) {
    const s = String(nextStep || "").trim();
    if (!s) return;
    const params = new URLSearchParams();
    params.set("step", s);
    params.set("campaignId", campaignId);
    const fid = String(nextFormId || "").trim();
    if (fid) params.set("formId", fid);
    router.push(`/admin/forms/new?${params.toString()}`);
  }

  // Editor navigation always respects the unsaved-changes guard; `goToStep` stays raw for the
  // internal step-normalisation redirect below.
  function navigateToStep(nextStep, nextFormId = initialFormId) {
    guard?.confirmNavigation(() => goToStep(nextStep, nextFormId));
  }

  function exitToForms() {
    guard?.confirmNavigation(() => router.push(`/admin/forms?campaignId=${encodeURIComponent(campaignId)}`));
  }

  async function refreshFormMeta(nextFormId = initialFormId) {
    const fid = String(nextFormId || "").trim();
    if (!fid) return;

    try {
      const [formRes, basicsRes] = await Promise.all([getAdminFormById(fid), getAdminFormBasics(fid)]);
      const form = formRes?.data?.item || formRes?.data?.data || formRes?.data || {};
      const basics = basicsRes?.data?.data || basicsRes?.data?.item || basicsRes?.data?.basics || basicsRes?.data || {};
      const pub = basics?.public || {};

      setSectionsCompleted(form?.sectionsCompleted || form?.data?.sectionsCompleted || {});
      setBasicsCategoryIds(
        Array.isArray(pub?.categoryIds) ? pub.categoryIds.map((x) => String(x).trim()).filter(Boolean) : []
      );
      // Must be refreshed on every save too: the step list (Objectives shown/required) depends
      // on the campaign type, which the admin can change from the Basics step.
      setBasicsCampaignType(String(pub?.campaignType || "").trim());
    } catch {
      return;
    }
  }

  useEffect(() => {
    let alive = true;
    setCategoriesLoading(true);
    (async () => {
      try {
        const res = await getAdminCategories({ page: "1", limit: "200", order: "asc", status: "active" });
        if (!alive) return;
        const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
        const list = Array.isArray(items) ? items : [];
        setCategories(list.filter(isActiveCategory));
      } catch {
        if (!alive) return;
        setCategories([]);
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
    if (!initialFormId) {
      setBasicsCategoryIds([]);
      return;
    }

    let alive = true;
    (async () => {
      try {
        const res = await getAdminFormBasics(initialFormId);
        if (!alive) return;
        const d = res?.data?.data || res?.data?.item || res?.data?.basics || res?.data || {};
        const pub = d?.public || {};
        const ids = Array.isArray(pub?.categoryIds) ? pub.categoryIds : [];
        setBasicsCategoryIds(ids.map((x) => String(x).trim()).filter(Boolean));
        setBasicsCampaignType(String(pub?.campaignType || "").trim());
      } catch {
        if (!alive) return;
        setBasicsCategoryIds([]);
        setBasicsCampaignType("");
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialFormId]);

  useEffect(() => {
    if (!initialFormId) {
      setSectionsCompleted({});
      return;
    }

    let alive = true;
    (async () => {
      try {
        const res = await getAdminFormById(initialFormId);
        if (!alive) return;
        const d = res?.data?.item || res?.data?.data || res?.data || {};
        setSectionsCompleted(d?.sectionsCompleted || d?.data?.sectionsCompleted || {});
      } catch {
        if (!alive) return;
        setSectionsCompleted({});
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialFormId]);

  // null = the form's basics haven't loaded yet, which preserves the tri-state so the step
  // list doesn't shift once the form loads.
  const [basicsCampaignType, setBasicsCampaignType] = useState(null);

  // Ramadan is driven by the campaign type now, not by the Ramadan Category.
  const isRamadanForm = useMemo(() => {
    if (!initialFormId) return null;
    if (basicsCampaignType === null) return null;

    return String(basicsCampaignType).trim().toLowerCase() === "ramadan";
  }, [initialFormId, basicsCampaignType]);

  useEffect(() => {
    // A step-normalisation redirect, not a user action — never raise the guard for it.
    if (step === "objectives" && isRamadanForm === false) {
      goToStep("addons", initialFormId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isRamadanForm, initialFormId]);

  const steps = useMemo(() => {
    const base = [
      { key: "basics", label: "Basics" },
      { key: "goals-dates", label: "Goals & Dates" },
      { key: "causes", label: "Causes & Designation" },
      { key: "objectives", label: "Objectives" },
      { key: "addons", label: "Add-ons" },
      { key: "media", label: "Media" },
      { key: "unavailable-page", label: "Unavailable page" },
      { key: "review", label: "Review" },
    ];
    if (isRamadanForm === false) return base.filter((s) => s.key !== "objectives");
    return base;
  }, [isRamadanForm]);

  const completedKeys = useMemo(() => {
    const s = sectionsCompleted || {};
    const done = new Set();

    if (Boolean(s?.basics)) done.add("basics");
    if (Boolean(s?.goalsDates)) done.add("goals-dates");
    if (Boolean(s?.causes)) done.add("causes");
    if (Boolean(s?.addons)) done.add("addons");
    if (Boolean(s?.media)) done.add("media");
    if (Boolean(s?.unavailablePage)) done.add("unavailable-page");
    if (isRamadanForm !== false && Boolean(s?.objectives)) done.add("objectives");

    // "Unavailable page" is optional, so it must never gate the Review step.
    const required = steps
      .map((x) => x.key)
      .filter((k) => k !== "review" && k !== "unavailable-page");
    const reviewReady = required.length > 0 && required.every((k) => done.has(k));
    if (reviewReady) done.add("review");

    return done;
  }, [sectionsCompleted, steps, isRamadanForm]);

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
    <FormWizardShell
      step={step}
      title="Create Form"
      steps={steps}
      completedKeys={completedKeys}
      onStepClick={(nextStep) => navigateToStep(nextStep, initialFormId)}
    >
      {step === "basics" ? (
        <WizardStepBasics
          campaignId={campaignId}
          initialFormId={initialFormId}
          onSaved={(newFormId) => refreshFormMeta(newFormId || initialFormId)}
          onExit={({ nextStep, formId } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, formId || initialFormId);
              return;
            }
            exitToForms();
          }}
        />
      ) : step === "goals-dates" ? (
        <WizardStepGoalsDates
          campaignId={campaignId}
          formId={initialFormId}
          onSaved={() => refreshFormMeta(initialFormId)}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, initialFormId);
              return;
            }
            exitToForms();
          }}
        />
      ) : step === "causes" ? (
        <WizardStepCauses
          campaignId={campaignId}
          formId={initialFormId}
          onSaved={() => refreshFormMeta(initialFormId)}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              if (nextStep === "objectives" && isRamadanForm === false) {
                navigateToStep("addons", initialFormId);
              } else {
                navigateToStep(nextStep, initialFormId);
              }
              return;
            }
            exitToForms();
          }}
        />
      ) : step === "objectives" ? (
        isRamadanForm === false ? (
          <WizardStepPlaceholder
            title="Add-ons"
            description="Attach add-ons that donors can optionally include."
            onBack={() => navigateToStep("causes", initialFormId)}
            onNext={() => navigateToStep("media", initialFormId)}
          />
        ) : (
          <WizardStepObjectives
            campaignId={campaignId}
            formId={initialFormId}
            onSaved={() => refreshFormMeta(initialFormId)}
            onExit={({ nextStep } = {}) => {
              if (nextStep) {
                navigateToStep(nextStep, initialFormId);
                return;
              }
              exitToForms();
            }}
          />
        )
      ) : step === "addons" ? (
        <WizardStepAddons
          campaignId={campaignId}
          formId={initialFormId}
          backStep={isRamadanForm === false ? "causes" : "objectives"}
          onSaved={() => refreshFormMeta(initialFormId)}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, initialFormId);
              return;
            }
            exitToForms();
          }}
        />
      ) : step === "media" ? (
        <WizardStepMedia
          campaignId={campaignId}
          formId={initialFormId}
          onSaved={() => refreshFormMeta(initialFormId)}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, initialFormId);
              return;
            }
            exitToForms();
          }}
        />
      ) : step === "unavailable-page" ? (
        <WizardStepUnavailable
          campaignId={campaignId}
          formId={initialFormId}
          onSaved={() => refreshFormMeta(initialFormId)}
          onExit={({ nextStep } = {}) => {
            if (nextStep) {
              navigateToStep(nextStep, initialFormId);
              return;
            }
            exitToForms();
          }}
        />
      ) : step === "review" ? (
        <WizardStepReview
          campaignId={campaignId}
          formId={initialFormId}
          isRamadanForm={isRamadanForm}
          onSaved={() => refreshFormMeta(initialFormId)}
          onExit={({ nextStep } = {}) => {
            if (nextStep === "finish") {
              exitToForms();
              return;
            }
            if (nextStep) {
              if (nextStep === "objectives" && isRamadanForm === false) {
                navigateToStep("addons", initialFormId);
              } else {
                navigateToStep(nextStep, initialFormId);
              }
              return;
            }
            exitToForms();
          }}
        />
      ) : (
        <WizardStepPlaceholder
          title="Review"
          description="Review readiness to publish."
          onBack={() => navigateToStep("media", initialFormId)}
          onNext={() => exitToForms()}
          nextLabel="Finish"
        />
      )}
    </FormWizardShell>
  );
};

const WizardPageClient = () => (
  <FormEditorGuardProvider>
    <WizardContent />
  </FormEditorGuardProvider>
);

export default WizardPageClient;

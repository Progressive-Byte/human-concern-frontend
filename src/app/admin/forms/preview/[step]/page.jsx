"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { getAdminFormReview } from "@/services/admin";
import Step1Info from "@/app/donate/steps/Step1Info";
import Step2Payment from "@/app/donate/steps/Step2Payment";
import Step3Addons from "@/app/donate/steps/Step3Addons";
import Step4Confirmation from "@/app/donate/steps/Step4Confirmation";

function normalizeReviewResponse(res) {
  return res?.data?.data || res?.data || {};
}

function buildCampaignDataFromAdminReview(review, formId) {
  const form = review?.form && typeof review.form === "object" ? review.form : {};
  const basics = form?.basics && typeof form.basics === "object" ? form.basics : {};
  const goalsDates = form?.goalsDates && typeof form.goalsDates === "object" ? form.goalsDates : {};

  const suggestedRaw = goalsDates?.suggestedAmounts ?? form?.suggestedAmounts ?? [];
  const suggestedAmounts = (Array.isArray(suggestedRaw) ? suggestedRaw : [])
    .map((x) => (typeof x === "number" ? x : Number(x?.value ?? x)))
    .filter((n) => Number.isFinite(n));

  const causesRaw = Array.isArray(form?.causes) ? form.causes : [];
  const causes = causesRaw.map((c) => {
    const name = String(c?.name || "").trim();
    const id = String(c?.id || c?._id || c?.slug || "").trim() || name;
    return {
      id,
      name,
      description: String(c?.description || "").trim(),
      iconEmoji: String(c?.iconEmoji || "").trim(),
      zakatEligible: Boolean(c?.zakatEligible),
    };
  });

  const addOnsRaw = Array.isArray(form?.addOns) ? form.addOns : [];
  const addOns = addOnsRaw.map((a) => {
    const name = String(a?.name || a?.addonName || "").trim();
    const id = String(a?.id || a?._id || "").trim() || name;
    return {
      id,
      name,
      iconEmoji: String(a?.iconEmoji || "").trim(),
      shortDescription: String(a?.shortDescription || "").trim(),
      labelUnderAmount: String(a?.labelUnderAmount || "").trim(),
      amountFieldLabel: String(a?.amountFieldLabel || "").trim(),
      amount: a?.amount,
      pricing: a?.pricing && typeof a.pricing === "object" ? a.pricing : undefined,
    };
  });

  const zakatEligible = causes.some((c) => Boolean(c.zakatEligible));

  return {
    id: String(formId || form?.id || form?._id || "").trim() || null,
    name: String(basics?.displayName || basics?.name || "Donation Form").trim(),
    description: String(basics?.description || "").trim(),
    zakatEligible,
    suggestedAmounts,
    addOns,
    goalsDates: {
      allowOneTimeDonations: goalsDates?.allowOneTimeDonations === undefined ? true : Boolean(goalsDates.allowOneTimeDonations),
      allowRecurringDonations: goalsDates?.allowRecurringDonations === undefined ? true : Boolean(goalsDates.allowRecurringDonations),
      enableTipping: goalsDates?.enableTipping === undefined ? false : Boolean(goalsDates.enableTipping),
      minimumDonation: goalsDates?.minimumDonation ?? 0,
      maximumDonation: goalsDates?.maximumDonation ?? null,
      customNotes: Array.isArray(goalsDates?.customNotes) ? goalsDates.customNotes : [],
      recurringPresets: Array.isArray(goalsDates?.recurringPresets) ? goalsDates.recurringPresets : [],
      allowAnonymousDonations: goalsDates?.allowAnonymousDonations === undefined ? false : Boolean(goalsDates.allowAnonymousDonations),
    },
    causes,
  };
}

const STEPS = [Step1Info, Step2Payment, Step3Addons, Step4Confirmation];
const CAMPAIGN_BASE = "admin/forms/preview";
const STORAGE_FORM_KEY = "hc_admin_preview_form_id";

const AdminFormPreviewStepPage = () => {
  const { step } = useParams();
  const searchParams = useSearchParams();
  const { update, reset } = useDonation();
  const updateRef = useRef(update);
  const resetRef = useRef(reset);

  useEffect(() => {
    updateRef.current = update;
    resetRef.current = reset;
  }, [update, reset]);

  const stepNum = useMemo(() => Number.parseInt(String(step || ""), 10), [step]);
  const index = Number.isFinite(stepNum) ? stepNum - 1 : -1;
  const StepComponent = index >= 0 && index < STEPS.length ? STEPS[index] : null;

  const formIdParam = useMemo(() => String(searchParams.get("formId") || "").trim(), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoading(true);

        const storedFormId = (() => {
          try {
            return String(sessionStorage.getItem(STORAGE_FORM_KEY) || "").trim();
          } catch {
            return "";
          }
        })();

        const resolvedFormId = formIdParam || storedFormId;
        if (!resolvedFormId) {
          if (!alive) return;
          setError("Missing formId.");
          setLoading(false);
          return;
        }

        if (storedFormId && storedFormId !== resolvedFormId) {
          resetRef.current();
        }

        try {
          sessionStorage.setItem(STORAGE_FORM_KEY, resolvedFormId);
        } catch {}

        updateRef.current({ campaign: CAMPAIGN_BASE, maxStep: 4 });

        const needsCampaignData = (() => {
          try {
            const raw = sessionStorage.getItem("campaignData");
            if (!raw) return true;
            const meta = JSON.parse(raw);
            return String(meta?.id || "").trim() !== String(resolvedFormId).trim();
          } catch {
            return true;
          }
        })();

        if (needsCampaignData) {
          const res = await getAdminFormReview(resolvedFormId);
          if (!alive) return;
          const review = normalizeReviewResponse(res);
          const campaignData = buildCampaignDataFromAdminReview(review, resolvedFormId);
          try {
            sessionStorage.setItem("campaignData", JSON.stringify(campaignData));
          } catch {}
        }

        if (!alive) return;
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load preview.");
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formIdParam]);

  if (!StepComponent) {
    return (
      <div className="p-4 text-sm text-[#6B7280]">
        Invalid step.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-sm text-[#6B7280]">Loading preview…</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return index === 0 ? <StepComponent campaignSlug={CAMPAIGN_BASE} /> : <StepComponent />;
}

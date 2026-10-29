import { Suspense } from "react";
import { notFound } from "next/navigation";
import Step1Gift from "@/app/donate/steps/Step1Gift";
import Step2Details from "@/app/donate/steps/Step2Details";
import Step3Payment from "@/app/donate/steps/Step3Payment";
import StepGuard from "@/app/donate/steps/StepComponents/StepGuard";

const STEPS = [
  Step1Gift,
  Step2Details,
  Step3Payment,
];

export default async function CampaignStepPage({ params }) {
  const { campaignSlug, step } = await params;
  const index = parseInt(step, 10) - 1;

  if (isNaN(index) || index < 0 || index >= STEPS.length) return notFound();

  const StepComponent = STEPS[index];
  return (
    <Suspense fallback={null}>
      <StepGuard step={index + 1} campaignSlug={campaignSlug}>
        <StepComponent campaignSlug={campaignSlug} />
      </StepGuard>
    </Suspense>
  );
}

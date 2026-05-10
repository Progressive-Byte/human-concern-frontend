import { Suspense } from "react";
import { notFound } from "next/navigation";
import Step1Info from "@/app/donate/steps/Step1Info";
import Step2Cause from "@/app/donate/steps/Step2Cause";
import Step3Objective from "@/app/donate/steps/Step3Objective";
import Step4Payment from "@/app/donate/steps/Step4Payment";
import Step5Addons from "@/app/donate/steps/Step5Addons";
import Step6Confirmation from "@/app/donate/steps/Step8Confirmation";

const STEPS = [
  Step1Info,
  Step2Cause,
  Step3Objective,
  Step4Payment,
  Step5Addons,
  Step6Confirmation,
];

export default async function CampaignStepPage({ params }) {
  const { campaignSlug, step } = await params;
  const index = parseInt(step, 10) - 1;

  if (isNaN(index) || index < 0 || index >= STEPS.length) notFound();

  const StepComponent = STEPS[index];
  return (
    <Suspense>
      <StepComponent campaignSlug={campaignSlug} />
    </Suspense>
  );
}

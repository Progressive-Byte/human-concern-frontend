import { Suspense } from "react";
import { notFound } from "next/navigation";
import Step1Info from "@/app/donate/steps/Step1Info";
import Step2Payment from "@/app/donate/steps/Step2Payment";
import Step3Addons from "@/app/donate/steps/Step3Addons";
import Step4Confirmation from "@/app/donate/steps/Step4Confirmation";

const STEPS = [
  Step1Info,
  Step2Payment,
  Step3Addons,
  Step4Confirmation,
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

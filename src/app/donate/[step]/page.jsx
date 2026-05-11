import { Suspense } from "react";
import { notFound } from "next/navigation";
import Step1Info from "../steps/Step1Info";
import Step4Payment from "../steps/Step4Payment";
import Step5Addons from "../steps/Step5Addons";
import Step8Confirmation from "../steps/Step8Confirmation";

const STEPS = [
  Step1Info,
  Step4Payment,
  Step5Addons,
  Step8Confirmation,
];

export default async function DonateStepPage({ params }) {
  const { step } = await params;
  const index = parseInt(step, 10) - 1;

  if (isNaN(index) || index < 0 || index >= STEPS.length) notFound();

  const StepComponent = STEPS[index];
  return (
    <Suspense>
      <StepComponent />
    </Suspense>
  );
}

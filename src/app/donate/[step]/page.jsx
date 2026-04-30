import { Suspense } from "react";
import { notFound } from "next/navigation";
import Step1Info from "../steps/Step1Info";
import Step2Cause from "../steps/Step2Cause";
import Step3Objective from "../steps/Step3Objective";
import Step4Payment from "../steps/Step4Payment";
import Step5Addons from "../steps/Step5Addons";
import Step6Summary from "../steps/Step6Summary";
import Step6PaymentDetails from "../steps/Step6PaymentDetails";
import Step7Confirmation from "../steps/Step7Confirmation";

const STEPS = [
  Step1Info,
  Step2Cause,
  Step3Objective,
  Step4Payment,
  Step5Addons,
  Step6Summary,
  Step6PaymentDetails,
  Step7Confirmation,
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

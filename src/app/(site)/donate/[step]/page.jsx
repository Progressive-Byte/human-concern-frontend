import { notFound } from "next/navigation";
import Step1Amount from "../steps/Step3Objective";
import Step2Frequency from "../steps/Step2Cause";
import Step3PersonalInfo from "../steps/Step1Info";
import Step4Contact from "../steps/Step5Summary";
import Step5Payment from "../steps/Step4Payment";
import Step6CardDetails from "../steps/Step6PaymentDetails";
import Step7Review from "../steps/Step7Confirmation";

const STEPS = [
  Step1Amount,
  Step2Frequency,
  Step3PersonalInfo,
  Step4Contact,
  Step5Payment,
  Step6CardDetails,
  Step7Review,
];

export default async function DonateStepPage({ params }) {
  const { step } = await params;
  const index = parseInt(step, 10) - 1;

  if (isNaN(index) || index < 0 || index >= STEPS.length) notFound();

  const StepComponent = STEPS[index];
  return <StepComponent />;
}

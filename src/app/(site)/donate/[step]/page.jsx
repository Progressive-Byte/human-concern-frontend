import { notFound } from "next/navigation";
import Step1Amount from "../steps/Step1Amount";
import Step2Frequency from "../steps/Step2Frequency";
import Step3PersonalInfo from "../steps/Step3PersonalInfo";
import Step4Contact from "../steps/Step4Contact";
import Step5Payment from "../steps/Step5Payment";
import Step6CardDetails from "../steps/Step6CardDetails";
import Step7Review from "../steps/Step7Review";

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

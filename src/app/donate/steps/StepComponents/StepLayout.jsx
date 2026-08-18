"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import StepProgress from "./StepProgress";
import DonationPreview from "./DonationPreview";
import { ArrowNextIcon, ArrowPrevIcon, CircleCheckIcon, NoticeIcon } from "@/components/common/SvgIcon";

const STEP_LABELS = [
  "Info",
  "Cause",
  "Objectives",
  "Payment",
  "Overview",
  "Confirmation",
];

const StepLayout = ({
  step,
  title,
  subtitle = "Share some necessary personal information for security",
  children,
  onNext,
  onPrev,
  nextLabel,
  prevLabel,
}) => {
  const router = useRouter();
  const { data } = useDonation();
  const base = data.campaign ? `/${data.campaign}` : "/donate";
  const totalSteps = 4;
  const displayStep = step;

  const resolvedNextLabel = nextLabel ?? STEP_LABELS[step] ?? "Continue";
  const resolvedPrevLabel = prevLabel ?? STEP_LABELS[step - 2] ?? "Back";

  const showPreview = step >= 1;

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-[100px] sm:pt-[120px] md:pt-[130px] lg:pt-[160px] pb-12 sm:pb-16 px-3 sm:px-4">
      {/* Form column always centered at max-w-[700px] */}
      <div className="mx-auto max-w-[700px]">
        <StepProgress current={step} />

        {/* relative so the absolute preview is anchored here */}
        <div className="relative">
          <div className="relative bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-5 sm:p-6 md:p-8">
            {data.zakatEligible && (
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-7 md:right-7 flex items-center gap-1 bg-[#F7FFED] border border-[#38383833] rounded-full px-2.5 py-1 whitespace-nowrap">
                <span className="text-[13px] leading-none shrink-0">{CircleCheckIcon}</span>
                <span className="text-[11px] font-medium text-[#383838]">Zakat Eligible</span>
              </div>
            )}
            <h2 className="text-xl sm:text-[24px] font-bold text-[#383838] mb-1 pr-28 sm:pr-0 leading-tight">{title}</h2>
            <p className="text-sm text-[#8C8C8C] font-normal mb-5 sm:mb-6">{subtitle}</p>
            {children}

            <div className="mt-6 sm:mt-8 flex items-start sm:items-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-3 sm:px-4 py-2.5 sm:py-3">
              <span className="shrink-0 mt-0.5 sm:mt-0">{NoticeIcon}</span>
              <span className="text-[12px] text-[#AEAEAE] leading-snug">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between mt-5 gap-3">
              <div>
                {step > 1 ? (
                  <button
                    onClick={() => onPrev ? onPrev() : router.push(`${base}/${step - 1}`)}
                    className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-[#383838] text-[14px] font-medium hover:border-[#AEAEAE] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {ArrowPrevIcon}
                    {resolvedPrevLabel}
                  </button>
                ) : (
                  <div />
                )}
              </div>
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[14px] font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                {resolvedNextLabel}
                {ArrowNextIcon}
              </button>
            </div>
          </div>

          {/* Desktop: preview floats to the right without shifting the form, and
              stays pinned in view (within the form's height) while scrolling. */}
          {showPreview && (
            <div className="hidden lg:block absolute inset-y-0 left-[calc(100%+20px)] w-[272px]">
              <div className="sticky top-[110px]">
                <DonationPreview currentStep={step} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile: preview below form in normal flow */}
        {showPreview && (
          <div className="lg:hidden mt-5">
            <DonationPreview currentStep={step} />
          </div>
        )}

        <p className="text-center text-[12px] text-[#AEAEAE] mt-4 px-2">
          Step {displayStep} of {totalSteps} — Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
}
export default StepLayout;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useBranding } from "@/context/BrandingContext";
import StepProgress from "./StepProgress";
import DonateFormHeader from "./DonateFormHeader";
import DonationPreview from "./DonationPreview";
import { getCurrencySymbol } from "@/utils/money";
import { ArrowNextIcon, ArrowPrevIcon, CircleCheckIcon, NoticeIcon } from "@/components/common/SvgIcon";

const STEP_LABELS = [
  "Your gift",
  "Your details",
  "Payment",
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
  const { donationThemeStyle } = useBranding();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const base = data.campaign ? `/${data.campaign}` : "/donate";
  const totalSteps = 3;
  const displayStep = step;

  const resolvedNextLabel = nextLabel ?? STEP_LABELS[step] ?? "Continue";
  const resolvedPrevLabel = prevLabel ?? STEP_LABELS[step - 2] ?? "Back";

  const showPreview = step >= 1;
  const sym = getCurrencySymbol(data.currency ?? "USD");
  const rawTotal =
    Number(data.grandTotal) > 0
      ? Number(data.grandTotal)
      : data.paymentType === "recurring" && data.splitMode !== "divide" && Number(data.perDateTotal) > 0
        ? Number(data.perDateTotal)
        : Number(data.donorAmount ?? 0);
  const totalAmount = Number.isFinite(rawTotal) ? rawTotal : 0;

  useEffect(() => {
    if (!summaryOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [summaryOpen]);

  const navRow = (
    <div className="flex flex-wrap items-center justify-between gap-3">
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
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#333333] active:scale-95 cursor-pointer whitespace-nowrap sm:flex-none sm:px-6"
      >
        {resolvedNextLabel}
        {ArrowNextIcon}
      </button>
    </div>
  );

  return (
    <main style={donationThemeStyle} className="min-h-screen bg-[#F9F9F9] pt-[88px] pb-12 sm:pb-16 px-3 sm:px-4">
      <DonateFormHeader />

      {/* Form column always centered at max-w-[700px] */}
      <div className="mx-auto max-w-[700px]">
        <StepProgress current={step} />

        {/* relative so the absolute preview is anchored here */}
        <div className="relative">
          <div className="relative bg-white rounded-2xl p-5 sm:p-6 md:p-8">
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
            <div className="hidden lg:block mt-5">{navRow}</div>
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

        {/* Mobile: step count and the summary trigger share one row above the primary action. */}
        {showPreview && (
          <div className="lg:hidden mt-5 flex items-center justify-between gap-3">
            <span className="whitespace-nowrap text-[12px] text-[#AEAEAE]">
              Step {displayStep} of {totalSteps}
            </span>
            <div className="flex min-w-0 items-center gap-3">
              {totalAmount > 0 ? (
                <span className="whitespace-nowrap text-[12px] text-[#737373]">
                  Total <span className="font-semibold text-[#383838]">{sym}{totalAmount.toFixed(2)}</span>
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-[12px] font-semibold text-[#737373] transition-colors hover:text-[#EA3335]"
              >
                View summary
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile: the next/back buttons come after the summary button. */}
        <div className="lg:hidden mt-3">{navRow}</div>

        {showPreview && summaryOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close donation summary"
              onClick={() => setSummaryOpen(false)}
              className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px]"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Donation summary"
              className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-3xl border-t border-[#E5E5E5] bg-white pt-2 shadow-2xl"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#E5E5E5]" />
              <div className="flex items-center justify-between px-4 pb-1">
                <p className="text-[13px] font-semibold text-[#383838]">Donation summary</p>
                <button
                  type="button"
                  onClick={() => setSummaryOpen(false)}
                  className="rounded-lg px-2 py-1 text-[12px] font-semibold text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#383838] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <DonationPreview currentStep={step} showHeading={false} />
            </div>
          </div>
        ) : null}

        <p className="mt-4 hidden px-2 text-center text-[12px] text-[#AEAEAE] lg:block">
          Step {displayStep} of {totalSteps} — Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
}
export default StepLayout;

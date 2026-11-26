"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useBranding } from "@/context/BrandingContext";
import StepProgress from "./StepProgress";
import DonateFormHeader from "./DonateFormHeader";
import DonationPreview from "./DonationPreview";
import SummarySheet from "./SummarySheet";
import { getCurrencySymbol } from "@/utils/money";
import { ArrowNextIcon, ArrowPrevIcon, NoticeIcon } from "@/components/common/SvgIcon";

const STEP_LABELS = [
  "Your gift",
  "Your details",
  "Payment",
];

const StepLayout = ({
  step,
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
    <main
      style={donationThemeStyle}
      className="min-h-screen min-h-[100dvh] bg-[#F9F9F9] pt-[72px] sm:pt-[78px] pb-12 sm:pb-16 px-3 sm:px-4"
    >
      <DonateFormHeader />

      {/* Form column always centered at max-w-[700px] */}
      <div className="mx-auto max-w-[700px]">
        <div className="mb-4 sm:mb-8">
          <StepProgress current={step} />
        </div>

        {/* relative so the absolute preview is anchored here */}
        <div className="relative">
          <div className="relative bg-white rounded-2xl p-5 sm:p-6 md:p-8">
            {/*
              The step title, its subtitle and the Zakat badge used to repeat here what the sticky
              header already says — the step is named by the progress dots and the form name is at
              the top. The badge now lives in the header. `title`/`subtitle` are kept as props so
              callers stay explicit about which step they are, and are used for the desktop label.
            */}
            {children}

            {/*
              Phone: the note moves into the sticky action bar, so it stays on screen while the
              donor scrolls. Desktop keeps it inline, where the page is short enough to see it.
            */}
            <div className="mt-6 hidden sm:mt-8 sm:flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3">
              <span className="shrink-0">{NoticeIcon}</span>
              <span className="text-[12px] text-[#AEAEAE] leading-snug">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
            <div className="hidden min-[1440px]:block mt-5">{navRow}</div>
          </div>

          {/* Desktop: preview floats to the right without shifting the form, and
              stays pinned in view (within the form's height) while scrolling. */}
          {showPreview && (
            <div className="hidden min-[1440px]:block absolute inset-y-0 left-[calc(100%+20px)] w-[272px]">
              <div className="sticky top-[110px]">
                <DonationPreview currentStep={step} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile: the running total leads this row in the brand red, with the summary trigger
            beside it. The "Step 1 of 3" text was removed — the progress dots already show the
            step, and the figure the donor cares about is what they are about to give. */}
        {showPreview && (
          <div className="min-[1440px]:hidden mt-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              {/* The red figure alone left it unclear what it counted. The label names it. */}
              <span className="text-[11px] font-medium leading-none text-[#AEAEAE]">Total</span>
              <span className="mt-1 min-w-0 truncate text-[24px] font-bold leading-none text-[#EA3335]">
                {totalAmount > 0 ? `${sym}${totalAmount.toFixed(2)}` : ""}
              </span>
            </div>
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
        )}

        {/* Mobile: the next/back buttons come after the summary button and stay reachable
            while the step scrolls. Nothing moves in the DOM — it only stops scrolling away. */}
        <div
          className="min-[1440px]:hidden sticky bottom-0 z-30 -mx-3 sm:-mx-4 mt-3 border-t border-[#EBEBEB] bg-white/95 px-3 sm:px-4 pt-2.5 backdrop-blur"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          {/* Always visible on a phone: the reassurance the donor needs at the moment of paying. */}
          <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] leading-none text-[#AEAEAE] sm:hidden">
            <span className="shrink-0">{NoticeIcon}</span>
            Your payment is secured with 256-bit SSL encryption
          </p>
          {navRow}
        </div>

        {showPreview && (
          <SummarySheet
            open={summaryOpen}
            onClose={() => setSummaryOpen(false)}
            hiddenClassName="min-[1440px]:hidden"
          >
            <DonationPreview currentStep={step} showHeading={false} />
          </SummarySheet>
        )}

        <p className="mt-4 hidden px-2 text-center text-[12px] text-[#AEAEAE] min-[1440px]:block">
          Step {displayStep} of {totalSteps} — Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
}
export default StepLayout;

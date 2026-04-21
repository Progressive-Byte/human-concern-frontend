"use client";

import { useRouter } from "next/navigation";
import StepProgress from "./StepProgress";
import { ArrowNextIcon, ArrowPrevIcon, NoticeIcon } from "@/components/common/SvgIcon";

const STEP_LABELS = [
  "Info",
  "Cause",
  "Objectives",
  "Payment",
  "Addons",
  "Summary",
  "Payment Details",
  "Confirmation",
];

export default function StepLayout({
  step,
  title,
  subtitle = "Share some necessary personal information for security",
  children,
  onNext,
  nextLabel,
  prevLabel,
  showSkip = false,
  onSkip,
}) {
  const router = useRouter();

  const resolvedNextLabel = nextLabel ?? STEP_LABELS[step] ?? "Continue";
  const resolvedPrevLabel = prevLabel ?? STEP_LABELS[step - 2] ?? "Back";

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-[120px] lg:pt-[160px] pb-16 px-4">
      <div className="max-w-[700px] mx-auto">
        <StepProgress current={step} />

        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 sm:p-8">
          {/* ── Header ── */}
          <h2 className="text-[22px] font-bold text-[#383838] mb-1">{title}</h2>
          <p className="text-sm text-[#8C8C8C] font-normal mb-6">{subtitle}</p>

          {/* ── Content ── */}
          {children}

          {/* ── Security badge ── */}
          <div className="mt-8 flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3">
            {NoticeIcon}
            <span className="text-[12px] text-[#AEAEAE]">
              Your payment is secured with 256-bit SSL encryption
            </span>
          </div>

          {/* ── Navigation buttons ── */}
          <div className="flex items-center justify-between mt-5 gap-3">
            {/* Left: Skip (step 1 only) or Back */}
            <div>
              {showSkip ? (
                <button
                  onClick={onSkip ?? (() => router.push("/donate/2"))}
                  className="px-5 py-2.5 rounded-full border border-[#E5E5E5] text-[#383838] text-[14px] font-medium hover:border-[#AEAEAE] transition-colors cursor-pointer"
                >
                  Skip For Now
                </button>
              ) : step > 1 ? (
                <button
                  onClick={() => router.push(`/donate/${step - 1}`)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#E5E5E5] text-[#383838] text-[14px] font-medium hover:border-[#AEAEAE] transition-colors cursor-pointer"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[14px] font-semibold transition-all cursor-pointer"
            >
              {resolvedNextLabel}
              {ArrowNextIcon}
            </button>
          </div>
        </div>

        <p className="text-center text-[12px] text-[#AEAEAE] mt-4">
          Step {step} of {STEP_LABELS.length} — Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
}
"use client";

import { useRouter } from "next/navigation";
import StepProgress from "./StepProgress";

export default function StepLayout({ step, title, children, onNext, nextLabel = "Continue" }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-[120px] lg:pt-[160px] pb-16 px-4">
      <div className="max-w-[700px] mx-auto">
        <StepProgress current={step} />
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 sm:p-8">
          <h2 className="text-[22px] font-bold text-[#383838] mb-6">{title}</h2>
          {children}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => router.push(`/donate/${step - 1}`)}
                className="flex-1 py-3 rounded-xl border border-[#E5E5E5] text-[#383838] font-medium hover:border-gray-400 transition-colors text-[15px]"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex-1 py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white font-semibold transition-colors text-[15px] active:scale-95"
            >
              {nextLabel}
            </button>
          </div>
        </div>
        <p className="text-center text-[12px] text-[#AEAEAE] mt-4">
          Step {step} of 7 — Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
}

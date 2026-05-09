"use client";

import WizardFooterNav from "./WizardFooterNav";

export default function WizardStepPlaceholder({ title, description, saving = false, onBack, onNext, nextLabel = "Next" }) {
  return (
    <div className="space-y-6">
      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="mb-2 text-[16px] font-semibold text-[#111827]">{title}</div>
        <div className="text-[13px] text-[#6B7280]">{description}</div>
        <div className="mt-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-700">
          This step UI/API will be implemented next.
        </div>
      </section>

      <WizardFooterNav saving={saving} onBack={onBack} onSave={() => undefined} onNext={onNext} nextLabel={nextLabel} />
    </div>
  );
}


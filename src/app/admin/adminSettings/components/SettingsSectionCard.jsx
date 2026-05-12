"use client";

export default function SettingsSectionCard({ icon, title, subtitle, children }) {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]/5 text-[#111827]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[18px] font-semibold text-[#111827]">{title}</div>
          {subtitle ? <div className="mt-1 text-[13px] text-[#6B7280]">{subtitle}</div> : null}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}


"use client";

export default function FormWizardShell({ step = "basics", title = "Create Form", children }) {
  const steps = [
    { key: "basics", label: "Basics" },
    { key: "goals-dates", label: "Goals & Dates" },
    { key: "causes", label: "Causes" },
    { key: "objectives", label: "Objectives" },
    { key: "addons", label: "Add-ons" },
    { key: "media", label: "Media" },
    { key: "review", label: "Review" },
  ];

  return (
    <div className="min-w-0 p-4 md:p-6 space-y-6">
      <div className="hc-animate-fade-up flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">{title}</h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">Wizard configuration is saved on the Form.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((s, idx) => {
              const active = s.key === step;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold ${
                      active ? "border border-red-600/20 bg-red-600/10 text-[#111827]" : "text-[#6B7280]"
                    }`}
                  >
                    <span className={`${active ? "text-red-600" : "text-[#9CA3AF]"}`}>{idx + 1}</span>
                    <span>{s.label}</span>
                  </div>
                  {idx < steps.length - 1 ? <span className="text-[#E5E7EB]">—</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}


"use client";

export default function FormWizardShell({
  step = "basics",
  title = "Create Form",
  steps,
  completedKeys,
  onStepClick,
  children,
}) {
  const list = Array.isArray(steps) && steps.length ? steps : [
    { key: "basics", label: "Basics" },
    { key: "goals-dates", label: "Goals & Dates" },
    { key: "causes", label: "Causes" },
    { key: "objectives", label: "Objectives" },
    { key: "addons", label: "Add-ons" },
    { key: "media", label: "Media" },
    { key: "review", label: "Review" },
  ];
  const done = completedKeys instanceof Set ? completedKeys : new Set(Array.isArray(completedKeys) ? completedKeys : []);

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
            {list.map((s, idx) => {
              const active = s.key === step;
              const completed = done.has(s.key);
              const clickable = Boolean(onStepClick) && completed && !active;
              const Pill = clickable ? "button" : "div";
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <Pill
                    type={clickable ? "button" : undefined}
                    onClick={clickable ? () => onStepClick?.(s.key) : undefined}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold ${
                      active
                        ? "border border-red-600/20 bg-red-600/10 text-[#111827]"
                        : clickable
                        ? "text-[#6B7280] transition hover:bg-[#F9FAFB]"
                        : "text-[#6B7280]"
                    } ${clickable ? "cursor-pointer" : ""}`}
                  >
                    <span className={`${active ? "text-red-600" : "text-[#9CA3AF]"}`}>{idx + 1}</span>
                    <span>{s.label}</span>
                    {completed ? (
                      <span className="inline-flex items-center text-[#16A34A]" aria-label="Completed">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M16.25 5.75L8.75 13.25L3.75 8.25"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </Pill>
                  {idx < list.length - 1 ? <span className="text-[#E5E7EB]">—</span> : null}
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

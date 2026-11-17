"use client";

import { useFormEditorGuard } from "./FormEditorGuardProvider";

const STATUS_STYLES = {
  saving: { label: "Saving...", className: "bg-[#F3F4F6] text-[#6B7280]" },
  dirty: { label: "Unsaved changes", className: "bg-[#FEF3C7] text-[#92400E]" },
  saved: { label: "All changes saved", className: "bg-[#ECFDF5] text-[#047857]" },
  error: { label: "Save failed", className: "bg-red-500/10 text-red-600" },
};

const FORM_STATUS = {
  draft: { label: "Draft", className: "border-amber-200 bg-amber-50 text-amber-700" },
  published: { label: "Published", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  archived: { label: "Archived", className: "border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]" },
};

function SaveStatusChip({ state }) {
  const entry = STATUS_STYLES[String(state || "")];
  if (!entry) return null;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${entry.className}`}>
      {entry.label}
    </span>
  );
}

const FormWizardShell = ({
  step = "basics",
  title = "Create Form",
  status = "",
  steps,
  completedKeys,
  onStepClick,
  children,
}) => {
  const guard = useFormEditorGuard();
  const statusKey = String(status || "").trim().toLowerCase();
  const statusMeta = FORM_STATUS[statusKey];
  const saveError = guard?.saveError;
  const list = Array.isArray(steps) && steps.length ? steps : [
    { key: "basics", label: "Basics" },
    { key: "goals-dates", label: "Goals & Dates" },
    { key: "causes", label: "Causes & Designation" },
    { key: "objectives", label: "Objectives" },
    { key: "addons", label: "Add-ons" },
    { key: "media", label: "Media" },
    { key: "public-display", label: "Public Display" },
    { key: "review", label: "Review" },
  ];
  const done = completedKeys instanceof Set ? completedKeys : new Set(Array.isArray(completedKeys) ? completedKeys : []);

  return (
    <div className="min-w-0 p-4 md:p-6 space-y-6">
      <div className="hc-animate-fade-up flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">{title}</h1>
            {statusMeta ? (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {statusKey === "published"
              ? "Published forms are read-only here. Move the form to Draft to edit."
              : statusKey === "archived"
              ? "Archived forms are read-only here."
              : "Changes are saved automatically. Wizard configuration is saved on the Form."}
          </p>
        </div>

        <SaveStatusChip state={guard?.saveState} />
      </div>

      <div className="sticky top-0 z-30 -mx-4 border-b border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="rounded-2xl border border-solid border-[#E5E7EB] bg-white px-4 py-3">
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
                    <span className={`${active ? "hc-admin-accent-text" : "text-[#9CA3AF]"}`}>{idx + 1}</span>
                    <span>{s.label}</span>
                    {completed ? (
                      <span className="inline-flex items-center hc-admin-accent-text" aria-label="Completed">
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

      {saveError ? (
        <div className="rounded-2xl border border-solid border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600">
          <span className="font-semibold">Save failed:</span> {saveError}
        </div>
      ) : null}

      {children}
    </div>
  );
}
export default FormWizardShell;

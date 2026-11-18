"use client";

import { useState } from "react";
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

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.25 5.75L8.75 13.25L3.75 8.25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepRow({ index, label, active, completed, clickable, onSelect }) {
  const Tag = clickable ? "button" : "div";

  return (
    <Tag
      type={clickable ? "button" : undefined}
      onClick={clickable ? onSelect : undefined}
      aria-current={active ? "step" : undefined}
      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
        active ? "bg-red-600/10" : clickable ? "hover:bg-[#F9FAFB]" : ""
      } ${clickable ? "cursor-pointer" : ""}`}
    >
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
          active
            ? "bg-red-600 text-white"
            : completed
            ? "bg-emerald-50 text-emerald-700"
            : "bg-[#F3F4F6] text-[#9CA3AF]"
        }`}
      >
        {completed ? <CheckIcon /> : index + 1}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[12px] font-semibold ${
          active ? "text-[#111827]" : completed ? "text-[#374151]" : "text-[#9CA3AF]"
        }`}
      >
        {label}
      </span>
    </Tag>
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
  const [stepsOpen, setStepsOpen] = useState(false);
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
  const currentIndex = Math.max(0, list.findIndex((item) => item.key === step));
  const currentStep = list[currentIndex] || list[0] || { label: "Form" };
  const progress = list.length ? ((currentIndex + 1) / list.length) * 100 : 0;

  function chooseStep(key) {
    setStepsOpen(false);
    if (key !== step) onStepClick?.(key);
  }

  return (
    <div className="min-w-0 p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-[1240px] space-y-4 md:space-y-6">
        <header className="hc-animate-fade-up flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[24px] font-semibold leading-tight text-[#111827]">{title}</h1>
              {statusMeta ? (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[14px] leading-snug text-[#6B7280]">
              {statusKey === "published"
                ? "Published forms are read-only here. Move the form to Draft to edit."
                : statusKey === "archived"
                ? "Archived forms are read-only here."
                : "Changes are saved automatically. Wizard configuration is saved on the Form."}
            </p>
          </div>

          <SaveStatusChip state={guard?.saveState} />
        </header>

        <div className="flex items-start gap-4 lg:gap-6">
          <aside className="sticky top-4 hidden max-h-[calc(100dvh-2rem)] w-[220px] shrink-0 overflow-y-auto lg:block">
            <div className="rounded-2xl border border-solid border-[#E5E7EB] bg-white p-2.5">
              <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Form steps
              </p>
              <nav className="space-y-0.5" aria-label="Form steps">
                {list.map((item, index) => {
                  const active = item.key === step;
                  const completed = done.has(item.key);
                  const clickable = Boolean(onStepClick) && completed && !active;

                  return (
                    <StepRow
                      key={item.key}
                      index={index}
                      label={item.label}
                      active={active}
                      completed={completed}
                      clickable={clickable}
                      onSelect={() => chooseStep(item.key)}
                    />
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-3 sm:space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 rounded-2xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 lg:hidden">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Step {currentIndex + 1} of {list.length}
                </p>
                <p className="truncate text-[13px] font-semibold text-[#111827]">{currentStep.label}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div className="h-full rounded-full bg-red-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStepsOpen(true)}
                aria-haspopup="dialog"
                className="shrink-0 cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Steps
              </button>
            </div>

            {saveError ? (
              <div className="rounded-xl border border-solid border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-600">
                <span className="font-semibold">Save failed:</span> {saveError}
              </div>
            ) : null}

            {children}
          </div>
        </div>
      </div>

      {stepsOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close steps"
            onClick={() => setStepsOpen(false)}
            className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Form steps"
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t border-[#E5E7EB] bg-white px-3 pt-2 shadow-2xl"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#E5E7EB]" />
            <div className="flex items-center justify-between px-1 pb-2">
              <p className="text-[13px] font-semibold text-[#111827]">Form steps</p>
              <button
                type="button"
                onClick={() => setStepsOpen(false)}
                className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-semibold text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
              >
                Close
              </button>
            </div>
            <nav className="space-y-0.5" aria-label="Form steps">
              {list.map((item, index) => {
                const active = item.key === step;
                const completed = done.has(item.key);
                const clickable = active || (Boolean(onStepClick) && completed);

                return (
                  <StepRow
                    key={item.key}
                    index={index}
                    label={item.label}
                    active={active}
                    completed={completed}
                    clickable={clickable}
                    onSelect={() => chooseStep(item.key)}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FormWizardShell;

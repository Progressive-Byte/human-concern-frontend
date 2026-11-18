"use client";

export default function FieldError({ message = "" }) {
  if (!message) return null;

  return (
    <div
      data-field-error="true"
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[12px] font-medium text-red-700"
    >
      <span
        aria-hidden="true"
        className="mt-px grid size-4 shrink-0 place-items-center rounded-full bg-red-600 text-[10px] font-bold leading-none text-white"
      >
        !
      </span>
      <span>{message}</span>
    </div>
  );
}

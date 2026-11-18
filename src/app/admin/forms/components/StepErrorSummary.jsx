"use client";

import { useEffect, useMemo, useRef } from "react";
import { humanizeFormError } from "@/utils/formValidationMessages";

function collectMessages(value, out) {
  if (!value) return;

  if (typeof value === "string") {
    const text = humanizeFormError(value);
    if (text) out.push(text);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectMessages(item, out);
    return;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value)) collectMessages(item, out);
  }
}

export default function StepErrorSummary({ errors, topError = "", title = "Please fix these before continuing" }) {
  const boxRef = useRef(null);
  const previousCount = useRef(0);

  const messages = useMemo(() => {
    const out = [];
    collectMessages(topError, out);
    collectMessages(errors, out);
    return Array.from(new Set(out));
  }, [errors, topError]);

  useEffect(() => {
    if (messages.length > 0 && previousCount.current === 0) {
      boxRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
    previousCount.current = messages.length;
  }, [messages.length]);

  if (!messages.length) return null;

  const visible = messages.slice(0, 6);

  return (
    <div
      ref={boxRef}
      role="alert"
      aria-live="polite"
      className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-600 text-[12px] font-bold text-white"
        >
          !
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {title} ({messages.length})
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {visible.map((message, index) => (
              <li key={`${index}-${message}`}>{message}</li>
            ))}
          </ul>
          {messages.length > visible.length ? (
            <p className="mt-1 text-[12px] font-medium">
              …and {messages.length - visible.length} more.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

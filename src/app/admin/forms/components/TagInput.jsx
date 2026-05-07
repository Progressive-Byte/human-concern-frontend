"use client";

import { useMemo, useState } from "react";
import FieldError from "./FieldError";

function splitTokens(text) {
  return String(text || "")
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function TagInput({
  label,
  placeholder = "",
  values = [],
  onChange,
  error = "",
  helper = "",
  max = 10,
  validateToken,
}) {
  const [input, setInput] = useState("");
  const rows = useMemo(() => (Array.isArray(values) ? values : []), [values]);

  function addTokens(tokens) {
    const next = [...rows];
    for (const token of tokens) {
      if (next.length >= max) break;
      if (next.includes(token)) continue;
      next.push(token);
    }
    onChange?.(next);
  }

  function removeToken(token) {
    onChange?.(rows.filter((v) => v !== token));
  }

  return (
    <div>
      {label ? <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div> : null}

      <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5">
        <div className="flex flex-wrap gap-2">
          {rows.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[11px] font-medium text-[#111827]"
            >
              <span className="max-w-[220px] truncate">{t}</span>
              <button
                type="button"
                aria-label="Remove"
                onClick={() => removeToken(t)}
                className="cursor-pointer rounded-full p-0.5 text-[#6B7280] transition hover:bg-red-500/10 hover:text-red-700"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const tokens = splitTokens(input);
                if (tokens.length) addTokens(tokens.filter((t) => (validateToken ? validateToken(t) : true)));
                setInput("");
              }
              if (e.key === "Backspace" && !input && rows.length) {
                removeToken(rows[rows.length - 1]);
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              const tokens = splitTokens(text);
              if (tokens.length) {
                e.preventDefault();
                addTokens(tokens.filter((t) => (validateToken ? validateToken(t) : true)));
              }
            }}
            placeholder={placeholder}
            className="min-w-[160px] flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      {helper ? <div className="mt-1 text-[12px] text-[#6B7280]">{helper}</div> : null}
      <FieldError message={error} />
    </div>
  );
}

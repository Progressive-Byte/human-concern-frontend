"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const MultiSelectFilter = ({ options = [], value = [], onChange, disabled = false, placeholder = "All" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleDocClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => String(option.label || "").toLowerCase().includes(needle));
  }, [options, query]);

  const labelFor = (id) => options.find((option) => option.value === id)?.label || id;

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#6B7280]">
        <FilterIcon />
      </span>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-9 pr-3 text-left text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="truncate">{value.length ? `${value.length} selected` : placeholder}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#6B7280]" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {value.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {value.map((id) => (
            <span
              key={id}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]"
            >
              <span className="truncate">{labelFor(id)}</span>
              <button
                type="button"
                onClick={() => toggle(id)}
                className="cursor-pointer text-[#6B7280] hover:text-[#111827]"
                aria-label={`Remove ${labelFor(id)}`}
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="cursor-pointer text-[11px] font-semibold text-[#111827] hover:underline"
          >
            Clear
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="hc-animate-dropdown absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-lg">
          <div className="border-b border-[#F3F4F6] p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-dashed border-[#E5E7EB] px-3 py-2 text-[12px] text-[#111827] outline-none focus:border-[#111827]/30"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[#6B7280]">No matches</p>
            ) : (
              filtered.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#111827] transition hover:bg-[#F9FAFB]"
                >
                  <input type="checkbox" checked={value.includes(option.value)} onChange={() => toggle(option.value)} />
                  <span className="truncate">{option.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MultiSelectFilter;

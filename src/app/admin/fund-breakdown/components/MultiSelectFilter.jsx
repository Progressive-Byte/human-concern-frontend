"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MultiSelectFilter = ({
  label,
  options = [],
  value = [],
  onChange,
  disabled = false,
  placeholder = "All",
}) => {
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
      <label className="mb-1 block text-[12px] font-medium text-[#383838]">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-left text-[13px] outline-none transition focus:border-[#171717]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={value.length ? "text-[#171717]" : "text-[#8C8C8C]"}>
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[#8C8C8C]">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {value.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {value.map((id) => (
            <span
              key={id}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#383838]"
            >
              <span className="truncate">{labelFor(id)}</span>
              <button
                type="button"
                onClick={() => toggle(id)}
                className="cursor-pointer text-[#8C8C8C] hover:text-[#171717]"
                aria-label={`Remove ${labelFor(id)}`}
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" onClick={() => onChange([])} className="cursor-pointer text-[11px] text-[#EA3335] hover:underline">
            Clear
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          <div className="border-b border-[#F1F1F1] p-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-[12px] text-[#383838] outline-none focus:border-[#171717]/30"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[#8C8C8C]">No matches</p>
            ) : (
              filtered.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB]"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => toggle(option.value)}
                  />
                  <span className="truncate text-[13px] text-[#383838]">{option.label}</span>
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

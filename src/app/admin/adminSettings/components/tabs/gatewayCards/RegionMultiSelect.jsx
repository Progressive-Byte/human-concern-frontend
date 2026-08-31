"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { REGION_LIST, getRegionInfo } from "./constants";

const RegionMultiSelect = ({
  value = [],
  onChange,
  disabled = false,
  maxItems = 20,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    function onDocKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open]);

  const regions = useMemo(
    () => (Array.isArray(value) ? value.filter(Boolean) : []),
    [value]
  );

  const selectedSet = useMemo(() => new Set(regions), [regions]);

  const validCodes = useMemo(
    () => new Set(REGION_LIST.map((r) => r.code)),
    []
  );

  const { validSelected, unknownSelected } = useMemo(() => {
    const valid = [];
    const unknown = [];
    regions.forEach((code) => {
      if (validCodes.has(code)) valid.push(code);
      else unknown.push(code);
    });
    return { validSelected: valid, unknownSelected: unknown };
  }, [regions, validCodes]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REGION_LIST.filter(
      (r) =>
        !q ||
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
    );
  }, [search]);

  function toggle(code) {
    if (disabled) return;
    const has = selectedSet.has(code);
    let next;
    if (has) {
      next = regions.filter((r) => r !== code);
    } else {
      if (regions.length >= maxItems) return;
      next = [...regions, code];
    }
    onChange?.(next);
  }

  function removeUnknown(code) {
    if (disabled) return;
    onChange?.(regions.filter((r) => r !== code));
  }

  const selectedInfo = validSelected
    .map((c) => getRegionInfo(c) || { code: c, name: c, flag: "🏷️" })
    .filter(Boolean);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-[42px] w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left transition focus:ring-4 focus:ring-[#111827]/8 ${
          disabled
            ? "border-[#E5E7EB] bg-[#F9FAFB] opacity-60"
            : "border-[#D1D5DB] hover:border-[#9CA3AF] focus:border-[#111827]"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedInfo.length === 0 && unknownSelected.length === 0 ? (
            <span className="text-[13px] text-[#9CA3AF]">
              Select routing regions…
            </span>
          ) : (
            <>
              {selectedInfo.map((info, i) => (
                <span
                  key={info.code + i}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#111827]"
                >
                  <span>{info.flag || "🏷️"}</span>
                  <span>{info.code}</span>
                </span>
              ))}
              {unknownSelected.map((code, i) => (
                <span
                  key={`unknown-${code}-${i}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-amber-800"
                  title="Custom tag (not in standard region list)"
                >
                  <span>🏷️</span>
                  <span>{code}</span>
                  {!disabled ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUnknown(code);
                      }}
                      className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-amber-700 transition hover:bg-amber-200 hover:text-amber-900"
                      aria-label={`Remove ${code}`}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-2.5 w-2.5"
                        fill="none"
                      >
                        <path
                          d="M6 6l8 8M14 6l-8 8"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </span>
              ))}
            </>
          )}
        </div>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-[#6B7280] transition ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
        >
          <path
            d="M5 7.5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 bottom-full z-[999] mb-1.5 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
          <div className="border-b border-[#F3F4F6] bg-[#FAFAFA] p-2.5">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search region code or name…"
              className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
            />
          </div>
          <div className="min-h-[180px] max-h-80 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-3 py-8 text-center text-[12px] text-[#6B7280]">
                No regions match.
              </div>
            ) : null}
            {visible.map((r) => {
              const checked = selectedSet.has(r.code);
              const cbId = `rcb-${r.code}`;
              return (
                <div
                  key={r.code}
                  className={`group flex items-center gap-3 px-3 py-2.5 transition ${
                    checked ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]"
                  }`}
                >
                  <label
                    htmlFor={cbId}
                    className="flex flex-1 cursor-pointer select-none items-center gap-3 text-left"
                  >
                    <input
                      id={cbId}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled || (!checked && regions.length >= maxItems)}
                      onChange={() => toggle(r.code)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-base leading-none">{r.flag || "🏷️"}</span>
                    <span className="w-20 shrink-0 text-[13px] font-bold text-[#111827]">
                      {r.code}
                    </span>
                    <span className="flex-1 truncate text-[13px] text-[#374151]">
                      {r.name}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-[#F3F4F6] bg-[#FAFAFA] px-3.5 py-2.5">
            <div className="text-[11.5px] text-[#6B7280]">
              <span className="font-bold text-[#111827]">{regions.length}</span>
              {" / "}
              {maxItems} selected
              {unknownSelected.length > 0 ? (
                <span className="ml-2 text-amber-600">
                  ({unknownSelected.length} custom)
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSearch("");
              }}
              className="rounded-lg bg-[#111827] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RegionMultiSelect;

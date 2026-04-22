"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon } from "@/components/common/SvgIcon";

/**
 * Reusable custom dropdown
 *
 * Props:
 *  options     — [{ label: string, value: string }]
 *  value       — currently selected value
 *  onChange    — (value: string) => void
 *  label       — sticky header text inside the list  (optional)
 *  placeholder — trigger button text when nothing is selected (optional)
 *  icon        — JSX icon shown on the left of the trigger (optional)
 *  showDot     — show red active-indicator dot on trigger (optional)
 *  maxHeight   — max-height of the scrollable list, default "260px" (optional)
 *  width       — dropdown panel width, default "w-64" (optional)
 *  className   — extra classes for the trigger button (optional)
 */
export default function CustomDropdown({
  options = [],
  value,
  onChange,
  label,
  placeholder = "Select",
  icon,
  showDot = false,
  maxHeight = "260px",
  width = "w-64",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const triggerLabel   = selectedOption?.label ?? placeholder;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer bg-white border border-[#CCCCCC] rounded-full text-sm transition-colors hover:border-gray-400 ${className}`}
      >
        {icon && <span className="shrink-0 text-[#1A1A1A]">{icon}</span>}
        <span className="text-[#1A1A1A] font-medium">{triggerLabel}</span>
        {showDot && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA3335] shrink-0" />
        )}
        <span
          className={`shrink-0 text-[#1A1A1A] transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          {ArrowDownIcon}
        </span>
      </button>
      {open && (
        <div
          className={`absolute right-0 mt-2 ${width} bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden`}
        >
          {label && (
            <div className="sticky top-0 z-10 bg-white px-4 py-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase border-b border-gray-100">
              {label}
            </div>
          )}

          {/* Scrollable list */}
          <ul
            role="listbox"
            style={{ maxHeight }}
            className="overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
          >
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors hover:bg-gray-50 cursor-pointer ${
                      isActive
                        ? "bg-red-50 text-[#EA3335] font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-[#EA3335]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
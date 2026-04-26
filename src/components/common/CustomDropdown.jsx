"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon } from "@/components/common/SvgIcon";

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
  variant = "pill",
  disabled = false,
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

  const isForm = variant === "form";

  const triggerCls = isForm
    ? `w-full flex items-center justify-between gap-2 px-4 py-3 text-[14px] border rounded-xl bg-white transition-colors focus:outline-none ${
        disabled
          ? "border-[#E0E0E0] bg-[#F5F5F5] text-[#888888] cursor-default"
          : "border-[#CCCCCC] text-[#383838] hover:border-[#383838] cursor-pointer"
      } ${className}`
    : `flex items-center gap-3 px-5 py-2.5 cursor-pointer bg-white border border-[#CCCCCC] rounded-full text-sm transition-colors hover:border-gray-400 ${className}`;

  return (
    <div ref={containerRef} className={`relative${isForm ? " w-full" : ""}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={triggerCls}
      >
        {icon && <span className="shrink-0 text-[#1A1A1A]">{icon}</span>}
        <span className={isForm ? (value ? "text-[#383838]" : "text-[#AEAEAE]") : "text-[#1A1A1A] font-medium"}>
          {triggerLabel}
        </span>
        {showDot && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA3335] shrink-0" />
        )}
        <span
          className={`shrink-0 transition-transform duration-200 ${isForm ? "text-[#AEAEAE]" : "text-[#1A1A1A]"} ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          {ArrowDownIcon}
        </span>
      </button>
      {open && !disabled && (
        <div
          className={`absolute left-0 mt-1 ${isForm ? "w-full" : `right-0 mt-2 ${width}`} bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden`}
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
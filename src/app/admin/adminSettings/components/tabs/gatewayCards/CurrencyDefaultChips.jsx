"use client";

import { useMemo, useState } from "react";
import { CURRENCY_LIST, getCurrencyInfo } from "./constants";

const CurrencyMultiSelect = ({
  supportedCurrencies = [],
  defaultCurrency = "",
  provider,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currencies = Array.isArray(supportedCurrencies)
    ? supportedCurrencies.filter(Boolean)
    : [];

  const { selectedSet, defaultCode } = useMemo(() => {
    const s = new Set(currencies);
    const d = defaultCurrency && s.has(defaultCurrency) ? defaultCurrency : currencies[0] || "";
    return { selectedSet: s, defaultCode: d };
  }, [currencies, defaultCurrency]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = CURRENCY_LIST.filter(
      (c) =>
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.symbol || "").toLowerCase().includes(q)
    );
    const selected = list.filter((c) => selectedSet.has(c.code));
    const others = list.filter((c) => !selectedSet.has(c.code));
    return [...selected, ...others].slice(0, 60);
  }, [search, selectedSet]);

  function toggle(code) {
    if (disabled) return;
    const has = selectedSet.has(code);
    let next;
    if (has) {
      next = currencies.filter((c) => c !== code);
      const nextDefault = defaultCode === code ? (next[0] || "") : defaultCode;
      onChange?.(next, nextDefault);
    } else {
      next = [...currencies, code];
      const nextDefault = defaultCode || code;
      onChange?.(next, nextDefault);
    }
  }

  function setDefault(code) {
    if (disabled) return;
    if (!selectedSet.has(code)) return;
    onChange?.(currencies, code);
  }

  const selectedInfo = currencies
    .map((c) => getCurrencyInfo(c) || { code: c, name: c, flag: "", symbol: "" })
    .filter(Boolean);

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-[42px] w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left transition focus:ring-4 focus:ring-[#111827]/8 ${
          disabled
            ? "border-[#E5E7EB] bg-[#F9FAFB] opacity-60"
            : currencies.length === 0
              ? "border-red-300 hover:border-[#9CA3AF] focus:border-[#111827] focus:ring-red-200"
              : "border-[#D1D5DB] hover:border-[#9CA3AF] focus:border-[#111827]"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedInfo.length === 0 ? (
            <span className="text-[13px] text-[#9CA3AF]">Select supported currencies…</span>
          ) : (
            selectedInfo.map((info, i) => {
              const isDef = info.code === defaultCode;
              return (
                <span
                  key={info.code + i}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold ${
                    isDef
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]"
                  }`}
                >
                  <span>{info.flag || "💱"}</span>
                  <span>{info.code}</span>
                  {isDef ? <span className="rounded-full bg-white/15 px-1 text-[9px]">DEFAULT</span> : null}
                </span>
              );
            })
          )}
        </div>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-[#6B7280] transition ${open ? "rotate-180" : ""}`} fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[998]"
            onClick={() => {
              setOpen(false);
              setSearch("");
            }}
            aria-label="Close currency dropdown"
          />
          <div className="absolute left-0 right-0 top-full z-[999] mt-1.5 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
            <div className="border-b border-[#F3F4F6] bg-[#FAFAFA] p-2.5">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency, code or symbol…"
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>
            <div className="min-h-[180px] max-h-80 overflow-y-auto">
              {visible.length === 0 ? (
                <div className="px-3 py-8 text-center text-[12px] text-[#6B7280]">No currencies match.</div>
              ) : null}
              {visible.map((c) => {
                const checked = selectedSet.has(c.code);
                const isDef = checked && c.code === defaultCode;
                return (
                  <div
                    key={c.code}
                    className={`group flex items-center gap-3 px-3 py-2.5 transition ${
                      checked ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <label className="flex flex-1 cursor-pointer items-center gap-3 text-left">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(c.code)}
                        className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]"
                      />
                      <span className="text-base leading-none">{c.flag || "💱"}</span>
                      <span className="w-10 shrink-0 text-[13px] font-bold text-[#111827]">{c.code}</span>
                      <span className="flex-1 truncate text-[13px] text-[#374151]">{c.name}</span>
                      <span className="w-5 shrink-0 text-right text-[11.5px] text-[#6B7280]">{c.symbol || ""}</span>
                    </label>
                    <button
                      type="button"
                      disabled={disabled || !checked}
                      onClick={() => setDefault(c.code)}
                      title={
                        isDef
                          ? `${c.code} is the ${provider || "gateway"} default`
                          : checked
                            ? `Set ${c.code} as ${provider || "gateway"} default`
                            : "Select currency first to make it default"
                      }
                      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[10.5px] font-bold transition ${
                        isDef
                          ? "bg-[#111827] text-white"
                          : checked && !disabled
                            ? "border border-[#D1D5DB] bg-white text-[#6B7280] hover:border-[#111827] hover:text-[#111827]"
                            : "border border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-[#9CA3AF]"
                      }`}
                    >
                      {isDef ? "★ DEFAULT" : "Make default"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-[#F3F4F6] bg-[#FAFAFA] px-3.5 py-2.5">
              <div className="text-[11.5px] text-[#6B7280]">
                <span className="font-bold text-[#111827]">{currencies.length}</span> selected ·{" "}
                {defaultCode ? <span>default <span className="font-bold text-[#111827]">{defaultCode}</span></span> : <span className="text-amber-600">no default</span>}
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
        </>
      ) : null}
    </div>
  );
};

export default CurrencyMultiSelect;

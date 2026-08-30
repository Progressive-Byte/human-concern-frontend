"use client";

import { useState } from "react";
import { CURRENCY_LIST, getCurrencyInfo } from "./constants";

const CurrencyDefaultChips = ({
  supportedCurrencies = [],
  defaultCurrency = "",
  provider,
  onChange,
  disabled = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const currencies = Array.isArray(supportedCurrencies)
    ? supportedCurrencies.filter(Boolean)
    : [];

  const availableToAdd = CURRENCY_LIST.filter(
    (c) =>
      !currencies.includes(c.code) &&
      (!search.trim() ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()))
  );

  function toggleCurrency(code) {
    if (disabled) return;
    const has = currencies.includes(code);
    const next = has
      ? currencies.filter((c) => c !== code)
      : [...currencies, code];
    const nextDefault = defaultCurrency && next.includes(defaultCurrency) ? defaultCurrency : "";
    onChange?.(next, nextDefault);
  }

  function setDefault(code) {
    if (disabled) return;
    if (!currencies.includes(code)) return;
    onChange?.(currencies, code);
  }

  function removeCurrency(code) {
    if (disabled) return;
    const next = currencies.filter((c) => c !== code);
    const nextDefault = defaultCurrency === code ? "" : defaultCurrency;
    onChange?.(next, nextDefault);
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        {currencies.length === 0 ? (
          <div className="text-[12px] text-[#6B7280]">No currencies added yet.</div>
        ) : null}

        {currencies.map((code) => {
          const info = getCurrencyInfo(code) || { code, name: code, flag: "", symbol: "" };
          const isDefault = defaultCurrency === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setDefault(code)}
              title={
                isDefault
                  ? `${code} is the default for ${provider || "this gateway"}`
                  : `Click to set ${code} as default for ${provider || "this gateway"}`
              }
              disabled={disabled}
              className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                isDefault
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#111827]/30 hover:bg-[#F9FAFB]"
              } ${disabled ? "opacity-60" : ""}`}
            >
              <span>{info.flag || "💱"}</span>
              <span>{info.code}</span>
              {isDefault ? <span className="rounded-full bg-white/15 px-1.5 text-[10px]">DEFAULT</span> : null}
              {!disabled ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCurrency(code);
                  }}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full opacity-60 hover:bg-black/10 hover:opacity-100"
                  aria-label={`Remove ${code}`}
                >
                  <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              ) : null}
            </button>
          );
        })}

        {!disabled ? (
          <div className="relative">
            {isAdding ? (
              <>
                <div className="rounded-full border border-[#E5E7EB] bg-white p-1 shadow-sm">
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search currency, code or name…"
                    className="w-48 rounded-full border-none bg-transparent px-2 py-1 text-[12px] outline-none"
                  />
                </div>
                {availableToAdd.length >= 0 ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-[998]"
                      onClick={() => {
                        setIsAdding(false);
                        setSearch("");
                      }}
                      aria-label="Close currency dropdown"
                    />
                    <div className="absolute left-0 top-full z-[999] mt-1.5 w-72 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
                      <div className="min-h-[140px] max-h-72 overflow-y-auto">
                        {availableToAdd.length === 0 ? (
                          <div className="px-3 py-8 text-center text-[12px] text-[#6B7280]">No currencies match or all already added.</div>
                        ) : null}
                        {availableToAdd.slice(0, 20).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleCurrency(c.code);
                              setSearch("");
                              setIsAdding(false);
                            }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition hover:bg-[#F3F4F6]"
                          >
                            <span className="text-base leading-none">{c.flag || "💱"}</span>
                            <span className="w-10 shrink-0 font-bold text-[#111827]">{c.code}</span>
                            <span className="flex-1 truncate text-[#374151]">{c.name}</span>
                            <span className="text-[11px] text-[#6B7280]">{c.symbol || ""}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#D1D5DB] px-3 py-1.5 text-[12px] font-semibold text-[#6B7280] transition hover:border-[#111827]/30 hover:text-[#111827]"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add currency
              </button>
            )}
          </div>
        ) : null}
      </div>
      <div className="mt-2 text-[11px] text-[#6B7280]">
        Click a chip to set it as the {provider ? `${provider} ` : ""}default for that currency. Only one default per currency.
      </div>
    </div>
  );
};

export default CurrencyDefaultChips;

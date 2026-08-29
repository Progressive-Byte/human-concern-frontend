"use client";

import { useState } from "react";
import { getProviderLabel } from "./constants";

function DropdownMenu({ defaultOpen = false, trigger, children, align = "right" }) {
  const [isOpen, setIsOpen] = useState(Boolean(defaultOpen));

  return (
    <div className="relative inline-block">
      <div onClick={() => setIsOpen((v) => !v)}>{trigger}</div>
      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close dropdown"
          />
          <div
            className={`absolute top-full z-20 mt-2 min-w-[240px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <div onClick={() => setIsOpen(false)}>{children}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

const BulkGatewayActionsToolbar = ({
  selected,
  allConfigs = [],
  onClear,
  busy,
  onBulkEnable,
  onBulkDisable,
  onBulkDisconnect,
  onBulkSetPriority,
  onBulkAddCurrency,
  onRunLegacyMigration,
}) => {
  const [priorityValue, setPriorityValue] = useState(50);
  const [currencyValue, setCurrencyValue] = useState("AED");
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const count = Array.isArray(selected) ? selected.length : 0;
  const byProvider = {};
  selected.forEach((key) => {
    const cfg = allConfigs.find((c) => `${c.provider}-${String(c.configurationId || c.id || c._id)}` === key);
    const p = String(cfg?.provider || "");
    byProvider[p] = (byProvider[p] || 0) + 1;
  });

  if (count === 0) return null;

  function handleDisconnectConfirm() {
    setConfirmDisconnect(false);
    onBulkDisconnect?.(selected);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
          <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none">
            <path d="M4 5.5h12M6 10h8M8 14.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-[13px] font-semibold text-amber-900">
          {count} gateway card{count === 1 ? "" : "s"} selected
        </div>
        {Object.keys(byProvider).length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(byProvider).map(([p, n]) => (
              <span
                key={p}
                className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200"
              >
                {getProviderLabel(p)} × {n}
              </span>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          className="text-[12px] font-semibold text-amber-800 underline-offset-2 hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu
          align="right"
          trigger={
            <button
              type="button"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Bulk Actions
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
        >
          <div className="py-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onBulkEnable?.(selected)}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-50"
            >
              <span>🟢</span> Enable selected
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onBulkDisable?.(selected)}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-50"
            >
              <span>⛔</span> Disable selected
            </button>
            <div className="my-1.5 border-t border-[#F3F4F6]" />
            <div className="px-3.5 py-2">
              <div className="mb-2 text-[11px] font-semibold text-[#6B7280]">Bulk set priority (0-100)</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Number(priorityValue)}
                  onChange={(e) => setPriorityValue(Number(e.target.value))}
                  className="h-1.5 w-full accent-[#111827]"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Number(priorityValue)}
                  onChange={(e) => setPriorityValue(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-16 rounded-lg border border-[#E5E7EB] px-2 py-1 text-[11px] font-semibold text-right"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onBulkSetPriority?.(selected, Number(priorityValue))}
                className="mt-2 w-full rounded-lg bg-[#111827] px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                Apply priority {priorityValue}
              </button>
            </div>
            <div className="my-1.5 border-t border-[#F3F4F6]" />
            <div className="px-3.5 py-2">
              <div className="mb-2 text-[11px] font-semibold text-[#6B7280]">Add currency to all selected</div>
              <div className="flex items-center gap-2">
                <select
                  value={currencyValue}
                  onChange={(e) => setCurrencyValue(e.target.value)}
                  className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-[11px] outline-none"
                >
                  {["USD","EUR","GBP","CAD","AUD","AED","SAR","INR","CHF","HKD","SGD","JPY","NZD","CNY","MYR","THB","EGP","TRY","NGN","KES"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onBulkAddCurrency?.(selected, currencyValue)}
                  className="rounded-lg bg-[#111827] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-black disabled:opacity-50"
                >
                  + {currencyValue}
                </button>
              </div>
            </div>
            <div className="my-1.5 border-t border-[#F3F4F6]" />
            <button
              type="button"
              disabled={busy}
              onClick={() => onRunLegacyMigration?.()}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-50"
            >
              <span>🔄</span> Run Legacy Migration Wizard...
            </button>
            <div className="my-1.5 border-t border-[#F3F4F6]" />
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDisconnect(true)}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] font-semibold text-red-700 hover:bg-red-500/10 disabled:opacity-50"
            >
              <span>🗑️</span> Disconnect all selected
            </button>
          </div>
        </DropdownMenu>
      </div>

      {confirmDisconnect ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="fixed inset-0 bg-black/40" onClick={() => setConfirmDisconnect(false)} aria-label="Close" />
          <div className="hc-animate-dropdown relative w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-xl">
            <div className="mb-2 text-[15px] font-semibold text-red-800">
              Disconnect {count} configuration{count === 1 ? "" : "s"}?
            </div>
            <div className="mb-4 text-[12px] text-[#6B7280]">
              This will permanently remove credentials for {count} selected gateway card
              {count === 1 ? "" : "s"}. In-flight auth challenges may be interrupted.
              This action cannot be undone.
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDisconnect(false)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDisconnectConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? "Disconnecting..." : `Disconnect ${count} card${count === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BulkGatewayActionsToolbar;

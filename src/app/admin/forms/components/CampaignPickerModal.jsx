"use client";

import { useEffect, useMemo, useState } from "react";

export default function CampaignPickerModal({ open, campaigns = [], loading, onClose, onSelect }) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const rows = Array.isArray(campaigns) ? campaigns : [];

  useEffect(() => {
    if (!open) return;
    setQ("");
    setSelectedId("");
  }, [open]);

  const filtered = useMemo(() => {
    const needle = String(q || "").trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((c) => String(c?.name || c?.slug || "").toLowerCase().includes(needle));
  }, [rows, q]);

  const selectedCampaign = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((c) => String(c?.id || c?._id) === String(selectedId)) || null;
  }, [rows, selectedId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/40" aria-label="Close" />

      <div className="hc-animate-dropdown relative w-full max-w-[560px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Select Campaign</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">Choose a campaign container to create a form under.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="mt-4 max-h-[360px] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB]">
          {loading ? (
            <div className="space-y-2 p-4">
              <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
              <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
              <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#6B7280]">No campaigns found</div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {filtered.map((c) => {
                const id = c?.id || c?._id;
                const isSelected = String(id) === String(selectedId);
                return (
                  <button
                    key={id || c?.slug || c?.name}
                    type="button"
                    onClick={() => setSelectedId(String(id))}
                    className={[
                      "flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-3 text-left transition",
                      isSelected ? "bg-red-600/5" : "hover:bg-[#F9FAFB]",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#111827]">{c?.name || "—"}</div>
                      <div className="mt-1 truncate text-[12px] text-[#6B7280]">{c?.slug ? `/${c.slug}` : id}</div>
                    </div>
                    <span className="mt-0.5 rounded-xl border border-red-600/20 bg-red-600/10 px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 text-[13px] text-[#6B7280]">
            {selectedCampaign ? (
              <span className="text-[#111827]">
                Selected: <span className="font-semibold">{selectedCampaign?.name}</span>
              </span>
            ) : (
              "Select a campaign to continue"
            )}
          </div>

          <button
            type="button"
            disabled={!selectedId}
            onClick={() => onSelect?.(String(selectedId))}
            className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

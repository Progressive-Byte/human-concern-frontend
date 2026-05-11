"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminDonorCauses } from "@/services/admin";
import { formatCurrency } from "@/utils/helpers";

function unwrapArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function unwrapSummary(res) {
  return res?.summary || res?.data?.summary || res?.data?.data?.summary || null;
}

export default function DonorCausesModal({ open, donorKey, onClose }) {
  const key = useMemo(() => String(donorKey || "").trim(), [donorKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setRows([]);
    setSummary(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!key) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminDonorCauses(key);
        if (!alive) return;
        setRows(unwrapArray(res));
        setSummary(unwrapSummary(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load causes.");
        setRows([]);
        setSummary(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [open, key]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative w-full max-w-[920px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Donation by Cause</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">{key || "—"}</div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {summary ? (
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3">
                <div className="text-[12px] text-[#6B7280]">Total Causes</div>
                <div className="mt-1 text-[18px] font-semibold text-[#111827]">{Number(summary?.totalCauses || 0)}</div>
              </div>
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3">
                <div className="text-[12px] text-[#6B7280]">Total Donated</div>
                <div className="mt-1 text-[18px] font-semibold text-[#111827]">{formatCurrency(Number(summary?.totalDonated || 0))}</div>
              </div>
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-3">
                <div className="text-[12px] text-[#6B7280]">Total Donations</div>
                <div className="mt-1 text-[18px] font-semibold text-[#111827]">{Number(summary?.totalDonations || 0)}</div>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-dashed border-[#E5E7EB]">
            <table className="w-full min-w-[860px] border-collapse text-[13px] text-[#111827]">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Cause</th>
                  <th className="py-3 pr-4">Total Donated</th>
                  <th className="py-3 pr-4">Donations</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-sm text-[#6B7280]">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-sm text-[#6B7280]">
                      No causes.
                    </td>
                  </tr>
                ) : (
                  rows.map((c, idx) => {
                    const causeName = String(c?.causeName || "—");
                    const total = Number(c?.totalDonated || 0);
                    const count = Number(c?.donationCount || 0);
                    return (
                      <tr key={`${causeName}-${idx}`} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-200">
                        <td className="px-5 py-4">{causeName}</td>
                        <td className="py-4 pr-4 font-semibold">{formatCurrency(total)}</td>
                        <td className="py-4 pr-4 text-[#6B7280]">{count}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


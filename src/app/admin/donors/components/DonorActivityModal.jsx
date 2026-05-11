"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminDonorActivity } from "@/services/admin";
import { formatCurrency } from "@/utils/helpers";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function unwrapArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function normalizePagination(p) {
  if (!p || typeof p !== "object") return null;
  const page = Number(p?.page ?? p?.currentPage ?? 1);
  const limit = Number(p?.limit ?? p?.pageSize ?? 20);
  const total = Number(p?.total ?? p?.totalItems ?? 0);
  const totalPages = Number(p?.totalPages ?? p?.pages ?? (Number.isFinite(limit) && limit > 0 ? Math.ceil(total / limit) : 1));
  return {
    ...p,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  };
}

function unwrapPagination(res) {
  const raw =
    res?.pagination ||
    res?.data?.pagination ||
    res?.data?.data?.pagination ||
    res?.meta?.pagination ||
    res?.data?.meta?.pagination ||
    null;
  return normalizePagination(raw);
}

export default function DonorActivityModal({ open, donorKey, onClose }) {
  const key = useMemo(() => String(donorKey || "").trim(), [donorKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setRows([]);
    setPagination(null);
    setPage(1);
    setLimit(20);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!key) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminDonorActivity(key, { page: String(page), limit: String(limit) });
        if (!alive) return;
        setRows(unwrapArray(res));
        setPagination(unwrapPagination(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load activity.");
        setRows([]);
        setPagination(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [open, key, page, limit]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const totalPages = Number(pagination?.totalPages || 1);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <button type="button" aria-label="Close modal overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="hc-animate-dropdown relative w-full max-w-[920px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">All Activity</div>
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

          <div className="flex items-center justify-between gap-3">
            <select
              value={String(limit)}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value || 20));
              }}
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>

            <div className="text-[12px] text-[#6B7280]">
              Page <span className="font-semibold text-[#111827]">{page}</span> of{" "}
              <span className="font-semibold text-[#111827]">{totalPages}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-xl bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="rounded-xl bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">No activity.</div>
            ) : (
              rows.map((ev, idx) => {
                const desc = String(ev?.summary || ev?.description || "Activity");
                const ts = ev?.at || ev?.timestamp || null;
                const meta = ev?.meta && typeof ev.meta === "object" ? ev.meta : null;
                const formName = typeof meta?.formName === "string" ? meta.formName : "";
                const amt = meta?.amount ?? ev?.amount;
                const currency = String(meta?.currency || ev?.currency || "USD");
                const showAmount = typeof amt === "number" && Number.isFinite(amt);
                return (
                  <div key={`${idx}-${desc}`} className="flex items-start gap-3">
                    <div className="mt-1.5 flex h-3 w-3 items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl bg-[#F9FAFB] px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0 truncate text-[13px] font-semibold text-[#111827]">{desc}</div>
                        <div className="shrink-0 text-[12px] text-[#6B7280]">{formatDateTime(ts)}</div>
                      </div>
                      {formName ? <div className="mt-1 text-[12px] text-[#6B7280]">{formName}</div> : null}
                      {showAmount ? <div className="mt-1 text-[12px] font-semibold text-[#111827]">{formatCurrency(amt, currency)}</div> : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

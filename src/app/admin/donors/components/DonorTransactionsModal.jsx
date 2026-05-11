"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminDonorDonations } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
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

function unwrapSummary(res) {
  return res?.summary || res?.data?.summary || res?.data?.data?.summary || null;
}

export default function DonorTransactionsModal({ open, donorKey, onClose }) {
  const toast = useToast();
  const key = useMemo(() => String(donorKey || "").trim(), [donorKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("");

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setRows([]);
    setPagination(null);
    setSummary(null);
    setPage(1);
    setLimit(20);
    setStatus("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!key) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminDonorDonations(key, {
          page: String(page),
          limit: String(limit),
          sort: "createdAt",
          order: "desc",
          status: status || undefined,
        });
        if (!alive) return;
        setRows(unwrapArray(res));
        setPagination(unwrapPagination(res));
        setSummary(unwrapSummary(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load transactions.");
        setRows([]);
        setPagination(null);
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
  }, [open, key, page, limit, status]);

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
            <div className="text-[16px] font-semibold text-[#111827]">All Transactions</div>
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

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

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
            </div>

            {summary ? (
              <div className="text-[12px] text-[#6B7280]">
                Total: <span className="font-semibold text-[#111827]">{formatCurrency(Number(summary?.totalAmount || 0))}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-dashed border-[#E5E7EB]">
            <table className="w-full min-w-[860px] border-collapse text-[13px] text-[#111827]">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Cause</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-5 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-[#6B7280]">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-[#6B7280]">
                      No transactions.
                    </td>
                  </tr>
                ) : (
                  rows.map((d) => {
                    const id = String(d?.id || "");
                    const causes = Array.isArray(d?.causes) ? d.causes : [];
                    const causeName =
                      typeof d?.cause?.name === "string" && d.cause.name.trim()
                        ? d.cause.name.trim()
                        : causes.length === 1 && typeof causes[0]?.name === "string"
                          ? causes[0].name
                          : causes.length > 1 && typeof causes[0]?.name === "string"
                            ? `${causes[0].name} +${causes.length - 1}`
                            : "—";
                    const amount = Number(d?.amount || 0);
                    const st = String(d?.status || "—");
                    const createdAt = d?.createdAt || null;
                    return (
                      <tr key={id || `${causeName}-${createdAt}`} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-200">
                        <td className="px-5 py-4">{causeName}</td>
                        <td className="py-4 pr-4 font-semibold">{formatCurrency(amount)}</td>
                        <td className="py-4 pr-4">{st}</td>
                        <td className="py-4 pr-5 text-right text-[#6B7280]">{formatDateTime(createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[12px] text-[#6B7280]">
              Page <span className="font-semibold text-[#111827]">{page}</span> of{" "}
              <span className="font-semibold text-[#111827]">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="mt-3 text-[12px] text-[#6B7280]">
            Tip: status filter map to API `status` query param. Export not in API doc; keep off.
          </div>
        </div>
      </div>
    </div>
  );
}

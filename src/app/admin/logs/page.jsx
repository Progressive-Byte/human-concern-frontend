"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminAuditLogs } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import AdminAvatarMenu from "@/app/admin/components/AdminAvatarMenu";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AlertIcon } from "@/components/common/SvgIcon";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function parseItems(res) {
  const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
  return Array.isArray(items) ? items : [];
}

function parsePagination(res) {
  const p = res?.meta?.pagination || res?.data?.meta?.pagination || res?.pagination || null;
  if (!p || typeof p !== "object") return null;
  const page = Number(p?.page ?? 1);
  const limit = Number(p?.limit ?? 20);
  const total = Number(p?.total ?? 0);
  const totalPages = Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  return {
    ...p,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages,
  };
}

function toIsoFromDateInput(value, kind) {
  const s = String(value || "").trim();
  if (!s) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  if (kind === "to") return new Date(`${s}T23:59:59.999Z`).toISOString();
  return new Date(`${s}T00:00:00.000Z`).toISOString();
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function LogsHeader() {
  const { admin } = useAdminAuth();
  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Logs</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Audit log entries for admin actions and requests</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Go to main site"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <HomeIcon />
        </Link>
        <AdminAvatarMenu admin={admin} />
      </div>
    </div>
  );
}

function PaginationBar({ pagination, onPrev, onNext }) {
  const page = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const total = Number(pagination?.total || 0);
  const limit = Number(pagination?.limit || 20);
  const shown = Math.min(total || 0, page * limit);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#F3F4F6] px-5 py-4">
      <div className="text-[13px] text-[#6B7280]">{`Showing ${shown} of ${total} logs`}</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminLogsPage() {
  const toast = useToast();

  const [filters, setFilters] = useState({
    page: "1",
    limit: "20",
    sort: "-createdAt",
    q: "",
    actionPrefix: "",
    actorEmail: "",
    fromDate: "",
    toDate: "",
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminAuditLogs({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          q: debouncedQ,
          actionPrefix: filters.actionPrefix,
          actorEmail: filters.actorEmail,
          from: toIsoFromDateInput(filters.fromDate, "from"),
          to: toIsoFromDateInput(filters.toDate, "to"),
        });
        if (!alive) return;
        setItems(parseItems(res));
        setPagination(parsePagination(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load logs.");
        setItems([]);
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
  }, [filters.page, filters.limit, filters.sort, filters.actionPrefix, filters.actorEmail, debouncedQ, filters.fromDate, filters.toDate]);

  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <LogsHeader />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Search</div>
            <input
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", q: e.target.value }))}
              placeholder="Search action, actor email, target, request id, ip..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Action Prefix</div>
            <input
              value={filters.actionPrefix}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", actionPrefix: e.target.value }))}
              placeholder='e.g. "campaigns."'
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Actor Email</div>
            <input
              value={filters.actorEmail}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", actorEmail: e.target.value }))}
              placeholder="e.g. admin@site.com"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">From</div>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", fromDate: e.target.value }))}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">To</div>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", toDate: e.target.value }))}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Sort</div>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", sort: e.target.value }))}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Limit</div>
            <select
              value={filters.limit}
              onChange={(e) => setFilters((p) => ({ ...p, page: "1", limit: e.target.value }))}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setFilters({ page: "1", limit: "20", sort: "-createdAt", q: "", actionPrefix: "", actorEmail: "", fromDate: "", toDate: "" });
                toast.success("Filters cleared");
              }}
              className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        <div className="px-5 py-4">
          <h2 className="text-[18px] font-semibold text-[#111827]">Audit Logs</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Track admin actions, targets, and request metadata.</p>
        </div>
        <div className="border-t border-[#F3F4F6]" />

        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-245 border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Time</th>
                  <th className="py-3 pr-4">Action</th>
                  <th className="py-3 pr-4">Actor</th>
                  <th className="py-3 pr-4">Target</th>
                  <th className="py-3 pr-5">IP</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {rows.map((it, idx) => {
                  const createdAt = it?.createdAt || it?.at || it?.timestamp;
                  const action = String(it?.action || "").trim() || "—";
                  const actorEmail = String(it?.actorEmail || it?.actor?.email || "").trim() || "—";
                  const targetType = String(it?.targetType || it?.target?.type || "").trim();
                  const targetId = String(it?.targetId || it?.target?.id || "").trim();
                  const target = targetType || targetId ? `${targetType || "—"}${targetId ? `:${targetId}` : ""}` : "—";
                  const ip = String(it?.ip || "").trim() || "—";

                  return (
                    <tr key={it?._id || it?.id || `${requestId}-${idx}`} className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]">
                      <td className="px-5 py-4 align-top text-[#6B7280]">{formatDateTime(createdAt)}</td>
                      <td className="py-4 pr-4 align-top">
                        <span className="inline-flex rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-medium text-[#111827]">{action}</span>
                      </td>
                      <td className="py-4 pr-4 align-top">{actorEmail}</td>
                      <td className="py-4 pr-4 align-top text-[#6B7280]">
                        <div className="max-w-70 truncate">{target}</div>
                      </td>

                      <td className="py-4 pr-5 align-top text-[#6B7280]">{ip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination ? (
          <PaginationBar
            pagination={pagination}
            onPrev={() => setFilters((p) => ({ ...p, page: String(Math.max(1, Number(pagination?.page || 1) - 1)) }))}
            onNext={() => setFilters((p) => ({ ...p, page: String(Number(pagination?.page || 1) + 1) }))}
          />
        ) : null}
      </section>
    </main>
  );
}


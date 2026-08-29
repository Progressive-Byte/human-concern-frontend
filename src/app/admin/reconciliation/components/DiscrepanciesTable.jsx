"use client";

import { useState } from "react";
import Link from "next/link";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";
import DonationStatusPill from "@/app/admin/donations/components/DonationStatusPill";
import { formatCurrency } from "@/utils/helpers";
import { DISCREPANCY_CATEGORIES } from "@/utils/errorMaps";
import DiscrepanciesPagination from "./DiscrepanciesPagination";
import DiscrepancyRowActions from "./DiscrepancyRowActions";
import ThreeDSComplianceAuditDetail from "./ThreeDSComplianceAuditDetail";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

function shortRef(ref) {
  const v = String(ref || "");
  if (!v) return "—";
  if (v.length <= 10) return v;
  return v.slice(0, 4) + "…" + v.slice(-6);
}

function ResPill({ resolution }) {
  const r = String(resolution || "").toLowerCase();
  if (!r) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
        Open
      </span>
    );
  }
  if (r.includes("verified") || r === "mark_as_verified") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        Verified
      </span>
    );
  }
  if (r.includes("refund") || r === "initiate_refund") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-700">
        Refunded
      </span>
    );
  }
  if (r.includes("retry") || r.includes("webhook") || r === "retry_webhook") {
    return (
      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
        Retried
      </span>
    );
  }
  if (r === "resolved") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
        Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
      {r}
    </span>
  );
}

function CaretIcon({ expanded }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
      fill="none"
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatJson(value) {
  try {
    if (value === undefined || value === null) return "null";
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function AmountCell({ providerAmount, localAmount, currency }) {
  const p = Number(providerAmount || 0);
  const l = Number(localAmount || 0);
  const diff = p - l;
  const hasDiff = Math.abs(diff) > 0.0001;
  return (
    <div className="min-w-[130px] space-y-0.5">
      <div className="text-right">
        <span className="text-[12px] text-[#6B7280] mr-1">P:</span>
        <span className={`text-[13px] font-semibold ${hasDiff ? "text-[#B91C1C]" : "text-[#111827]"}`}>
          {formatCurrency(p, currency)}
        </span>
      </div>
      <div className="text-right">
        <span className="text-[12px] text-[#6B7280] mr-1">L:</span>
        <span className={`text-[13px] font-semibold ${hasDiff ? "text-[#B91C1C]" : "text-[#111827]"}`}>
          {formatCurrency(l, currency)}
        </span>
      </div>
    </div>
  );
}

function StatusBadgePair({ providerStatus, localStatus }) {
  const p = String(providerStatus || "—");
  const l = String(localStatus || "—");
  const mismatch = p && l && p.toLowerCase() !== l.toLowerCase();
  return (
    <div className="min-w-[130px] space-y-1">
      <div className="flex items-center justify-end gap-1">
        <span className="text-[11px] text-[#6B7280]">P</span>
        <DonationStatusPill status={providerStatus} />
      </div>
      <div className="flex items-center justify-end gap-1">
        <span className="text-[11px] text-[#6B7280]">L</span>
        <DonationStatusPill status={localStatus} />
      </div>
      {mismatch ? (
        <div className="text-right text-[10px] font-semibold uppercase tracking-wider text-[#B91C1C]">
          Status differs
        </div>
      ) : null}
    </div>
  );
}

function ExpandableJsonPanels({ rawProviderSnapshot, rawLocalSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Provider raw snapshot
          </div>
        </div>
        <pre className="max-h-[360px] overflow-auto rounded-xl border border-dashed border-[#E5E7EB] bg-[#0B1020] px-3 py-2 text-[11px] leading-relaxed font-mono text-[#D1D5DB]">
          {formatJson(rawProviderSnapshot)}
        </pre>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Local raw snapshot
          </div>
        </div>
        <pre className="max-h-[360px] overflow-auto rounded-xl border border-dashed border-[#E5E7EB] bg-[#0B1020] px-3 py-2 text-[11px] leading-relaxed font-mono text-[#D1D5DB]">
          {formatJson(rawLocalSnapshot)}
        </pre>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-6 w-56 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-9 w-24 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="p-5 space-y-3">
        <div className="h-16 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-16 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-16 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

const DiscrepanciesTable = ({
  reportId,
  reportCurrency = "USD",
  items = [],
  loading = false,
  pagination = null,
  onPrevPage,
  onNextPage,
  showingLabel,
  onOpenResolve,
  onRefresh,
}) => {
  const [expanded, setExpanded] = useState(() => new Set());

  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = Number(pagination?.total || rows.length || 0);
  const currency = reportCurrency || "USD";

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Discrepancies ({total})</div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1600px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="w-8 px-3 py-3"></th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Reason</th>
              <th className="py-3 pr-4">Resolution</th>
              <th className="py-3 pr-4">Provider Ref</th>
              <th className="py-3 pr-4">Local Ref</th>
              <th className="py-3 pr-4 text-right">Amounts</th>
              <th className="py-3 pr-4 text-right">Status</th>
              <th className="py-3 pr-4">Provider TS</th>
              <th className="py-3 pr-4">Local TS</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No discrepancies match the current filter.
                </td>
              </tr>
            ) : (
              rows.flatMap((d, idx) => {
                const id = String(d?.id || d?.discrepancyId || `row-${idx}`);
                const category = String(d?.category || DISCREPANCY_CATEGORIES.OTHER);
                const reason = String(d?.reason || d?.message || d?.description || "—");
                const resolution = d?.resolution || d?.resolutionStatus || d?.status;
                const providerRef = String(d?.providerRef || d?.providerTransactionId || d?.providerId || "");
                const localRef = String(d?.localRef || d?.localTransactionId || d?.donationId || d?.localId || "");
                const providerUrl = String(d?.providerUrl || "");
                const localUrl = String(d?.localUrl || `/admin/donations`);
                const providerAmount = Number(d?.providerAmount ?? d?.provider?.amount ?? 0);
                const localAmount = Number(d?.localAmount ?? d?.local?.amount ?? 0);
                const providerStatus = String(d?.providerStatus ?? d?.provider?.status ?? "");
                const localStatus = String(d?.localStatus ?? d?.local?.status ?? "");
                const providerTs = d?.providerTimestamp ?? d?.provider?.createdAt ?? d?.providerAt ?? null;
                const localTs = d?.localTimestamp ?? d?.local?.createdAt ?? d?.localAt ?? null;
                const rawProvider = d?.rawProviderSnapshot ?? d?.provider?.raw ?? d?.providerSnapshot ?? null;
                const rawLocal = d?.rawLocalSnapshot ?? d?.local?.raw ?? d?.localSnapshot ?? null;
                const isThreeDs = category.toUpperCase().replace(/[^A-Z0-9]/g, "_") === DISCREPANCY_CATEGORIES.THREE_DS_AUDIT_MISMATCH;
                const isOpen = !resolution || String(resolution).toLowerCase() === "open" || String(resolution).toLowerCase() === "unresolved";
                const expandedNow = expanded.has(id);

                const headerRow = (
                  <tr
                    key={`${id}-head`}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-3 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
                        aria-label={expandedNow ? "Collapse snapshots" : "Expand snapshots"}
                      >
                        <CaretIcon expanded={expandedNow} />
                      </button>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <OrchestrationStatusBadge type="category" value={category} />
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="max-w-[340px] text-[13px] text-[#111827] truncate" title={reason}>
                        {reason}
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <ResPill resolution={resolution} />
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <code className="rounded-lg bg-[#F3F4F6] px-2 py-1 font-mono text-[11px] text-[#111827]" title={providerRef}>
                          {shortRef(providerRef)}
                        </code>
                        {providerUrl ? (
                          <a
                            href={providerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
                            title="Open in provider dashboard"
                          >
                            <ExternalIcon />
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={localUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F4F6] px-2 py-1 font-mono text-[11px] text-[#111827] transition hover:bg-[#E5E7EB]"
                          title={localRef}
                        >
                          {shortRef(localRef)}
                          <ExternalIcon />
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top text-right">
                      <AmountCell providerAmount={providerAmount} localAmount={localAmount} currency={currency} />
                    </td>
                    <td className="py-4 pr-4 align-top text-right">
                      <StatusBadgePair providerStatus={providerStatus} localStatus={localStatus} />
                    </td>
                    <td className="py-4 pr-4 align-top text-[12px] text-[#6B7280]">
                      {formatDateTime(providerTs)}
                    </td>
                    <td className="py-4 pr-4 align-top text-[12px] text-[#6B7280]">
                      {formatDateTime(localTs)}
                    </td>
                    <td className="py-4 pr-5 text-right align-top">
                      <DiscrepancyRowActions
                        reportId={reportId}
                        discrepancyId={id}
                        discrepancy={d}
                        disabled={!isOpen}
                        onOpenResolve={() => onOpenResolve?.(id, d)}
                      />
                    </td>
                  </tr>
                );

                if (!expandedNow) return [headerRow];

                const expandRow = (
                  <tr key={`${id}-expand`} className="border-t border-[#F3F4F6]/80 bg-[#FAFAFA]">
                    <td colSpan={11} className="px-5 py-4">
                      {isThreeDs ? (
                        <div className="space-y-3">
                          <ThreeDSComplianceAuditDetail
                            discrepancy={d}
                            rawProviderSnapshot={rawProvider}
                            rawLocalSnapshot={rawLocal}
                          />
                          <ExpandableJsonPanels rawProviderSnapshot={rawProvider} rawLocalSnapshot={rawLocal} />
                        </div>
                      ) : (
                        <ExpandableJsonPanels rawProviderSnapshot={rawProvider} rawLocalSnapshot={rawLocal} />
                      )}
                    </td>
                  </tr>
                );

                return [headerRow, expandRow];
              })
            )}
          </tbody>
        </table>
      </div>

      <DiscrepanciesPagination
        pagination={pagination}
        onPrev={onPrevPage}
        onNext={onNextPage}
        showingLabel={showingLabel}
      />
    </section>
  );
};

export default DiscrepanciesTable;

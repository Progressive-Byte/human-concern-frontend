"use client";

import Link from "next/link";
import { OrchestrationStatusBadge } from "@/components/common/OrchestrationStatusBadge";
import { formatCurrency } from "@/utils/helpers";
import ReconciliationPagination from "./ReconciliationPagination";
import ReconciliationRowActions from "./ReconciliationRowActions";

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

function formatDuration(msOrSec) {
  if (msOrSec === undefined || msOrSec === null || msOrSec === "") return "—";
  let total = Number(msOrSec);
  if (!Number.isFinite(total) || total < 0) return "—";
  if (total > 86400 * 1000) total = total / 1000;
  if (total < 1 && msOrSec < 1000) total = msOrSec * 1000;

  const totalSeconds = Math.max(0, Math.floor(total));
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function ProviderIconBadge({ provider }) {
  const p = String(provider || "").toLowerCase();
  let label = p ? p.charAt(0).toUpperCase() + p.slice(1) : "—";
  let bgClass = "bg-[#F3F4F6] text-[#111827]";

  if (p === "stripe") {
    label = "S";
    bgClass = "bg-[#635BFF]/10 text-[#635BFF]";
  } else if (p === "paypal") {
    label = "PP";
    bgClass = "bg-[#0070BA]/10 text-[#0070BA]";
  } else if (p === "braintree") {
    label = "BT";
    bgClass = "bg-[#4F3085]/10 text-[#4F3085]";
  } else if (p === "adyen") {
    label = "A";
    bgClass = "bg-[#0AB1E0]/10 text-[#0AB1E0]";
  } else if (p === "checkout") {
    label = "C";
    bgClass = "bg-[#7B61FF]/10 text-[#7B61FF]";
  }

  return (
    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${bgClass}`} title={provider}>
      {label}
    </span>
  );
}

function StatSide({ total, count, currency, label }) {
  const amount = Number(total || 0);
  const n = Number(count || 0);
  return (
    <div className="min-w-[120px]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-[#111827]">
        {formatCurrency(amount, currency)}
      </div>
      <div className="text-[12px] text-[#6B7280]">{n} txns</div>
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
      <div className="p-5">
        <div className="h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-3 h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-3 h-12 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

const ReconciliationTable = ({
  items = [],
  loading = false,
  pagination = null,
  onPrevPage,
  onNextPage,
  showingLabel,
  onRerun,
  onDownload,
}) => {
  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = Number(pagination?.total || rows.length || 0);

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">All Reports ({total})</div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Date Run</th>
              <th className="py-3 pr-4">Provider</th>
              <th className="py-3 pr-4">Config ID</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Provider Side</th>
              <th className="py-3 pr-4">Local Side</th>
              <th className="py-3 pr-4">Matched</th>
              <th className="py-3 pr-4">Mismatches</th>
              <th className="py-3 pr-4">Duration</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No reconciliation reports found.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const id = String(r?.id || r?.reportId || "");
                const startedAt = r?.startedAt || r?.createdAt || null;
                const provider = String(r?.provider || "");
                const configId = String(r?.gatewayConfigurationId || r?.configId || "default");
                const status = String(r?.status || "");
                const currency = String(r?.currency || r?.providerCurrency || "USD");
                const providerTotal = r?.provider?.total ?? r?.providerTotal ?? 0;
                const providerCount = r?.provider?.count ?? r?.providerCount ?? 0;
                const localTotal = r?.local?.total ?? r?.localTotal ?? 0;
                const localCount = r?.local?.count ?? r?.localCount ?? 0;
                const matchedCount = Number(r?.matchedCount ?? r?.matched ?? 0);
                const mismatchesTotal = Number(
                  r?.mismatchesTotal ??
                  r?.mismatchCount ??
                  r?.discrepanciesTotal ??
                  (r?.stats ? Number(r.stats.mismatchesTotal) : 0)
                );
                const duration = r?.durationMs ?? r?.duration ?? r?.durationSec ?? null;

                return (
                  <tr
                    key={id || `${idx}-${provider}-${startedAt || ""}`}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-semibold text-[#111827]">{formatDateTime(startedAt)}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2.5">
                        <ProviderIconBadge provider={provider} />
                        <span className="text-[13px] font-semibold text-[#111827] capitalize">
                          {provider || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <code className="rounded-lg bg-[#F3F4F6] px-2 py-1 text-[12px] font-mono text-[#111827]">
                        {configId}
                      </code>
                    </td>
                    <td className="py-4 pr-4">
                      <OrchestrationStatusBadge type="recon" value={status} />
                    </td>
                    <td className="py-4 pr-4">
                      <StatSide total={providerTotal} count={providerCount} currency={currency} label="Provider" />
                    </td>
                    <td className="py-4 pr-4">
                      <StatSide total={localTotal} count={localCount} currency={currency} label="Local" />
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        {matchedCount} matched
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {mismatchesTotal > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                          {mismatchesTotal} issues
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                          0
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-mono text-[12px] text-[#6B7280]">
                        {formatDuration(duration)}
                      </span>
                    </td>
                    <td className="py-4 pr-5 text-right">
                      <ReconciliationRowActions
                        reportId={id}
                        report={r}
                        onRerun={() => onRerun?.(r)}
                        onDownload={() => onDownload?.(r)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ReconciliationPagination
        pagination={pagination}
        onPrev={onPrevPage}
        onNext={onNextPage}
        showingLabel={showingLabel}
      />
    </section>
  );
};

export default ReconciliationTable;

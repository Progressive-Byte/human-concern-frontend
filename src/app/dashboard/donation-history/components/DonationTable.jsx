"use client";

import { useState } from "react";
import { DownloadIcon } from "@/components/common/SvgIcon";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { AddOnList } from "@/components/common/AddOnList";
import { formatCurrency } from "@/utils/helpers";
import { downloadReceipt } from "@/services/donationService";

function statusClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "succeeded") return "text-[#047857]";
  if (s === "pending") return "text-[#B45309]";
  if (s === "failed") return "text-[#EA3335]";
  if (s === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}

// The dot has to follow the status — it used to be green for every row.
function statusDotClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "pending") return "bg-[#B45309]";
  if (s === "failed") return "bg-[#EA3335]";
  if (s === "refunded") return "bg-[#6B7280]";
  return "bg-[#047857]";
}

const HEADERS = [
  { label: "Date",         className: "px-4 py-4 font-medium" },
  { label: "Campaign",     className: "px-4 py-4 font-medium" },
  { label: "Causes",       className: "hidden sm:table-cell px-4 py-4 font-medium" },
  { label: "Base Amount",  className: "px-4 py-4 font-medium" },
  { label: "Tip",          className: "hidden sm:table-cell px-4 py-4 font-medium" },
  { label: "Total Amount", className: "px-4 py-4 font-medium" },
  { label: "Status",       className: "hidden md:table-cell px-4 py-4 font-medium" },
  { label: "Actions",      className: "px-4 py-4 font-medium text-right" },
];

function StatusBadge({ statusKey, status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(statusKey)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(statusKey)}`} />
      {status}
    </span>
  );
}

/** One-time / Recurring, driven by the API's `type.label`. */
function TypePill({ typeKey, label }) {
  if (!label) return null;
  const recurring = String(typeKey || "").toLowerCase() === "recurring";
  return (
    <span
      className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        recurring ? "bg-[#FFF5F5] text-[#EA3335]" : "bg-[#F3F4F6] text-[#6B7280]"
      }`}
    >
      {label}
    </span>
  );
}

/**
 * A donation can carry several causes, so they render as chips the same way add-ons do
 * rather than as a single badge.
 */
function CauseList({ causes, className = "", max = 2 }) {
  const list = (Array.isArray(causes) ? causes : []).filter((c) => c && String(c.name || "").trim());
  if (!list.length) return <span className="text-[#9CA3AF]">—</span>;

  const shown = max > 0 ? list.slice(0, max) : list;
  const hiddenCount = list.length - shown.length;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`.trim()}>
      {shown.map((c, idx) => (
        <span
          key={String(c.id || "") || `cause-${idx}`}
          className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]"
        >
          <span className="max-w-[160px] truncate">{c.name}</span>
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]">
          +{hiddenCount} more
        </span>
      ) : null}
    </div>
  );
}

function DonationRow({ r, isLast, onError }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadReceipt({ donationId: r.id });
    } catch (e) {
      onError?.(e?.message || "Could not download receipt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className={`hover:bg-[#F9FAFB] transition-colors ${!isLast ? "border-b border-[#E5E7EB]" : ""}`}>
      <td className="px-4 py-4 whitespace-nowrap align-top">
        <p className="text-[#111827] font-medium text-sm">{r.date}</p>
        <span className={`sm:hidden mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${causeBadgeStyles[r.cause] || "bg-[#F3F4F6] text-[#6B7280]"}`}>
          {r.cause}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="text-[#111827] text-sm leading-snug">{r.campaign}</p>
          {r.typeKey ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                r.typeKey === "recurring" ? "bg-[#FFF5F5] text-[#EA3335]" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}
            >
              {r.typeLabel}
            </span>
          ) : null}
        </div>
        <AddOnList addons={r.addons} currency={r.currency} className="mt-1.5" max={2} />
        <span className="md:hidden mt-1 block">
          <StatusBadge statusKey={r.statusKey} status={r.status} />
        </span>
      </td>

      <td className="px-4 py-4 align-top">
        <div className="flex items-start">
          <p className="text-[#111827] text-sm leading-snug">{r.campaign}</p>
          <TypePill typeKey={r.typeKey} label={r.type} />
        </div>
        <AddOnList addons={r.addons} currency={r.currency} className="mt-1.5" max={2} />
        <div className="sm:hidden mt-1.5">
          <CauseList causes={r.causes} />
        </div>
      </td>

      <td className="hidden sm:table-cell px-4 py-4 align-top">
        <CauseList causes={r.causes} />
      </td>

      <td className="px-4 py-4 text-[#111827] whitespace-nowrap align-top">
        {formatCurrency(r.base, r.currency)}
        {r.tip > 0 ? (
          <span className="sm:hidden mt-1 block text-[11px] text-[#6B7280]">
            Tip {formatCurrency(r.tip, r.currency)}
          </span>
        ) : null}
      </td>

      <td className="hidden sm:table-cell px-4 py-4 text-[#111827] whitespace-nowrap align-top">
        {r.tip > 0 ? formatCurrency(r.tip, r.currency) : "—"}
      </td>

      <td className="px-4 py-4 text-[#111827] font-semibold whitespace-nowrap align-top">
        {formatCurrency(r.total, r.currency)}
      </td>

      <td className="hidden md:table-cell px-4 py-4 align-top">
        <StatusBadge statusKey={r.statusKey} status={r.status} />
      </td>

      <td className="px-4 py-4 text-right align-top">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          title="Download receipt"
          aria-label="Download receipt"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {busy ? <span className="animate-pulse">{DownloadIcon}</span> : DownloadIcon}
        </button>
      </td>
    </tr>
  );
}

export function DonationTable({ loading, rows, onError }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[#6B7280] border-b border-dashed border-[#E5E7EB]">
              {HEADERS.map((h) => (
                <th key={h.label} className={h.className}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows rows={5} cols={8} />
            ) : rows.length ? (
              rows.map((r, idx) => (
                <DonationRow key={r.id} r={r} isLast={idx === rows.length - 1} onError={onError} />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#6B7280]">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

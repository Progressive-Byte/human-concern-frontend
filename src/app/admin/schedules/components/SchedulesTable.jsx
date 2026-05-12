"use client";

import { useRouter } from "next/navigation";
import ScheduleRowActions from "./ScheduleRowActions";
import ScheduleStatusPill from "./ScheduleStatusPill";
import SchedulesPagination from "./SchedulesPagination";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-6 w-52 animate-pulse rounded bg-[#F3F4F6]" />
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

export default function SchedulesTable({ items = [], loading = false, pagination = null, currency = "USD", formatAmount, onPrevPage, onNextPage }) {
  const router = useRouter();
  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = Number(pagination?.total || rows.length || 0);
  const amt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">All Schedules ({total})</div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Donor</th>
              <th className="py-3 pr-4">Campaign</th>
              <th className="py-3 pr-4">Cause</th>
              <th className="py-3 pr-4">Frequency</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4">Next Date</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No schedules found.
                </td>
              </tr>
            ) : (
              rows.map((d, idx) => {
                const id = String(d?.donationId || "");
                const donorLabel = String(d?.donor?.label || "—");
                const donorEmail = String(d?.donor?.email || "");
                const formName = String(d?.formName || "—");
                const cause = String(d?.primaryCauseLabel || "—");
                const causeType = String(d?.causeType || "");
                const freq = String(d?.frequencyLabel || "—");
                const amount = Number(d?.installmentAmount || 0);
                const nextDate = d?.nextDueDate || null;
                const status = String(d?.scheduleStatus || "—");

                return (
                  <tr
                    key={id || `${idx}-${donorEmail}-${nextDate}`}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                    onDoubleClick={() => (id ? router.push(`/admin/schedules/${id}`) : null)}
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#111827]">{donorLabel}</div>
                        <div className="mt-1 truncate text-[12px] text-[#6B7280]">{donorEmail || "—"}</div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="truncate text-[#111827]">{formName}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
                        <span className="truncate">{cause}</span>
                        {causeType ? <span className="text-[#9CA3AF]">{causeType}</span> : null}
                      </span>
                    </td>
                    <td className="py-4 pr-4">{freq}</td>
                    <td className="py-4 pr-4 text-right font-semibold">{amt(amount, currency)}</td>
                    <td className="py-4 pr-4 text-[#6B7280]">{formatDate(nextDate)}</td>
                    <td className="py-4 pr-4">
                      <ScheduleStatusPill status={status} />
                    </td>
                    <td className="py-4 pr-5 text-right">
                      <ScheduleRowActions donationId={id} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <SchedulesPagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
    </section>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";
import DetailRow from "@/components/ui/DetailRow";
import { BacklinkIcon } from "@/components/common/SvgIcon";
import { getUserScheduleById } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

const frequencyLabel = { Weekly: "week", Monthly: "month", Daily: "day" };

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function formatShortDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function statusClass(statusKey) {
  const s = String(statusKey || "").toLowerCase();
  if (s === "succeeded") return "text-[#047857]";
  if (s === "pending") return "text-[#B45309]";
  if (s === "failed") return "text-[#EA3335]";
  if (s === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}

export default function ScheduleDetailPage() {
  const params = useParams();
  const scheduleId = String(params?.slug || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!scheduleId) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserScheduleById(scheduleId);
        if (!alive) return;
        const d = res?.data?.data || res?.data || null;
        setData(d);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load schedule.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [scheduleId]);

  const schedule = data?.schedule || {};
  const allocated = Array.isArray(data?.allocatedCauses?.items) ? data.allocatedCauses.items : [];
  const history = Array.isArray(data?.donationHistory?.items) ? data.donationHistory.items : [];

  const title = String(schedule?.title || "").trim() || "Schedule";
  const currency = String(schedule?.currency || "USD");
  const statusKey = String(schedule?.status?.key || "").trim().toLowerCase();
  const statusLabel = String(schedule?.status?.label || "").trim() || "—";
  const frequency = String(schedule?.frequencyLabel || "").trim() || "—";
  const perLabel = frequencyLabel[frequency] ?? String(frequency || "").toLowerCase();
  const installmentAmount = Number(schedule?.installmentAmount ?? 0);
  const startedAt = formatDate(schedule?.startedAt) || "—";
  const nextDate = formatDate(schedule?.nextDonation?.date) || "—";
  const nextShort = formatShortDate(schedule?.nextDonation?.date) || "—";
  const nextAmount = Number(schedule?.nextDonation?.amount ?? installmentAmount);
  const totalDonated = Number(schedule?.totalDonated ?? 0);

  return (
    <>
      <DashboardHeader title={title} subtitle={null} />

      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        {/* Back link */}
        <Link
          href="/dashboard/schedules"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EA3335] hover:text-red-700 transition-colors"
        >
          {BacklinkIcon}
          Back to Schedules
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 md:gap-5 items-start">
          {/* ── Left column ── */}
          <div className="min-w-0 space-y-4 md:space-y-5">

            {/* Schedule Details */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-5">Schedule Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <DetailRow label="Status" value={loading ? "Loading..." : statusLabel} />
                <DetailRow label="Frequency" value={loading ? "Loading..." : frequency} />
                <DetailRow
                  label="Donation Amount"
                  value={loading ? "—" : formatCurrency(installmentAmount, currency)}
                  valueClass="text-2xl font-bold text-[#EA3335]"
                />
                <DetailRow label="Next Donation" value={loading ? "—" : nextDate} />
                <DetailRow label="Total Donated" value={loading ? "—" : formatCurrency(totalDonated, currency)} />
                <DetailRow label="Created On" value={loading ? "—" : startedAt} />
              </div>
            </div>

            {/* Allocated Causes */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-4">Allocated Causes</h2>
              {loading ? (
                <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
              ) : allocated.length ? (
                <div className="space-y-2">
                  {allocated.map((c, idx) => {
                    const label = String(c?.label || "").trim() || "—";
                    const amount = Number(c?.amount ?? 0);
                    const cur = String(c?.currency || currency);
                    return (
                      <div
                        key={String(c?.causeId || idx)}
                        className="flex items-center justify-between rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] px-4 py-3"
                      >
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${causeBadgeStyles[label] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                          {label}
                        </span>
                        <span className="text-sm font-semibold text-[#EA3335]">
                          {formatCurrency(amount, cur)}&nbsp;/&nbsp;{perLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-[#6B7280]">No causes available.</div>
              )}
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-4">Donation History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-left border-b border-[#E5E7EB]">
                      {["Date", "Amount", "Cause", "Status", "Receipt"].map((h) => (
                        <th
                          key={h}
                          className="pb-3 px-2 first:pl-0 last:pr-0 text-[11px] font-semibold tracking-widest uppercase text-[#6B7280]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-[#6B7280]">
                          Loading…
                        </td>
                      </tr>
                    ) : history.length ? (
                      history.map((row, i) => {
                        const date = formatShortDate(row?.date) || "—";
                        const amount = Number(row?.amount ?? 0);
                        const cur = String(row?.currency || currency);
                        const causes = Array.isArray(row?.causes) ? row.causes : [];
                        const causeLabel = String(causes?.[0]?.label || "").trim() || "—";
                        const statusKey2 = String(row?.status?.key || "").trim().toLowerCase();
                        const statusLabel2 = String(row?.status?.label || "").trim() || "—";
                        return (
                          <tr key={String(row?.transactionId || i)} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-3.5 px-2 first:pl-0 text-[#111827] font-medium">{date}</td>
                            <td className="py-3.5 px-2 text-[#111827] font-semibold">{formatCurrency(amount, cur)}</td>
                            <td className="py-3.5 px-2">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${causeBadgeStyles[causeLabel] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                                {causeLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(statusKey2)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                                {statusLabel2}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 last:pr-0 text-[#6B7280]">—</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-[#6B7280]">
                          No donations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">

              {/* Total Contributed */}
              <div className="px-4 py-4">
                <div className="bg-[#1A1A1A] px-5 py-4 rounded-2xl">
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Total Contributed</p>
                  <p className="text-3xl font-bold text-white">{loading ? "—" : formatCurrency(totalDonated, currency)}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">Lifetime for this schedule</p>
                </div>

                {/* Next Donation */}
                <div className="border-b px-5 py-4 border-dashed border-[#E5E7EB]">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">Next Donation</p>
                  <p className="text-sm font-semibold text-[#111827]">{loading ? "—" : nextShort}</p>
                  <div className="mt-3 pt-3 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                    <span>{loading ? "—" : frequency}</span>
                    <span className="font-semibold text-[#EA3335]">{loading ? "—" : formatCurrency(nextAmount, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

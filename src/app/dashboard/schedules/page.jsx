"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ClockIcon, PlusIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "../components/DashboardHeader";
import ActionButtons from "../components/ActionButtons";
import { getUserSchedules } from "@/services/donationService";
import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const frequencyLabel = { Weekly: "per week", Monthly: "per month", Daily: "per day" };

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

const SchedulesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserSchedules({ page: "1", limit: "50", q: "" });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setError(e?.message || "Failed to load schedules.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const schedules = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.map((s, idx) => {
      const scheduleId = String(s?.scheduleId || "");
      const title = String(s?.title || "").trim() || "Schedule";
      const statusKey = String(s?.status?.key || "").trim().toLowerCase();
      const statusLabel = String(s?.status?.label || "").trim() || "—";
      const frequency = String(s?.frequencyLabel || "").trim() || "—";
      const cause = String(s?.causeTag?.label || "").trim() || "—";
      const started = formatDate(s?.startedAt) || "—";
      const next = formatDate(s?.nextDonation?.date) || "—";
      const amount = Number(s?.installmentAmount ?? 0);
      const currency = String(s?.currency || "USD");
      const totalDonated = Number(s?.totalDonated ?? 0);
      return {
        id: scheduleId || String(idx),
        slug: scheduleId || String(idx),
        title,
        amount,
        currency,
        frequency,
        cause,
        started,
        next,
        totalDonated,
        statusKey,
        status: statusLabel,
      };
    });
  }, [items]);

  return (
    <>
      <DashboardHeader
        title="Recurring Schedules"
        subtitle="Manage your recurring donation schedules"
      />

      <div className="flex-1 p-4 md:p-6 space-y-4">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        {loading ? (
          <SkeletonStack count={3} blockClass="h-24 rounded-2xl" />
        ) : schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-12 text-center text-sm text-[#6B7280]">
            No schedules found.
          </div>
        ) : (
          schedules.map((s) => {
            const isActive = String(s.statusKey) === "active";
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-4 md:p-5 hover:border-red-500/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                    {CalendarIcon}
                  </div>

                  <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <h3 className="font-semibold text-[#111827] text-sm md:text-base leading-snug">{s.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isActive ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FFF8EC] text-[#B45309]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#047857] animate-pulse" : "bg-[#B45309]"}`} />
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {s.frequency}&nbsp;•&nbsp;{s.cause}&nbsp;•&nbsp;Started {s.started}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 md:gap-3">
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-bold text-[#EA3335] leading-none">{formatCurrency(s.amount, s.currency)}</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">{frequencyLabel[s.frequency] ?? s.frequency.toLowerCase()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ActionButtons isActive={isActive} slug={s.slug} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    {ClockIcon}
                    Next donation:&nbsp;
                    <span className="font-semibold text-[#111827]">{s.next}</span>
                  </span>
                  <span>
                    Total donated:&nbsp;
                    <span className="font-semibold text-[#111827]">{formatCurrency(s.totalDonated, s.currency)}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
export default SchedulesPage;

"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ClockIcon, DollarIcon, DonationContentIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";
import { getUserDashboard } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

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

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserDashboard({ recentLimit: "3", schedulesLimit: "3", distributionLimit: "6" });
        if (!alive) return;
        const d = res?.data?.data || res?.data || null;
        setData(d);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load dashboard.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const kpis = data?.kpis || {};
  const recentItems = Array.isArray(data?.recentDonations?.items) ? data.recentDonations.items : [];
  const distributionItems = Array.isArray(data?.fundBreakdown?.distributionOverview?.items)
    ? data.fundBreakdown.distributionOverview.items
    : [];
  const schedulesItems = Array.isArray(data?.activeSchedulesList?.items) ? data.activeSchedulesList.items : [];

  const stats = useMemo(() => {
    const currency = kpis?.currency || "USD";
    const totalDonated = Number(kpis?.totalDonated ?? 0);
    const activeSchedules = Number(kpis?.activeSchedules ?? 0);
    const nextPayment = kpis?.nextScheduledPayment || null;
    const nextAmount = nextPayment ? Number(nextPayment.amount ?? 0) : 0;
    const nextCurrency = nextPayment?.currency || currency;
    const nextDue = nextPayment?.dueDate || "";
    return [
      {
        label: "Total Donated",
        value: formatCurrency(totalDonated, currency),
        hint: "Lifetime contributions",
        icon: DollarIcon,
        accent: "#EA3335",
        bgColor: "#FFF5F5",
        borderColor: "#FECACA",
      },
      {
        label: "Active Schedules",
        value: String(activeSchedules),
        hint: "Recurring donations",
        icon: CalendarIcon,
        accent: "#B45309",
        bgColor: "#FFF6EC",
        borderColor: "#FFE7CC",
      },
      {
        label: "Next Payment",
        value: nextPayment ? formatCurrency(nextAmount, nextCurrency) : "—",
        hint: nextPayment ? formatShortDate(nextDue) : "No upcoming payment",
        icon: ClockIcon,
        accent: "#EA3335",
        bgColor: "#FFF5F5",
        borderColor: "#FFCCCC",
      },
    ];
  }, [kpis]);

  const recentDonations = useMemo(() => {
    return recentItems.map((it, idx) => {
      const title = String(it?.title || "").trim() || "Donation";
      const date = formatShortDate(it?.date);
      const amount = Number(it?.amount ?? 0);
      const currency = String(it?.currency || kpis?.currency || "USD");
      const cause = String(it?.causes?.[0]?.label || "").trim() || "—";
      return { id: String(it?.donationId || idx), title, date, amount, currency, cause };
    });
  }, [recentItems, kpis?.currency]);

  const fundBreakdown = useMemo(() => {
    return distributionItems.slice(0, 6).map((it, idx) => {
      const label = String(it?.label || "").trim() || String(it?.key || "").trim() || `Item ${idx + 1}`;
      const amount = Number(it?.amount ?? 0);
      const percent = Number(it?.percentOfTotal ?? 0);
      return { label, amount, percent };
    });
  }, [distributionItems]);

  const activeSchedules = useMemo(() => {
    return schedulesItems.map((s, idx) => {
      const title = String(s?.title || "").trim() || "Schedule";
      const frequency = String(s?.frequencyLabel || "").trim() || "—";
      const nextPayment = s?.nextPayment || {};
      const amount = Number(nextPayment?.amount ?? 0);
      const currency = String(nextPayment?.currency || kpis?.currency || "USD");
      const next = formatShortDate(nextPayment?.dueDate);
      return { id: String(s?.donationId || idx), title, amount, currency, frequency, next };
    });
  }, [schedulesItems, kpis?.currency]);

  return (
    <>
      <DashboardHeader />

      <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </section>

        {/* Recent Donations + Fund Breakdown */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Recent Donations */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Recent Donations</h2>
              <a
                href="/dashboard/donation-history"
                className="text-sm text-[#EA3335] hover:underline font-medium"
              >
                View All →
              </a>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
                  <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
                  <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
                </div>
              ) : recentDonations.length ? (
                recentDonations.map((d, idx) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between py-3 ${
                    idx !== recentDonations.length - 1 ? "border-b border-[#E5E7EB]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                      {DonationContentIcon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#111827] text-sm truncate">{d.title}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{d.date || "—"}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-3">
                    <p className="font-semibold text-[#111827] text-base leading-none">{formatCurrency(d.amount, d.currency)}</p>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        causeBadgeStyles[d.cause] || "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {d.cause}
                    </span>
                  </div>
                </div>
              ))
              ) : (
                <div className="py-10 text-center text-sm text-[#6B7280]">No recent donations.</div>
              )}
            </div>
          </div>

          {/* Fund Breakdown */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Fund Breakdown</h2>
              <a
                href="/dashboard/fund-breakdown"
                className="text-sm text-[#EA3335] hover:underline font-medium"
              >
                Details
              </a>
            </div>

            <div className="space-y-5 mt-2">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
                  <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
                  <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
                </div>
              ) : fundBreakdown.length ? (
                fundBreakdown.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#111827]">{f.label}</span>
                    <span className="font-medium text-[#111827]">{formatCurrency(f.amount, kpis?.currency || "USD")}</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#EA3335]"
                      style={{ width: `${f.percent}%` }}
                    />
                  </div>
                </div>
              ))
              ) : (
                <div className="py-10 text-center text-sm text-[#6B7280]">No breakdown available.</div>
              )}
            </div>
          </div>
        </div>

        {/* Active Schedules */}
        <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Active Schedules</h2>
            <a
              href="/dashboard/schedules"
              className="text-sm text-[#EA3335] hover:underline font-medium"
            >
              Manage All →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <div className="h-28 animate-pulse rounded-2xl bg-[#F3F4F6]" />
                <div className="h-28 animate-pulse rounded-2xl bg-[#F3F4F6]" />
                <div className="h-28 animate-pulse rounded-2xl bg-[#F3F4F6]" />
              </>
            ) : activeSchedules.length ? (
              activeSchedules.map((s) => (
              <div
                key={s.id}
                className="border border-dashed border-[#E5E7EB] rounded-2xl p-4 md:p-5 hover:border-red-500/30 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-[#ECFDF5] text-[#047857] px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-[#047857] rounded-full animate-pulse" />
                      ACTIVE
                    </span>
                    <p className="mt-3 font-medium text-[#111827] leading-snug text-sm">
                      {s.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-[#EA3335]">{formatCurrency(s.amount, s.currency)}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{s.frequency}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                  Next donation:{" "}
                  <span className="font-semibold text-[#111827]">{s.next || "—"}</span>
                </div>
              </div>
            ))
            ) : (
              <div className="py-10 text-center text-sm text-[#6B7280] lg:col-span-3">No active schedules.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

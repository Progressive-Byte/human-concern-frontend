"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ClockIcon, DollarIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatCard from "./components/StatCard";
import RecentDonationsCard from "./components/RecentDonationsCard";
import FundBreakdownCard from "./components/FundBreakdownCard";
import ActiveSchedulesCard from "./components/ActiveSchedulesCard";
import { getUserDashboard } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";

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
        setData(res?.data?.data || res?.data || null);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load dashboard.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const kpis = data?.kpis || {};
  const recentItems = Array.isArray(data?.recentDonations?.items) ? data.recentDonations.items : [];
  const distributionItems = Array.isArray(data?.fundBreakdown?.distributionOverview?.items)
    ? data.fundBreakdown.distributionOverview.items : [];
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
      { label: "Total Donated",    value: formatCurrency(totalDonated, currency),                           hint: "Lifetime contributions",                                icon: DollarIcon,   accent: "#EA3335", bgColor: "#FFF5F5", borderColor: "#FECACA" },
      { label: "Active Schedules", value: String(activeSchedules),                                          hint: "Recurring donations",                                   icon: CalendarIcon, accent: "#B45309", bgColor: "#FFF6EC", borderColor: "#FFE7CC" },
      { label: "Next Payment",     value: nextPayment ? formatCurrency(nextAmount, nextCurrency) : "—",     hint: nextPayment ? formatShortDate(nextDue) : "No upcoming payment", icon: ClockIcon, accent: "#EA3335", bgColor: "#FFF5F5", borderColor: "#FFCCCC" },
    ];
  }, [kpis]);

  const recentDonations = useMemo(() =>
    recentItems.map((it, idx) => ({
      id:       String(it?.donationId || idx),
      title:    String(it?.title || "").trim() || "Donation",
      date:     formatShortDate(it?.date),
      amount:   Number(it?.amount ?? 0),
      currency: String(it?.currency || kpis?.currency || "USD"),
      cause:    String(it?.causes?.[0]?.label || "").trim() || "—",
    })),
  [recentItems, kpis?.currency]);

  const fundBreakdown = useMemo(() =>
    distributionItems.slice(0, 6).map((it, idx) => ({
      label:   String(it?.label || "").trim() || String(it?.key || "").trim() || `Item ${idx + 1}`,
      amount:  Number(it?.amount ?? 0),
      percent: Number(it?.percentOfTotal ?? 0),
    })),
  [distributionItems]);

  const activeSchedules = useMemo(() =>
    schedulesItems.map((s, idx) => {
      const nextPayment = s?.nextPayment || {};
      return {
        id:        String(s?.donationId || idx),
        title:     String(s?.title || "").trim() || "Schedule",
        frequency: String(s?.frequencyLabel || "").trim() || "—",
        amount:    Number(nextPayment?.amount ?? 0),
        currency:  String(nextPayment?.currency || kpis?.currency || "USD"),
        next:      formatShortDate(nextPayment?.dueDate),
      };
    }),
  [schedulesItems, kpis?.currency]);

  return (
    <>
      <DashboardHeader />

      <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <RecentDonationsCard loading={loading} donations={recentDonations} />
          <FundBreakdownCard   loading={loading} items={fundBreakdown} currency={kpis?.currency || "USD"} />
        </div>

        <ActiveSchedulesCard loading={loading} schedules={activeSchedules} />
      </div>
    </>
  );
};

export default DashboardPage;

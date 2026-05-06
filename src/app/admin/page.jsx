"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminDashboardOverview } from "@/services/admin";
import { formatCurrency } from "@/utils/helpers";
import AdminDashboardHeader from "./components/AdminDashboardHeader";
import KpiCard from "./components/KpiCard";
import PromisedVsCollectedChart from "./components/PromisedVsCollectedChart";
import ActiveCampaignsCard from "./components/ActiveCampaignsCard";
import FundPerformanceTable from "./components/FundPerformanceTable";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useAdminAuth } from "@/context/AdminAuthContext";

function formatCompactCurrency(value, currency) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return formatCurrency(n, currency || "USD");
  }
}

function KpiIcon({ type }) {
  if (type === "donors") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 21v-2a4 4 0 0 0-3-3.87"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "donations") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 1v22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "collection") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M3 3v18h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 14l4-4 3 3 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 22s8-4.5 8-10a5 5 0 0 0-8-3.5A5 5 0 0 0 4 12c0 5.5 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonCard() {
  return <div className="h-24 animate-pulse rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA]" />;
}

function SkeletonPanel({ className = "" }) {
  return <div className={`h-80 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white ${className}`.trim()} />;
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminDashboardOverview({ activeLimit: "5" });
        if (!alive) return;
        setData(res?.data || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load dashboard.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const kpis = data?.kpis || {};
  const currency = kpis?.currency || "USD";

  const chartItems = useMemo(() => data?.charts?.promisedVsCollected?.items || [], [data]);
  const activeCampaigns = useMemo(() => data?.activeCampaigns?.items || [], [data]);
  const fundItems = useMemo(() => data?.fundPerformance?.items || [], [data]);

  return (
    <main className="min-w-0 p-4 md:p-6 space-y-6">
      <AdminDashboardHeader admin={admin} />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {loading ? (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonPanel />
            <SkeletonPanel />
          </section>

          <section>
            <div className="h-90 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
          </section>
        </>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total Donors"
              value={Number(kpis?.totalDonors || 0).toLocaleString()}
              icon={<KpiIcon type="donors" />}
            />
            <KpiCard
              label="Total Donations"
              value={formatCompactCurrency(kpis?.totalDonations || 0, currency)}
              icon={<KpiIcon type="donations" />}
            />
            <KpiCard
              label="Total Collection"
              value={formatCompactCurrency(kpis?.totalCollected || 0, currency)}
              icon={<KpiIcon type="collection" />}
            />
            <KpiCard
              label="Ongoing Campaigns"
              value={Number(kpis?.ongoingCampaigns || 0).toLocaleString()}
              icon={<KpiIcon type="campaigns" />}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PromisedVsCollectedChart items={chartItems} />
            <ActiveCampaignsCard items={activeCampaigns} currency={currency} />
          </section>

          <section>
            <FundPerformanceTable items={fundItems} currency={currency} />
          </section>
        </>
      )}
    </main>
  );
}

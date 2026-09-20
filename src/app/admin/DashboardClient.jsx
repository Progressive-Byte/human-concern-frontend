"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getAdminReportSummary,
  getAdminReportCampaigns,
  getAdminReportFunds,
  getAdminReportTransactions,
  getAdminReportAttribution,
  getAdminReportFilterOptions,
  buildReportQuery,
} from "@/services/admin";
import AdminDashboardHeader from "./components/AdminDashboardHeader";
import ReportFilterBar from "./components/reports/ReportFilterBar";
import ReportKpiCards from "./components/reports/ReportKpiCards";
import CampaignPerformanceSection from "./components/reports/CampaignPerformanceSection";
import FundPerformanceSection from "./components/reports/FundPerformanceSection";
import TransactionHealthSection from "./components/reports/TransactionHealthSection";
import AttributionSection from "./components/reports/AttributionSection";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useAdminAuth } from "@/context/AdminAuthContext";

// Every filter the report endpoints accept. Keeping them in the URL makes a view shareable
// and keeps every section on the page reading the same values.
const FILTER_KEYS = [
  "range", "from", "to", "campaignId", "formId", "fundCode", "designationId",
  "touch", "source", "medium", "campaign", "term", "content",
  "donationType", "transactionStatus", "donationId", "donorId", "email",
  "paymentTransactionId", "currency",
];

const DashboardClient = () => {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const out = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) out[key] = value;
    }
    if (!out.range) out.range = "mtd";
    return out;
  }, [searchParams]);

  const filterKey = useMemo(() => buildReportQuery(filters), [filters]);

  const [options, setOptions] = useState({ campaigns: [], funds: [], designations: [], sources: [], mediums: [] });
  const [summary, setSummary] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [funds, setFunds] = useState(null);
  const [health, setHealth] = useState(null);
  const [attribution, setAttribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateFilters = useCallback(
    (patch) => {
      const next = { ...filters, ...patch };
      // Clearing a filter removes it from the URL entirely.
      Object.keys(next).forEach((k) => {
        if (!next[k]) delete next[k];
      });
      const query = buildReportQuery(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  const resetFilters = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  useEffect(() => {
    let alive = true;
    getAdminReportFilterOptions()
      .then((res) => {
        if (!alive) return;
        setOptions(res?.data || {});
      })
      .catch(() => {
        // Filter dropdowns are optional; the dashboard still works without them.
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, campaignsRes, fundsRes, healthRes, attributionRes] = await Promise.all([
          getAdminReportSummary(filters),
          getAdminReportCampaigns(filters),
          getAdminReportFunds(filters),
          getAdminReportTransactions(filters),
          getAdminReportAttribution(filters),
        ]);
        if (!alive) return;
        setSummary(summaryRes?.data || null);
        setCampaigns(campaignsRes?.data || null);
        setFunds(fundsRes?.data || null);
        setHealth(healthRes?.data || null);
        setAttribution(attributionRes?.data || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load the dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // `filterKey` is the serialized filters, so the effects re-run exactly when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <AdminDashboardHeader admin={admin} />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <ReportFilterBar filters={filters} options={options} onChange={updateFilters} onReset={resetFilters} />

      <ReportKpiCards data={summary} loading={loading} />
      <CampaignPerformanceSection data={campaigns} loading={loading} />
      <FundPerformanceSection data={funds} loading={loading} />
      <TransactionHealthSection data={health} loading={loading} />
      <AttributionSection data={attribution} loading={loading} />
    </main>
  );
};

export default DashboardClient;

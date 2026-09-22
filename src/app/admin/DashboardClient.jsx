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
import Link from "next/link";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminHasPermission } from "@/utils/adminPermissions";
import { firstAllowedAdminHref } from "@/utils/adminNav";

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

  // The Overview page is itself permission-gated; a role without it is sent to a page it can open.
  const canView = adminHasPermission(admin, "dashboard.read");

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
    if (!admin || !canView) return undefined;
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
  }, [admin, canView]);

  useEffect(() => {
    if (!admin || !canView) return undefined;
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
  }, [filterKey, admin, canView]);

  // No overview access → bounce to the first page this role CAN open.
  useEffect(() => {
    if (!admin || canView) return;
    const next = firstAllowedAdminHref(admin);
    if (next && next !== "/admin") router.replace(next);
  }, [admin, canView, router]);

  if (admin && !canView) {
    const next = firstAllowedAdminHref(admin);
    return (
      <main className="min-w-0 space-y-6 p-4 md:p-6">
        <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6">
          <div className="text-[18px] font-semibold text-[#111827]">No access to the dashboard</div>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Your role doesn&apos;t include the <span className="font-mono">dashboard.read</span> permission.
          </p>
          {next && next !== "/admin" ? (
            <Link
              href={next}
              className="mt-4 inline-flex rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] no-underline transition hover:bg-[#F9FAFB]"
            >
              Go to {next}
            </Link>
          ) : (
            <p className="mt-3 text-[13px] text-[#6B7280]">Ask an administrator to grant you access.</p>
          )}
        </div>
      </main>
    );
  }

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

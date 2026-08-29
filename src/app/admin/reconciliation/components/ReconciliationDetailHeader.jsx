"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminAvatarMenu from "@/app/admin/components/AdminAvatarMenu";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { downloadReconciliationReportCsv } from "@/services/adminReconciliation";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M21 12a9 9 0 0 1-15.55 6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12a9 9 0 0 1 15.55-6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 5v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 19v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ReconciliationDetailHeader = ({
  reportId,
  report,
  refreshing = false,
  onRefresh,
}) => {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [downloading, setDownloading] = useState(false);

  const reportDisplayId = String(reportId || report?.id || "").slice(-12) || "—";
  const provider = String(report?.provider || "");
  const configId = String(report?.gatewayConfigurationId || report?.configId || "default");

  async function handleDownload() {
    if (!reportId || downloading) return;
    setDownloading(true);
    try {
      await downloadReconciliationReportCsv(reportId);
      toast.success("CSV download started.");
    } catch (e) {
      toast.error(e?.message || "CSV download failed.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] transition hover:text-[#111827]"
        >
          <ArrowLeftIcon />
          Back to reports
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">
            Reconciliation Report
          </h1>
          <code className="rounded-lg bg-[#F3F4F6] px-2.5 py-1 font-mono text-[12px] text-[#111827]">
            #{reportDisplayId}
          </code>
        </div>

        <p className="mt-2 text-[14px] text-[#6B7280]">
          {provider ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-semibold text-[#111827] capitalize">
                {provider}
              </span>
              <span className="mx-2 text-[#9CA3AF]">•</span>
              Config: <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[11px]">{configId}</code>
            </>
          ) : (
            "Detailed breakdown of the reconciliation run and discrepancy review queue."
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#111827]/5 text-[#111827]">
            <DownloadIcon />
          </span>
          {downloading ? "Preparing..." : "Download CSV"}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#111827]/5 text-[#111827]">
            <RefreshIcon />
          </span>
          Refresh
        </button>

        <Link
          href="/"
          aria-label="Go to main site"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[#E5E7EB] bg-white text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </Link>

        <AdminAvatarMenu admin={admin} />
      </div>
    </div>
  );
};

export default ReconciliationDetailHeader;

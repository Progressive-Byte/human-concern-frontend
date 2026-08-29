"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { downloadReconciliationReportCsv, postRerunReconciliationReport } from "@/services/adminReconciliation";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
    </svg>
  );
}

const ReconciliationRowActions = ({ reportId, report, onRerun, onDownload }) => {
  const router = useRouter();
  const toast = useToast();
  const [rerunning, setRerunning] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(e) {
    e?.stopPropagation?.();
    if (!reportId || downloading) return;
    setDownloading(true);
    try {
      await downloadReconciliationReportCsv(reportId);
      toast.success("CSV download started.");
      onDownload?.();
    } catch (e2) {
      toast.error(e2?.message || "CSV download failed.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleRerun(e) {
    e?.stopPropagation?.();
    if (!reportId || rerunning) return;
    setRerunning(true);
    try {
      const res = await postRerunReconciliationReport(reportId);
      toast.success("Re-queued reconciliation report.");
      onRerun?.(res?.data || res);
      router.refresh();
    } catch (e2) {
      toast.error(e2?.message || "Failed to re-run report.");
    } finally {
      setRerunning(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Link
        href={`/admin/reconciliation/${encodeURIComponent(reportId)}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB]"
        title="View detail"
      >
        <EyeIcon />
        Detail
      </Link>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        title="Download CSV"
      >
        <DownloadIcon />
        CSV
      </button>

      <button
        type="button"
        onClick={handleRerun}
        disabled={rerunning}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        title="Re-run"
      >
        <PlayIcon />
        Re-run
      </button>
    </div>
  );
};

export default ReconciliationRowActions;

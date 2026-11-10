"use client";

import Link from "next/link";
import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminHasPermission } from "@/utils/adminPermissions";

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
      <path
        d="M21 12a9 9 0 0 1-15.55 6.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12a9 9 0 0 1 15.55-6.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 5v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 19v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DonationsHeader = ({ onExport, onRefresh, refreshing = false }) => {
  const { admin } = useAdminAuth();
  const canExportData = adminHasPermission(admin, "data.export");

  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Transactions</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">View and manage all donation transactions</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#111827]/5 text-[#111827]">
            <DownloadIcon />
          </span>
          Export
        </button>

        {canExportData ? (
          <Link
            href="/admin/data-export?tables=donations,transactions"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#EA3335]/30 bg-[#EA3335]/5 px-4 py-2.5 text-[13px] font-semibold text-[#EA3335] transition-colors duration-200 hover:bg-[#EA3335]/10"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#EA3335]/10">
              <DownloadIcon />
            </span>
            Data Export
          </Link>
        ) : null}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#111827]/5 text-[#111827]">
            <RefreshIcon />
          </span>
          Refresh
        </button>

        <AdminHeaderActions admin={admin} />
      </div>
    </div>
  );
}

export default DonationsHeader;
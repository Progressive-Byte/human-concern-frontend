"use client";

import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";
import { useAdminAuth } from "@/context/AdminAuthContext";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const ReconciliationHeader = ({
  refreshing = false,
  onRefresh,
  onOpenManualRun,
  onOpenExpireStale,
}) => {
  const { admin } = useAdminAuth();

  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Reconciliation Reports</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Cross-check payment provider settlements against the local ledger and resolve discrepancies.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onOpenExpireStale}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#B91C1C] transition-colors duration-200 hover:bg-[#FEF2F2] disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#B91C1C]/10 text-[#B91C1C]">
            <ClockIcon />
          </span>
          Expire Stale Challenges
        </button>

        <button
          type="button"
          onClick={onOpenManualRun}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-white">
            <PlayIcon />
          </span>
          Manual Run
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

        <AdminHeaderActions admin={admin} />
      </div>
    </div>
  );
};

export default ReconciliationHeader;

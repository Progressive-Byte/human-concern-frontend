"use client";

import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";
import { useAdminAuth } from "@/context/AdminAuthContext";

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

function BroomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M19 3l2 2-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 14l4 4M3 20l6-6 2 2-6 6M10 8l6-3 3 6-6 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const GatewayHealthHeader = ({ onRefresh, refreshing = false, onSweep, sweeping = false }) => {
  const { admin } = useAdminAuth();

  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Gateway Health</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Monitor payment provider circuit breakers, success rates, and probe connectivity.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSweep}
          disabled={sweeping}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#111827]/5 text-[#111827]">
            <BroomIcon />
          </span>
          {sweeping ? "Sweeping…" : "Sweep Expired"}
        </button>

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
};

export default GatewayHealthHeader;

"use client";

const FundBreakdownHeader = ({ onExport, onRefresh, refreshing }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="text-[20px] font-semibold text-[#171717]">Fund Breakdown</h1>
      <p className="mt-0.5 text-[13px] text-[#8C8C8C]">
        Donations received, grouped by the fund code of the cause each payment was allocated to.
      </p>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#383838] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
      <button
        type="button"
        onClick={onExport}
        className="cursor-pointer rounded-xl bg-[#171717] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#000000]"
      >
        Export CSV
      </button>
    </div>
  </div>
);

export default FundBreakdownHeader;

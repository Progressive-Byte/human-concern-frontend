"use client";

import { Suspense, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { DownloadIcon } from "@/components/common/SvgIcon";
import { exportUserDonationsCsv } from "@/services/donationService";
import { useDonationHistory } from "./hooks/useDonationHistory";
import { FilterBar } from "./components/FilterBar";
import { DonationTable } from "./components/DonationTable";
import { DonationHistoryFallback } from "./components/DonationHistoryFallback";
import ThankYouModal from "./ThankYouModal";

function DonationHistoryPage() {
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("all");

  const { loading, error, setError, rows, causeOptions, debouncedSearch, showPopup, setShowPopup, thankyouData } =
    useDonationHistory(search, cause);

  const handleExportCsv = async () => {
    try {
      const csv = await exportUserDonationsCsv({ q: debouncedSearch, filter: cause, sort: "date", order: "desc" });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "Export failed.");
    }
  };

  return (
    <>
      <DashboardHeader
        title="Donation History"
        subtitle="View all your past donations"
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 transition-colors cursor-pointer"
          >
            {DownloadIcon}
            Export CSV
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          cause={cause}
          onCauseChange={setCause}
          causeOptions={causeOptions}
        />

        <DonationTable loading={loading} rows={rows} />
      </div>

      {showPopup && thankyouData && (
        <ThankYouModal thankyouData={thankyouData} onClose={() => setShowPopup(false)} />
      )}
    </>
  );
}

const DonationHistory = () => (
  <Suspense fallback={<DonationHistoryFallback />}>
    <DonationHistoryPage />
  </Suspense>
);

export default DonationHistory;

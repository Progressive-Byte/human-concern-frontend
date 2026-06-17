"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import { DownloadIcon } from "@/components/common/SvgIcon";
import { exportUserDonationsCsv, getUserDonationsList } from "@/services/donationService";
import { FilterBar } from "./components/FilterBar";
import { DonationTable } from "./components/DonationTable";
import { DonationHistoryFallback } from "./components/DonationHistoryFallback";
import ThankYouModal from "./ThankYouModal";
function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

const DEFAULT_CAUSE_OPTIONS = [{ value: "all", label: "All Causes" }];

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function DonationHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [causeOptions, setCauseOptions] = useState(DEFAULT_CAUSE_OPTIONS);
  const [showPopup, setShowPopup] = useState(false);
  const [thankyouData, setThankyouData] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (searchParams.get("thankyou") !== "1") return;
    try {
      const raw = sessionStorage.getItem("thankyouData");
      if (raw) {
        setThankyouData(JSON.parse(raw));
        setShowPopup(true);
        sessionStorage.removeItem("thankyouData");
      }
    } catch {}
    router.replace("/dashboard/donation-history", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserDonationsList({
          page: "1", limit: "50", q: debouncedSearch,
          filter: cause, sort: "date", order: "desc",
        });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        const rawCauses = res?.meta?.filters?.causes || res?.data?.meta?.filters?.causes || [];
        setItems(nextItems);
        const opts = (Array.isArray(rawCauses) ? rawCauses : [])
          .map((c) => ({
            value: String(c?.key || "").trim(),
            label: `${String(c?.label || "Cause")}${typeof c?.count === "number" ? ` (${c.count})` : ""}`,
          }))
          .filter((o) => o.value);
        setCauseOptions(opts.length ? opts : DEFAULT_CAUSE_OPTIONS);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setCauseOptions(DEFAULT_CAUSE_OPTIONS);
        setError(e?.message || "Failed to load donations.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [debouncedSearch, cause]);

  const rows = useMemo(() =>
    (Array.isArray(items) ? items : []).map((it, idx) => ({
      id:        String(it?.donationId || idx),
      date:      formatDate(it?.date) || "—",
      campaign:  String(it?.campaign?.name || "").trim() || "—",
      cause:     String(it?.causeTag?.label || "").trim() || "—",
      amount:    Number(it?.amount ?? 0),
      currency:  String(it?.currency || "USD"),
      status:    String(it?.status?.label || "").trim() || "—",
      statusKey: String(it?.status?.key || ""),
    })),
  [items]);

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

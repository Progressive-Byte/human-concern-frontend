"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import CustomDropdown from "@/components/common/CustomDropdown";
import ThankYouModal from "./ThankYouModal";
import { DownloadIcon, EyeIcon, SearchIconFront } from "@/components/common/SvgIcon";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { exportUserDonationsCsv, getUserDonationsList } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function statusClass(statusKey) {
  const s = String(statusKey || "").toLowerCase();
  if (s === "succeeded") return "text-[#047857]";
  if (s === "pending") return "text-[#B45309]";
  if (s === "failed") return "text-[#EA3335]";
  if (s === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}

function DonationHistoryPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [cause, setCause]   = useState("all");

  const [showPopup, setShowPopup]       = useState(false);
  const [thankyouData, setThankyouData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [causeOptions, setCauseOptions] = useState([{ value: "all", label: "All Causes" }]);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (searchParams.get("thankyou") === "1") {
      try {
        const raw = sessionStorage.getItem("thankyouData");
        if (raw) {
          setThankyouData(JSON.parse(raw));
          setShowPopup(true);
          sessionStorage.removeItem("thankyouData");
        }
      } catch {}
      router.replace("/dashboard/donation-history", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserDonationsList({ page: "1", limit: "50", q: debouncedSearch, filter: cause, sort: "date", order: "desc" });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        const nextCauses = res?.meta?.filters?.causes || res?.data?.meta?.filters?.causes || [];
        setItems(nextItems);

        const list = Array.isArray(nextCauses) ? nextCauses : [];
        const opts = list
          .map((c) => ({
            value: String(c?.key || "").trim(),
            label: `${String(c?.label || "Cause")}${typeof c?.count === "number" ? ` (${c.count})` : ""}`,
          }))
          .filter((o) => o.value);
        setCauseOptions(opts.length ? opts : [{ value: "all", label: "All Causes" }]);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setCauseOptions([{ value: "all", label: "All Causes" }]);
        setError(e?.message || "Failed to load donations.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [debouncedSearch, cause]);

  const rows = useMemo(() => {
    return (Array.isArray(items) ? items : []).map((it, idx) => {
      const id = String(it?.donationId || idx);
      const date = formatDate(it?.date) || "—";
      const campaign = String(it?.campaign?.name || "").trim() || "—";
      const causeLabel = String(it?.causeTag?.label || "").trim() || "—";
      const amount = Number(it?.amount ?? 0);
      const currency = String(it?.currency || "USD");
      const statusKey = String(it?.status?.key || "");
      const status = String(it?.status?.label || "").trim() || "—";
      return { id, date, campaign, cause: causeLabel, amount, currency, status, statusKey, payment: "—" };
    });
  }, [items]);

  return (
    <>
      <DashboardHeader
        title="Donation History"
        subtitle="View all your past donations"
        actions={
          <button
            type="button"
            onClick={async () => {
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
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 transition-colors cursor-pointer"
          >
            {DownloadIcon}
            Export CSV
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{SearchIconFront}</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#EA3335]/40 focus:ring-2 focus:ring-[#EA3335]/10 transition"
            />
          </div>
          <div className="min-w-[170px]">
            <CustomDropdown
              options={causeOptions}
              value={cause}
              onChange={setCause}
              variant="form"
              placeholder="All Causes"
              showFilterIcon
              triggerHeight="h-10"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#6B7280] border-b border-dashed border-[#E5E7EB]">
                  <th className="px-4 py-4 font-medium">Date</th>
                  <th className="px-4 py-4 font-medium">Campaign</th>
                  <th className="hidden sm:table-cell px-4 py-4 font-medium">Cause</th>
                  <th className="px-4 py-4 font-medium">Amount</th>
                  <th className="hidden md:table-cell px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows rows={5} cols={6} />
                ) : (
                  rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-[#F9FAFB] transition-colors ${
                      idx !== rows.length - 1 ? "border-b border-[#E5E7EB]" : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-[#111827] font-medium text-sm">{r.date}</p>
                      <span className={`sm:hidden mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        causeBadgeStyles[r.cause] || "bg-[#F3F4F6] text-[#6B7280]"
                      }`}>
                        {r.cause}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[#111827] text-sm leading-snug">{r.campaign}</p>
                      <span className={`md:hidden mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${statusClass(r.statusKey)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                        {r.status}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
                        causeBadgeStyles[r.cause] || "bg-[#F3F4F6] text-[#6B7280]"
                      }`}>
                        {r.cause}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#111827] font-semibold whitespace-nowrap">
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(r.statusKey)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                        {r.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        {EyeIcon}
                      </button>
                    </td>
                  </tr>
                ))
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#6B7280]">
                      No donations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPopup && thankyouData && (
        <ThankYouModal
          thankyouData={thankyouData}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}

const DonationHistory = () => {
  return (
    <Suspense fallback={<p className="text-sm text-[#6B7280] p-6">Loading…</p>}>
      <DonationHistoryPage />
    </Suspense>
  );
}

export default DonationHistory;
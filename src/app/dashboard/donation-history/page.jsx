"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import CustomDropdown from "@/components/common/CustomDropdown";
import ThankYouModal from "./ThankYouModal";
import { DownloadIcon, EyeIcon, SearchIconFront } from "@/components/common/SvgIcon";

const rows = [
  { id: 1, date: "Feb 1, 2026",  campaign: "Ramadan Food Distribution",            cause: "Zakat",     amount: 100, status: "Completed", payment: "Visa •••• 4242"        },
  { id: 2, date: "Jan 25, 2026", campaign: "Emergency Relief: Earthquake Response", cause: "Sadaqah",   amount: 250, status: "Completed", payment: "Mastercard •••• 5555" },
  { id: 3, date: "Jan 15, 2026", campaign: "Orphan Sponsorship Program",            cause: "Zakat",     amount: 50,  status: "Completed", payment: "Visa •••• 4242"        },
  { id: 4, date: "Jan 1, 2026",  campaign: "Clean Water Wells Project",             cause: "Sadaqah",   amount: 75,  status: "Completed", payment: "PayPal"                 },
  { id: 5, date: "Dec 20, 2025", campaign: "Winter Aid for Refugees",               cause: "Emergency", amount: 120, status: "Completed", payment: "Visa •••• 4242"         },
];

const CAUSE_OPTIONS = [
  { value: "All Causes", label: "All Causes" },
  { value: "Zakat",      label: "Zakat"      },
  { value: "Sadaqah",    label: "Sadaqah"    },
  { value: "Emergency",  label: "Emergency"  },
];

const causeBadgeStyles = {
  Zakat:     "bg-[#ECF9F3] text-[#055A46]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

function DonationHistoryPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [cause, setCause]   = useState("All Causes");

  // Thank-you popup state (post-donation flow)
  const [showPopup, setShowPopup]       = useState(false);
  const [thankyouData, setThankyouData] = useState(null);

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

  const filtered = rows.filter((r) => {
    const matchesSearch = r.campaign.toLowerCase().includes(search.toLowerCase());
    const matchesCause  = cause === "All Causes" || r.cause === cause;
    return matchesSearch && matchesCause;
  });

  return (
    <>
      <DashboardHeader
        title="Donation History"
        subtitle="View all your past donations"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-white px-4 py-2.5 text-sm font-medium text-[#383838] hover:border-[#055A46]/40 hover:text-[#055A46] transition-colors cursor-pointer"
          >
            {DownloadIcon}
            Export CSV
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{SearchIconFront}</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-xl border border-[#EBEBEB] bg-white pl-10 pr-4 py-2.5 text-sm text-[#383838] placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#055A46]/40 focus:ring-2 focus:ring-[#055A46]/10 transition"
            />
          </div>
          <div className="min-w-[170px]">
            <CustomDropdown
              options={CAUSE_OPTIONS}
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
        <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
          {/* Desktop table */}
          <div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-xs uppercase tracking-wide text-[#8C8C8C] border-b border-[#EBEBEB]">
        <th className="px-4 py-4 font-medium">Date</th>
        <th className="px-4 py-4 font-medium">Campaign</th>
        <th className="hidden sm:table-cell px-4 py-4 font-medium">Cause</th>
        <th className="px-4 py-4 font-medium">Amount</th>
        <th className="hidden md:table-cell px-4 py-4 font-medium">Status</th>
        <th className="hidden lg:table-cell px-4 py-4 font-medium">Payment</th>
        <th className="px-4 py-4" />
      </tr>
    </thead>
    <tbody>
      {filtered.map((r, idx) => (
        <tr
          key={r.id}
          className={`hover:bg-[#FAFAFA] transition-colors ${
            idx !== filtered.length - 1 ? "border-b border-[#F0F0F0]" : ""
          }`}
        >
          {/* Date — always visible, stacks cause badge below on mobile */}
          <td className="px-4 py-4 whitespace-nowrap">
            <p className="text-[#383838] font-medium text-sm">{r.date}</p>
            {/* Cause badge — only on xs (hidden sm+) */}
            <span className={`sm:hidden mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
              causeBadgeStyles[r.cause] || "bg-[#F5F5F5] text-[#737373]"
            }`}>
              {r.cause}
            </span>
          </td>

          {/* Campaign — always visible, status dot below on mobile */}
          <td className="px-4 py-4">
            <p className="text-[#383838] text-sm leading-snug">{r.campaign}</p>
            {/* Status — only on xs/sm (hidden md+) */}
            <span className="md:hidden mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#055A46]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#055A46]" />
              {r.status}
            </span>
          </td>

          {/* Cause — hidden on xs */}
          <td className="hidden sm:table-cell px-4 py-4">
            <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
              causeBadgeStyles[r.cause] || "bg-[#F5F5F5] text-[#737373]"
            }`}>
              {r.cause}
            </span>
          </td>

          {/* Amount — always visible */}
          <td className="px-4 py-4 text-[#383838] font-semibold whitespace-nowrap">
            ${r.amount}
          </td>

          {/* Status — hidden on xs/sm */}
          <td className="hidden md:table-cell px-4 py-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#055A46]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#055A46]" />
              {r.status}
            </span>
          </td>

          {/* Payment — hidden on xs/sm/md */}
          <td className="hidden lg:table-cell px-4 py-4 text-[#737373] whitespace-nowrap">
            {r.payment}
          </td>

          {/* Action */}
          <td className="px-4 py-4 text-right">
            <button
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#8C8C8C] hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
            >
              {EyeIcon}
            </button>
          </td>
        </tr>
      ))}
      {filtered.length === 0 && (
        <tr>
          <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8C8C8C]">
            No donations found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-[#F0F0F0]">
            {filtered.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[#8C8C8C]">{r.date}</p>
                    <p className="mt-1 font-medium text-[#383838] text-sm leading-snug">{r.campaign}</p>
                  </div>
                  <p className="font-semibold text-[#383838] shrink-0">${r.amount}</p>
                </div>

                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-medium ${
                      causeBadgeStyles[r.cause] || "bg-[#F5F5F5] text-[#737373]"
                    }`}
                  >
                    {r.cause}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#055A46]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#055A46]" />
                    {r.status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#737373]">
                  <span>{r.payment}</span>
                  <button
                    type="button"
                    title="View"
                    className="text-[#8C8C8C] hover:text-[#055A46] cursor-pointer"
                  >
                    {EyeIcon}
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-[#8C8C8C]">No donations found.</div>
            )}
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

export default function DonationHistory() {
  return (
    <Suspense fallback={<p className="text-sm text-[#8C8C8C] p-6">Loading…</p>}>
      <DonationHistoryPage />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import { ThankyouIcon, ShareCampaignIcon, CircleCheckIcon } from "@/components/common/SvgIcon";

// Static placeholder rows — replace with API fetch later.
const rows = [
  { id: 1, date: "Feb 1, 2024",  campaign: "Ramadan Food Distribution",           cause: "Zakat",   amount: 100, status: "Completed", payment: "Visa •••• 4242" },
  { id: 2, date: "Jan 25, 2024", campaign: "Emergency Relief: Earthquake Response", cause: "Sadaqah", amount: 250, status: "Completed", payment: "Mastercard •••• 5555" },
  { id: 3, date: "Jan 15, 2024", campaign: "Orphan Sponsorship Program",           cause: "Zakat",   amount: 50,  status: "Completed", payment: "Visa •••• 4242" },
  { id: 4, date: "Jan 1, 2024",  campaign: "Clean Water Wells Project",            cause: "Sadaqah", amount: 75,  status: "Completed", payment: "PayPal" },
];

const causes = ["All Causes", "Zakat", "Sadaqah", "Emergency"];

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

function DonationHistoryPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [cause, setCause]   = useState("All Causes");

  // Thank-you popup state
  const [showPopup, setShowPopup]     = useState(false);
  const [thankyouData, setThankyouData] = useState(null);
  const [copied, setCopied]           = useState(false);

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
      // Remove the query param without adding to history
      router.replace("/dashboard/donation-history", { scroll: false });
    }
  }, [searchParams, router]);

  const handleShare = async () => {
    const url  = window.location.origin + "/campaigns";
    const title = thankyouData?.campaignTitle || "Human Concern";
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filtered = rows.filter((r) => {
    const matchesSearch = r.campaign.toLowerCase().includes(search.toLowerCase());
    const matchesCause  = cause === "All Causes" || r.cause === cause;
    return matchesSearch && matchesCause;
  });

  const sym            = CURRENCY_SYMBOLS[thankyouData?.currency] || "$";
  const donationAmount = thankyouData?.donationAmount;
  const isRecurring    = thankyouData?.isRecurring;

  return (
    <>
      <DashboardHeader
        title="Donation History"
        subtitle="View all your past donations"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Filter row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <select
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {causes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Cause</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{r.date}</td>
                  <td className="px-4 py-3 text-gray-700">{r.campaign}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {r.cause}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">${r.amount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.payment}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-gray-400 hover:text-gray-700" title="View">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    No donations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thank-you popup modal */}
      {showPopup && thankyouData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false); }}
        >
          <div className="relative w-full max-w-[460px] bg-white rounded-[24px] px-6 sm:px-10 py-8 flex flex-col items-center text-center shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#737373] transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="mt-2">{ThankyouIcon}</div>

            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#383838] mt-5">
              Thank You!
            </h1>

            <p className="text-[13px] text-[#737373] mt-2 mb-5">
              Your donation of{" "}
              {donationAmount ? (
                <span className="font-bold text-[#383838]">
                  {sym}{Number(donationAmount).toFixed(2)}
                </span>
              ) : "your generous amount"}{" "}
              has been processed successfully.
            </p>

            {/* Donation details card */}
            <div className="w-full bg-[#F6F6F6] rounded-xl px-4 py-4 mb-5 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-3">
                Donation Details
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#737373]">Project</span>
                  <span className="text-[13px] font-semibold text-[#383838]">
                    {thankyouData.isRamadan ? "Ramadan Project" : (thankyouData.campaignTitle || "—")}
                  </span>
                </div>

                {(thankyouData.causes ?? []).length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#737373]">Cause</span>
                    <span className="text-[13px] font-semibold text-[#383838]">
                      {thankyouData.causes.join(", ")}
                    </span>
                  </div>
                )}

                {isRecurring && thankyouData.frequency && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#737373]">Frequency</span>
                    <span className="text-[13px] font-semibold text-[#383838]">{thankyouData.frequency}</span>
                  </div>
                )}

                {isRecurring && thankyouData.numberOfDays > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#737373]">Duration</span>
                    <span className="text-[13px] font-semibold text-[#383838]">{thankyouData.numberOfDays} days</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] mt-1">
                  <span className="text-[12px] text-[#737373]">Total</span>
                  <span className="text-[14px] font-bold text-[#055A46]">
                    {sym}{donationAmount ? Number(donationAmount).toFixed(2) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => setShowPopup(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                View Dashboard
              </button>

              <button
                onClick={() => { setShowPopup(false); router.push("/campaigns"); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Browse Campaigns
              </button>

              <button
                onClick={handleShare}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[14px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
                  copied
                    ? "bg-[#055A46] border-[#055A46] text-white"
                    : "border-[#E5E5E5] hover:border-gray-400 text-[#383838]"
                }`}
              >
                {copied ? (
                  <>{CircleCheckIcon} Link Copied!</>
                ) : (
                  <>{ShareCampaignIcon} Share Campaign</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DonationHistory() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm">Loading…</p>}>
      <DonationHistoryPage />
    </Suspense>
  );
}

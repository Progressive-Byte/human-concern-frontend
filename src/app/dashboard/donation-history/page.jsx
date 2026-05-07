"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import { ThankyouIcon, ShareCampaignIcon, CircleCheckIcon } from "@/components/common/SvgIcon";

/* ------------------------------------------------------------------ */
/* Static placeholder rows — replace with API data when available.    */
/* ------------------------------------------------------------------ */
const rows = [
  { id: 1, date: "Feb 1, 2026",  campaign: "Ramadan Food Distribution",            cause: "Zakat",     amount: 100, status: "Completed", payment: "Visa •••• 4242"        },
  { id: 2, date: "Jan 25, 2026", campaign: "Emergency Relief: Earthquake Response", cause: "Sadaqah",   amount: 250, status: "Completed", payment: "Mastercard •••• 5555" },
  { id: 3, date: "Jan 15, 2026", campaign: "Orphan Sponsorship Program",            cause: "Zakat",     amount: 50,  status: "Completed", payment: "Visa •••• 4242"        },
  { id: 4, date: "Jan 1, 2026",  campaign: "Clean Water Wells Project",             cause: "Sadaqah",   amount: 75,  status: "Completed", payment: "PayPal"                 },
  { id: 5, date: "Dec 20, 2025", campaign: "Winter Aid for Refugees",               cause: "Emergency", amount: 120, status: "Completed", payment: "Visa •••• 4242"         },
];

const causes = ["All Causes", "Zakat", "Sadaqah", "Emergency"];

const causeBadgeStyles = {
  Zakat:     "bg-[#ECF9F3] text-[#055A46]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

/* ------------------------------------------------------------------ */
/* Inline icons                                                        */
/* ------------------------------------------------------------------ */
const SearchIcon = (
  <svg className="w-4 h-4 text-[#8C8C8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = (
  <svg className="w-4 h-4 text-[#8C8C8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronDownIcon = (
  <svg className="w-4 h-4 text-[#737373]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = (
  <svg className="w-4 h-4 text-[#055A46]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EyeIcon = (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Custom cause-filter dropdown                                        */
/* ------------------------------------------------------------------ */
const CauseFilter = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 min-w-[170px] rounded-xl border border-[#EBEBEB] bg-white px-4 py-2.5 text-sm text-[#383838] hover:border-[#055A46]/40 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {FilterIcon}
          <span className="font-medium">{value}</span>
        </span>
        <span
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          {ChevronDownIcon}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[200px] rounded-xl border border-[#EBEBEB] bg-white shadow-lg p-1.5 z-20 hc-animate-dropdown">
          {causes.map((c) => {
            const selected = c === value;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                  selected
                    ? "text-[#055A46] font-medium bg-[#ECF9F3]"
                    : "text-[#383838] hover:bg-[#F9F9F9]"
                }`}
              >
                <span>{c}</span>
                {selected && CheckIcon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
function DonationHistoryPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [cause, setCause]   = useState("All Causes");

  // Thank-you popup state (post-donation flow)
  const [showPopup, setShowPopup]       = useState(false);
  const [thankyouData, setThankyouData] = useState(null);
  const [copied, setCopied]             = useState(false);

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

  const handleShare = async () => {
    const url   = window.location.origin + "/campaigns";
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
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{SearchIcon}</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-xl border border-[#EBEBEB] bg-white pl-10 pr-4 py-2.5 text-sm text-[#383838] placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#055A46]/40 focus:ring-2 focus:ring-[#055A46]/10 transition"
            />
          </div>
          <CauseFilter value={cause} onChange={setCause} />
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#8C8C8C] border-b border-[#EBEBEB]">
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Campaign</th>
                  <th className="px-5 py-4 font-medium">Cause</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4" />
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
                    <td className="px-5 py-4 text-[#383838] font-medium whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-4 text-[#383838]">{r.campaign}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
                          causeBadgeStyles[r.cause] || "bg-[#F5F5F5] text-[#737373]"
                        }`}
                      >
                        {r.cause}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#383838] font-semibold whitespace-nowrap">${r.amount}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#055A46]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#055A46]" />
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#737373] whitespace-nowrap">{r.payment}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        title="View"
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

      {/* Thank-you popup modal */}
      {showPopup && thankyouData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false); }}
        >
          <div className="relative w-full max-w-[460px] bg-white rounded-[24px] px-6 sm:px-10 py-8 flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#737373] transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="mt-2">{ThankyouIcon}</div>

            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#383838] mt-5">Thank You!</h1>

            <p className="text-[13px] text-[#737373] mt-2 mb-5">
              Your donation of{" "}
              {donationAmount ? (
                <span className="font-bold text-[#383838]">
                  {sym}{Number(donationAmount).toFixed(2)}
                </span>
              ) : "your generous amount"}{" "}
              has been processed successfully.
            </p>

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

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => setShowPopup(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                View Dashboard
              </button>

              <button
                onClick={() => { setShowPopup(false); router.push("/campaigns"); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    <Suspense fallback={<p className="text-sm text-[#8C8C8C] p-6">Loading…</p>}>
      <DonationHistoryPage />
    </Suspense>
  );
}

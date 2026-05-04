"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDonation } from "@/context/DonationContext";
import CampaignCard from "@/app/(site)/campaigns/components/CampaignCard";
import { arrowIcon } from "@/components/common/SvgIcon";
import { serverApiBase } from "@/utils/constants";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const ThankYouPage = () => {
  const router = useRouter();
  const { data } = useDonation();
  const sym = CURRENCY_SYMBOLS[data.currency] || "$";

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${serverApiBase}campaigns/featured`)
      .then((r) => r.json())
      .then((res) => setCampaigns(res?.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#F9F9F9] px-4 pt-[140px] lg:pt-[180px] pb-20">
      {/* Thank-you card */}
      <div className="max-w-[480px] w-full mx-auto bg-white rounded-2xl border border-[#EBEBEB] p-8 text-center">
        <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#055A46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-[28px] font-bold text-[#383838] mb-2">Thank You!</h1>
        <p className="text-[#737373] text-[15px] leading-relaxed mb-6">
          Your{" "}
          {(data.grandTotal ?? data.amountTier) ? (
            <span className="font-bold text-[#055A46]">{sym}{(data.grandTotal ?? data.amountTier).toFixed(2)}</span>
          ) : "donation"}{" "}
          donation has been received. You are making a real difference.
        </p>

        {data.email && (
          <div className="bg-[#F9F9F9] rounded-xl px-4 py-3 mb-8 text-left">
            <p className="text-[12px] text-[#AEAEAE] mb-0.5">Confirmation sent to</p>
            <p className="text-[14px] font-medium text-[#383838]">{data.email}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white font-semibold transition-colors active:scale-95 cursor-pointer"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/campaigns")}
            className="w-full py-3 rounded-xl border border-[#E5E5E5] text-[#383838] font-medium hover:border-gray-400 transition-colors cursor-pointer"
          >
            Explore More Campaigns
          </button>
        </div>
      </div>

      {/* Campaigns section */}
      <section className="max-w-[1500px] mx-auto mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1A1A]">
              Support other urgent appeals!
            </h2>
            <p className="text-sm sm:text-base font-normal mt-2 text-[#737373]">
              Every donation makes a difference.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="group inline-flex items-center gap-2 bg-white text-[#383838] text-sm sm:text-base md:text-lg font-normal rounded-full px-4 sm:px-5 py-2.5 sm:py-3 transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 self-start sm:self-auto"
          >
            View All Campaigns
            <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
              {arrowIcon}
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
          {loading ? (
            <p className="col-span-full text-center text-[#737373]">Loading campaigns…</p>
          ) : campaigns.length === 0 ? (
            <p className="col-span-full text-center text-[#737373]">No campaigns found.</p>
          ) : (
            campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
          )}
        </div>
      </section>
    </main>
  );
};

export default ThankYouPage;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch(`${serverApiBase}campaigns/featured`)
      .then((r) => r.json())
      .then((res) => setCampaigns(res?.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const donationAmount  = data.grandTotal ?? data.amountTier;
  const campaignName    = data.campaignName  ?? "";
  const causeLabel      = data.causeLabel    ?? "";
  const objectiveLabel  = data.objectiveLabel ?? "";

  return (
    <main className="min-h-screen bg-[#F6F6F6] pb-20">
      <div className="relative w-full overflow-hidden pt-[120px] lg:pt-[200px]">

        {/* Left confetti */}
        <div className="absolute left-0 top-0 h-full pointer-events-none select-none z-100">
          <Image
            src="/images/left-celebration-background.png"
            alt=""
            width={320}
            height={600}
            className="h-full w-auto object-contain object-left"
            aria-hidden="true"
          />
        </div>

        {/* Right confetti */}
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none z-100">
          <Image
            src="/images/right-celebration-background.png"
            alt=""
            width={320}
            height={600}
            className="h-full w-auto object-contain object-right"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-20 mx-4 sm:mx-8 lg:mx-16 xl:mx-24 rounded-3xl flex flex-col md:flex-row">

          <div className="relative w-full md:w-[55%] h-[300px] md:h-auto shrink-0">
            <Image
              src="/images/happy-thankyou.png"
              alt="Happy children"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-white/10 hidden md:block" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 sm:px-12 py-12 text-center">

            {/* Red check circle */}
            <div className="w-16 h-16 rounded-full bg-[#EA3335] flex items-center justify-center mb-6 shadow-lg shadow-red-200">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-[32px] font-bold text-[#383838] mb-3 leading-tight">
              Thank You!
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] text-[#737373] leading-relaxed mb-7 max-w-[300px]">
              Your donation of{" "}
              {donationAmount ? (
                <span className="font-bold text-[#383838]">
                  {sym}{Number(donationAmount).toFixed(2)}
                </span>
              ) : "your generous amount"}{" "}
              has been processed successfully.
            </p>

            {/* Donation details box */}
            {(campaignName || causeLabel || objectiveLabel) && (
              <div className="w-full max-w-[380px] bg-[#F6F6F6] rounded-2xl px-5 py-4 mb-7 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-2">
                  Donation Details
                </p>
                {campaignName && (
                  <p className="text-[15px] font-bold text-[#383838] leading-snug">
                    {campaignName}
                  </p>
                )}
                {(causeLabel || objectiveLabel) && (
                  <p className="text-[12px] text-[#737373] mt-1">
                    {[causeLabel, objectiveLabel].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5 w-full max-w-[380px]">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                View Dashboard
              </button>

              <button
                onClick={() => router.push("/campaigns")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Browse Campaigns
              </button>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E5E5] text-[#383838] text-[13px] font-medium hover:border-gray-400 transition-colors cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>

        {/* bottom spacing so confetti images don't clip */}
        <div className="h-12" />
      </div>

      {/* ── Campaigns section ── */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 mt-8">
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
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-[480px] animate-pulse" />
            ))
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
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
      <div className="relative w-full overflow-hidden pt-[100px] lg:pt-[160px] pb-16">
        {/* Left */}
        <div className="absolute left-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image
            src="/images/left-celebration-background.png"
            alt=""
            width={320}
            height={600}
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Right */}
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image
            src="/images/right-celebration-background.png"
            alt=""
            width={320}
            height={600}
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Container */}
        <div className="relative z-20 flex items-center justify-center px-4 sm:px-6">
          <div className="relative w-full max-w-[1450px] min-h-[520px] flex flex-col md:flex-row items-center">

            {/* Image */}
            <div className="
              relative 
              w-full md:absolute 
              md:left-0 md:top-0 
              md:w-[52%] md:max-w-[764px] 
              h-[260px] sm:h-[340px] md:h-[764px] 
              rounded-[24px] overflow-hidden z-10
            ">
              <Image
                src="/images/happy-thankyou.png"
                alt="Happy children"
                fill
                sizes="(max-width: 768px) 100vw, 46vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Card */}
            <div className="relative z-20 w-full md:ml-auto md:w-[62%] md:max-w-[730px] h-auto md:h-[660px] 
              bg-white rounded-[24px] 
              shadow-[0_8px_60px_rgba(0,0,0,0.12)] 
              px-5 sm:px-8 md:px-10 
              py-6 sm:py-8 md:py-10 
              flex flex-col items-center text-center 
              mt-4 md:mt-[40px]
            ">

              {/* Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EA3335] flex items-center justify-center mb-4 shadow-lg shadow-red-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-[#383838] mb-2">
                Thank You!
              </h1>

              {/* Text */}
              <p className="text-[13px] sm:text-[14px] text-[#737373] mb-5 max-w-[320px]">
                Your donation of{" "}
                {donationAmount ? (
                  <span className="font-bold text-[#383838]">
                    {sym}{Number(donationAmount).toFixed(2)}
                  </span>
                ) : "your generous amount"}{" "}
                has been processed successfully.
              </p>

              {/* Details */}
              {(campaignName || causeLabel || objectiveLabel) && (
                <div className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 mb-5 text-left">
                  <p className="text-[10px] font-semibold uppercase text-[#AEAEAE] mb-1">
                    Donation Details
                  </p>

                  {campaignName && (
                    <p className="text-[14px] font-bold text-[#383838]">
                      {campaignName}
                    </p>
                  )}

                  {(causeLabel || objectiveLabel) && (
                    <p className="text-[12px] text-[#737373]">
                      {[causeLabel, objectiveLabel].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-2.5 w-full">
                <button className="w-full py-3 rounded-xl bg-[#383838] text-white text-[14px] font-semibold">
                  View Dashboard
                </button>

                <button className="w-full py-3 rounded-xl bg-[#383838] text-white text-[14px] font-semibold">
                  Browse Campaigns
                </button>

                <button className="w-full py-3 rounded-xl border border-[#E5E5E5] text-[#383838] text-[13px] font-medium">
                  Download Receipt
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Campaigns section */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:mt-[100px] mt-0">
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
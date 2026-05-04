"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import CampaignCard from "@/app/(site)/campaigns/components/CampaignCard";
import { arrowIcon, ThankyouIcon, ShareCampaignIcon, CircleCheckIcon } from "@/components/common/SvgIcon";
import { serverApiBase } from "@/utils/constants";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const FREQUENCY_LABELS = {
  daily:   "Daily",
  weekly:  "Weekly",
  monthly: "Monthly",
};

const ThankYouPage = () => {
  const router = useRouter();
  const { data } = useDonation();
  const { isAuthenticated } = useAuth();
  const sym = CURRENCY_SYMBOLS[data.currency] || "$";

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);

  const donationAmount = data.grandTotal ?? data.amountTier;
  const isRecurring    = data.paymentType === "recurring";
  const frequency      = FREQUENCY_LABELS[data.frequency?.toLowerCase()] ?? data.frequency ?? "";
  const numberOfDays   = data.numberOfDays ?? 0;
  const campaignTitle  = data.campaignTitle ?? "";

  // If logged in, save data to sessionStorage and redirect to donation-history with popup flag
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem("thankyouData", JSON.stringify({
        donationAmount,
        currency:     data.currency   ?? "USD",
        campaignTitle,
        isRamadan:    data.isRamadan  ?? false,
        causes:       data.causes     ?? [],
        isRecurring,
        frequency,
        numberOfDays,
        paymentType:  data.paymentType ?? "one-time",
      }));
      router.replace("/dashboard/donation-history?thankyou=1");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    fetch(`${serverApiBase}campaigns/featured`)
      .then((r) => r.json())
      .then((res) => setCampaigns(res?.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    const url = window.location.origin + "/campaigns";
    if (navigator.share) {
      await navigator.share({ title: campaignTitle || "Human Concern", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // While redirecting logged-in users, render nothing
  if (isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-[#F6F6F6] pb-20">
      <div className="relative w-full overflow-hidden pt-[100px] lg:pt-[160px] pb-16">
        {/* Left confetti */}
        <div className="absolute left-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image src="/images/left-celebration-background.png" alt="" width={320} height={600} className="h-full w-auto object-contain" />
        </div>
        {/* Right confetti */}
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image src="/images/right-celebration-background.png" alt="" width={320} height={600} className="h-full w-auto object-contain" />
        </div>

        {/* Container */}
        <div className="relative z-20 flex items-center justify-center px-4 sm:px-6">
          <div className="relative w-full max-w-[1450px] min-h-[520px] flex flex-col md:flex-row items-center">

            {/* Left image */}
            <div className="relative w-full md:absolute md:left-0 md:top-0 md:w-[52%] md:max-w-[764px] h-[260px] sm:h-[340px] md:h-[764px] rounded-[24px] overflow-hidden z-10">
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
            <div className="relative z-20 w-full md:ml-auto md:w-[62%] md:max-w-[730px] h-auto md:h-[764px] bg-white rounded-[24px] px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 flex flex-col items-center text-center mt-4 md:mt-0">
              <div className="mt-8">
                {ThankyouIcon}
              </div>

              <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-[#383838] mt-6">
                Thank You!
              </h1>

              <p className="text-[13px] sm:text-[14px] text-[#737373] mt-2 mb-5">
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
                  {/* Campaign / project name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#737373]">Project</span>
                    <span className="text-[13px] font-semibold text-[#383838]">
                      {data.isRamadan ? "Ramadan Project" : (campaignTitle || "—")}
                    </span>
                  </div>

                  {/* Causes */}
                  {(data.causes ?? []).length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Cause</span>
                      <span className="text-[13px] font-semibold text-[#383838]">
                        {data.causes.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Recurring details */}
                  {isRecurring && frequency && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Frequency</span>
                      <span className="text-[13px] font-semibold text-[#383838]">{frequency}</span>
                    </div>
                  )}
                  {isRecurring && numberOfDays > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Duration</span>
                      <span className="text-[13px] font-semibold text-[#383838]">{numberOfDays} days</span>
                    </div>
                  )}

                  {/* Amount */}
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
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  View Dashboard
                </button>

                <button
                  onClick={() => router.push("/campaigns")}
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

"use client";

import { useState } from "react";
import VideoModal from "@/components/common/VideoModal";
import { CheckIcon, VideoIcon } from "@/components/common/SvgIcon";
import Link from "next/link";
import Activity from "./components/home/Activity";
import HighlightCampaigns from "./components/home/HighlightCampaigns";
import SharedLove from "./components/home/SharedLove";
import HowItWorks from "./components/home/HowItWorks";
import WaysToGive from "./components/home/WaysToGive";
import CtaBanner from "./components/home/CtaBanner";

/* ─── Page ───── */
export default function HomePage() {

  const [openVideo, setOpenVideo] = useState(false);


  return (
    <>
      <main className="overflow-hidden text-white">
        {/* ── Hero ── */}
        <section className="relative w-full lg:h-[1200px] md:h-[750px] h-[600px] overflow-hidden">
          <div
            className="absolute inset-0 bg-[url('/images/hero.png')] bg-center bg-cover bg-no-repeat"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 60%)]"
            aria-hidden="true"
          />

          {/* ── Frosted glass card — */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-[1611px] lg:mt-[-200px] mt-[200px] mx-auto px-6 lg:px-8">
              <div className="w-full lg:max-w-[652px] bg-[#FFFFFFB2] backdrop-blur-[100px] px-[20px] py-[30px] md:px-[77px] md:py-[60px] rounded-3xl">
                <h1 className="md:text-[56px] text-3xl md:leading-[1.1] font-semibold text-[#383838] [text-shadow:0px_4px_25px_rgba(255,255,255,0.25)]">
                  Give dsadasdsds <span className="font-bold font-playfair italic">Purpose. Transform</span> lives.
                </h1>
                <p className="text-[#383838] font-medium py-5 md:py-7 text-md md:text-2xl [text-shadow:0px_0px_3px_rgba(255,255,255,1)]">
                  Your trusted platform for Zakat, Sadaqah, and humanitarian giving.
                </p>
                <div className="flex items-center gap-3 flex-wrap mb-7">
                  <Link
                    href="/campaigns"
                    className="px-6 py-3 bg-[#EA3335] hover:bg-red-700 text-white font-normal text-[18px] rounded-full transition-all duration-200 hover:-translate-y-0.5"
                  >
                    All campaigns
                  </Link>
                  <Link
                    href="/user/register"
                    className="px-6 py-3 text-[#383838] font-normal text-[18px] rounded-full border border-[#383838] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Get started
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-5 flex-wrap">
                  {["Secure Payments", "100% Zakat Compliant", "Tax Deductible"].map(
                    (label) => (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 text-[12px] md:text-[14px] text-[#383838] font-medium"
                      >
                        <span className="">
                          {CheckIcon}
                        </span>
                        {label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Watch Video ── */}
          <div className="absolute left-9/12 top-[250px] hidden lg:block">
            <button
              onClick={() => setOpenVideo(true)}
              className="group flex items-center gap-3 px-[20px] py-[15px] rounded-full backdrop-blur-[30px] hover:bg-white/30 border border-white/60 hover:border-white text-white font-normal text-[26px] transition-all duration-300 shadow-lg cursor-pointer rotate-[12deg] hover:rotate-[0deg]"
            >
              Watch Video
              <span>{VideoIcon}</span>
            </button>
          </div>
        </section>

        {/* Activity */}
        <Activity />

        {/* Featured Campaigns */}
        <HighlightCampaigns />

        {/* Shared love Section */}
        <SharedLove />

        {/* ── How It Works ── */}
        <HowItWorks />

        <WaysToGive />

        <CtaBanner />

      </main>

      {/* Video Modal */}
      <VideoModal
        isOpen={openVideo}
        onClose={() => setOpenVideo(false)}
        videoId="tX0eDRmropU"
      />
    </>
  );
}

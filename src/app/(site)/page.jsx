"use client";

import { useState } from "react";
import VideoModal from "@/components/common/VideoModal";
import { CheckIcon, VideoIcon } from "@/components/common/SvgIcon";
import Link from "next/link";
import Activity from "./components/home/Activity";
import HighlightCampaigns from "./components/home/HighlightCampaigns";
import SharedLove from "./components/home/SharedLove";
import HowItWorks from "./components/home/HowItWorks";

const steps = [
  {
    number: "01",
    title: "Discover the Need",
    description:
      "Browse verified campaigns curated by our team. Every cause is vetted for transparency and real-world impact.",
  },
  {
    number: "02",
    title: "Choose Your Cause",
    description:
      "Select a campaign that resonates with your values — from education and healthcare to clean water and shelter.",
  },
  {
    number: "03",
    title: "Track Your Impact",
    description:
      "Receive updates directly from campaign organizers and see exactly how your donation is making a difference.",
  },
];

const features = [
  {
    icon: "🛡",
    title: "100% Secure",
    desc: "Bank-grade encryption on all transactions.",
  },
  {
    icon: "📊",
    title: "Full Transparency",
    desc: "See exactly where every dollar goes.",
  },
  {
    icon: "⚡",
    title: "Instant Receipts",
    desc: "Tax-deductible receipts in seconds.",
  },
  {
    icon: "🌍",
    title: "Global Reach",
    desc: "Support causes in 40+ countries.",
  },
];

const waysToGive = [
  {
    icon: "💳",
    title: "One-Time Donation",
    description:
      "Make a single contribution to any campaign, big or small — every amount counts.",
  },
  {
    icon: "🔄",
    title: "Monthly Giving",
    description:
      "Become a sustainer. Set up recurring donations and create lasting, consistent change.",
  },
  {
    icon: "🎁",
    title: "Give in Honor",
    description:
      "Celebrate someone special by donating in their name with a beautiful tribute card.",
  },
  {
    icon: "🏢",
    title: "Corporate Matching",
    description:
      "Double your impact. Many employers match employee donations — check if yours does.",
  },
  {
    icon: "📦",
    title: "In-Kind Goods",
    description:
      "Donate goods and supplies directly to campaigns that need physical resources.",
  },
  {
    icon: "🤝",
    title: "Volunteer",
    description:
      "Give your time, skills, and energy. Volunteer with local or remote campaign teams.",
  },
];


/* ─── Page ───────────────────────────────────────── */
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
                  Give with <span className="font-bold font-playfair italic">Purpose. Transform</span> lives.
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
                    href="/register"
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
        <HowItWorks steps={steps} />

        {/* ── Turn Awareness into Action ── */}
        <section className="py-24 bg-[#050505] border-y border-white/[0.08]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-3">
                  Why HumanConcern
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
                  Turn Awareness
                  <br />
                  into Action
                </h2>
                <p className="text-[15px] text-white/45 leading-relaxed max-w-sm mb-8">
                  We built a platform where generosity is simple, safe, and
                  traceable — so you can give with full confidence.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3 bg-yellow-400 text-black font-semibold text-[15px] rounded-lg hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200 no-underline"
                >
                  Start Giving Today
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {features.map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="p-5 bg-[#161616] border border-white/[0.08] rounded-xl hover:border-yellow-400/20 transition-colors duration-200"
                  >
                    <span className="text-2xl block mb-3">{icon}</span>
                    <h4 className="text-[14px] font-bold text-white mb-1.5">
                      {title}
                    </h4>
                    <p className="text-[13px] text-white/55 m-0 leading-snug">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Ways to Give ── */}
        <section className="py-24 bg-[#0e0e0e]" id="ways-to-give">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-2">
                Flexible Giving
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
                Ways to Give
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {waysToGive.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="p-7 bg-[#161616] border border-white/[0.08] rounded-2xl hover:border-yellow-400/20 hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="text-3xl block mb-4">{icon}</span>
                  <h4 className="text-[15px] font-bold text-white tracking-tight mb-2">
                    {title}
                  </h4>
                  <p className="text-[13px] text-white/55 leading-relaxed m-0">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-20 bg-[#111111] border-t border-white/[0.08]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-10 lg:p-12 bg-gradient-to-br from-yellow-400/[0.06] to-yellow-400/[0.02] border border-yellow-400/15 rounded-2xl">
              <div>
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
                  Ready to Make a Difference?
                </h2>
                <p className="text-[15px] text-white/55 leading-relaxed m-0 max-w-lg">
                  Join thousands of donors changing lives today. Your first
                  donation could be someone's turning point.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap shrink-0">
                <Link
                  href="/donate"
                  className="px-7 py-3.5 bg-yellow-400 text-black font-semibold text-[15px] rounded-lg hover:bg-yellow-300 hover:-translate-y-0.5 transition-all no-underline"
                >
                  Donate Now
                </Link>
                <Link
                  href="/register"
                  className="px-7 py-3.5 border border-white/10 text-white/75 font-medium text-[15px] rounded-lg hover:text-white hover:bg-white/5 hover:border-white/20 transition-all no-underline"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
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

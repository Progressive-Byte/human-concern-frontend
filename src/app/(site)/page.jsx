"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VideoModal from "@/components/common/VideoModal";
import { CheckIcon, VideoIcon } from "@/components/common/SvgIcon";
import Link from "next/link";
import Activity from "./components/home/Activity";
import HighlightCampaigns from "./components/home/HighlightCampaigns";
import SharedLove from "./components/home/SharedLove";
import HowItWorks from "./components/home/HowItWorks";
import WaysToGive from "./components/home/WaysToGive";
import CtaBanner from "./components/home/CtaBanner";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(Boolean(mq.matches));
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);
  return reduced;
}

function Reveal({ children, delayMs = 0, reducedMotion = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        if (delayMs > 0) {
          setTimeout(() => setVisible(true), delayMs);
        } else {
          setVisible(true);
        }
      },
      { root: null, threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs, reducedMotion]);

  return (
    <div ref={ref} className={`hc-reveal ${visible ? "hc-reveal-in" : ""}`}>
      {children}
    </div>
  );
}

/* ─── Page ───── */
export default function HomePage() {

  const [openVideo, setOpenVideo] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const heroBgRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;
    const el = heroBgRef.current;
    if (!el) return;

    const update = () => {
      rafRef.current = null;
      const y = window.scrollY || 0;
      const shift = Math.max(-22, Math.min(46, y * 0.06));
      el.style.transform = `translate3d(0, ${shift}px, 0)`;
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const trustBadges = useMemo(
    () => ["Secure Payments", "100% Zakat Compliant", "Tax Deductible"],
    []
  );


  return (
    <>
      <main data-page="home" className="overflow-hidden text-white">
        {/* ── Hero ── */}
        <section className="relative w-full lg:h-[1200px] md:h-[750px] h-[600px] overflow-hidden">
          <div
            ref={heroBgRef}
            className="absolute inset-0 bg-[url('/images/hero.png')] bg-center bg-cover bg-no-repeat"
            aria-hidden="true"
          />
          <div className="absolute inset-0 pointer-events-none opacity-70">
            <div className="absolute inset-0 hc-aurora" aria-hidden="true" />
          </div>
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
                    className="px-6 py-3 bg-[#EA3335] hover:bg-red-700 text-white font-normal text-[18px] rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(234,51,53,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    All campaigns
                  </Link>
                  <Link
                    href="/user/register"
                    className="px-6 py-3 text-[#383838] font-normal text-[18px] rounded-full border border-[#383838] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#383838]/30"
                  >
                    Get started
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-5 flex-wrap">
                  {trustBadges.map(
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
              className={`group flex items-center gap-3 px-[20px] py-[15px] rounded-full backdrop-blur-[30px] hover:bg-white/30 border border-white/60 hover:border-white text-white font-normal text-[26px] transition-all duration-300 shadow-lg cursor-pointer rotate-[12deg] hover:rotate-[0deg] hover:shadow-[0_22px_55px_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${reducedMotion ? "" : "hc-float"}`}
            >
              Watch Video
              <span>{VideoIcon}</span>
            </button>
          </div>
        </section>

        {/* Activity */}
        <Reveal reducedMotion={reducedMotion}>
          <Activity />
        </Reveal>

        {/* Featured Campaigns */}
        <Reveal delayMs={60} reducedMotion={reducedMotion}>
          <HighlightCampaigns />
        </Reveal>

        {/* Shared love Section */}
        <Reveal delayMs={60} reducedMotion={reducedMotion}>
          <SharedLove />
        </Reveal>

        {/* ── How It Works ── */}
        <Reveal delayMs={60} reducedMotion={reducedMotion}>
          <HowItWorks />
        </Reveal>

        <Reveal delayMs={60} reducedMotion={reducedMotion}>
          <WaysToGive />
        </Reveal>

        <Reveal delayMs={60} reducedMotion={reducedMotion}>
          <CtaBanner />
        </Reveal>

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

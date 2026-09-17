"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VideoModal from "@/components/common/VideoModal";
import { CheckIcon, VideoIcon } from "@/components/common/SvgIcon";
import Link from "next/link";
import { useHomepageContent } from "@/context/HomepageContentContext";
import { resolveHomepageImage } from "@/utils/homepageDefaults";
import { youtubeIdFromUrl } from "@/utils/youtube";
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
const HomePage = () => {

  const content = useHomepageContent();
  const hero = content?.sections?.hero || {};
  const sections = content?.sections || {};

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

  const trustBadges = Array.isArray(hero.trustBadges) ? hero.trustBadges : [];

  return (
    <>
      <main data-page="home" className="overflow-hidden text-white">
        {/* ── Hero ── */}
        {hero.enabled === false ? null : (
        <section className="relative w-full h-[520px] sm:h-[620px] md:h-[750px] lg:h-[950px] xl:h-[1200px] overflow-hidden">
          <div
            ref={heroBgRef}
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${resolveHomepageImage(hero.backgroundImage, "/images/hero.png")})` }}
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
            <div className="w-full max-w-[1611px] mt-27 sm:mt-27 md:mt-27 lg:mt-[-108px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="w-full md:max-w-[560px] lg:max-w-[652px] bg-[#FFFFFFB2] backdrop-blur-[100px] px-4 py-5 sm:px-6 sm:py-6 md:px-[77px] md:py-[60px] rounded-3xl">
                <h1 className="text-2xl sm:text-3xl md:text-[56px] md:leading-[1.1] font-semibold text-[#383838] leading-tight [text-shadow:0px_4px_25px_rgba(255,255,255,0.25)]">
                  {hero.title || "Give with"}{" "}
                  {hero.titleAccent ? <span className="font-bold font-playfair italic">{hero.titleAccent}</span> : null}
                </h1>
                <p className="text-[#383838] font-medium py-4 sm:py-5 md:py-7 text-sm sm:text-base md:text-2xl [text-shadow:0px_0px_3px_rgba(255,255,255,1)]">
                  {hero.subtitle || "Your trusted platform for Zakat, Sadaqah, and humanitarian giving."}
                </p>
                <div className="flex items-center gap-3 flex-wrap mb-5 sm:mb-7">
                  {hero.primaryButton?.label ? (
                    <Link
                      href={hero.primaryButton.href || "/campaigns"}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-[#EA3335] hover:bg-red-700 text-white font-normal text-[15px] sm:text-[18px] rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(234,51,53,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      {hero.primaryButton.label}
                    </Link>
                  ) : null}
                  {hero.secondaryButton?.label ? (
                    <Link
                      href={hero.secondaryButton.href || "/user/register"}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-[#383838] font-normal text-[15px] sm:text-[18px] rounded-full border border-[#383838] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#383838]/30"
                    >
                      {hero.secondaryButton.label}
                    </Link>
                  ) : null}
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-2 sm:gap-5 flex-wrap">
                  {trustBadges.map(
                    (label) => (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 text-[11px] sm:text-[12px] md:text-[14px] text-[#383838] font-medium"
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
          {youtubeIdFromUrl(hero.videoUrl) ? (
          <div className="absolute left-9/12 top-[250px] hidden lg:block">
            <button
              onClick={() => setOpenVideo(true)}
              className={`group flex items-center gap-3 px-[20px] py-[15px] rounded-full backdrop-blur-[30px] hover:bg-white/30 border border-white/60 hover:border-white text-white font-normal text-[26px] transition-all duration-300 shadow-lg cursor-pointer rotate-[12deg] hover:rotate-[0deg] hover:shadow-[0_22px_55px_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${reducedMotion ? "" : "hc-float"}`}
            >
              Watch Video
              <span>{VideoIcon}</span>
            </button>
          </div>
          ) : null}
        </section>
        )}

        {/* Activity */}
        {sections.stats?.enabled === false ? null : (
          <Reveal reducedMotion={reducedMotion}>
            <Activity />
          </Reveal>
        )}

        {/* Featured Campaigns */}
        {sections.featured?.enabled === false ? null : (
          <Reveal delayMs={60} reducedMotion={reducedMotion}>
            <HighlightCampaigns />
          </Reveal>
        )}

        {/* Shared love Section */}
        {sections.sharedLove?.enabled === false ? null : (
          <Reveal delayMs={60} reducedMotion={reducedMotion}>
            <SharedLove />
          </Reveal>
        )}

        {/* ── How It Works ── */}
        {sections.howItWorks?.enabled === false ? null : (
          <Reveal delayMs={60} reducedMotion={reducedMotion}>
            <HowItWorks />
          </Reveal>
        )}

        {sections.waysToGive?.enabled === false ? null : (
          <Reveal delayMs={60} reducedMotion={reducedMotion}>
            <WaysToGive />
          </Reveal>
        )}

        {sections.ctaBanner?.enabled === false ? null : (
          <Reveal delayMs={60} reducedMotion={reducedMotion}>
            <CtaBanner />
          </Reveal>
        )}

      </main>

      {/* Video Modal */}
      <VideoModal
        isOpen={openVideo}
        onClose={() => setOpenVideo(false)}
        videoId={youtubeIdFromUrl(hero.videoUrl)}
      />
    </>
  );
}
export default HomePage;
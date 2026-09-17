"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useHomepageContent } from "@/context/HomepageContentContext";
import { resolveHomepageImage } from "@/utils/homepageDefaults";

const overlay = "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out bg-gradient-to-br from-[#055A46]/10 to-transparent pointer-events-none z-[1]";

// Layout for the first five bento cards; the sixth is rendered separately (horizontal card).
const CARD_LAYOUT = [
  {
    wrap: "bg-white rounded-[20px] overflow-hidden flex flex-col sm:row-span-1 lg:row-span-2",
    delay: "160ms",
    body: "p-6 mt-4 ml-1",
    imgWrap: "flex-1 flex items-center justify-center",
    imgBox: "hc-float-soft-2 motion-reduce:animate-none lg:-ml-[220px]",
    imgDelay: "0ms",
    imgClass: "w-[150%] sm:w-[128%] lg:w-[255%] max-w-none",
  },
  {
    wrap: "bg-white rounded-[20px] overflow-hidden flex flex-col",
    delay: "280ms",
    body: "p-6 mt-4 ml-1",
    imgWrap: "flex-1 flex items-center justify-center",
    imgBox: "hc-float-soft-2 motion-reduce:animate-none lg:-mt-4",
    imgDelay: "180ms",
    imgClass: "w-[90%] sm:w-[84%] lg:w-[165%]",
  },
  {
    wrap: "bg-white rounded-[20px] overflow-hidden flex flex-col",
    delay: "400ms",
    body: "p-6 mt-4 ml-1",
    imgWrap: "flex-1 flex items-center justify-center pb-4",
    imgBox: "hc-float-soft-3 motion-reduce:animate-none",
    imgDelay: "320ms",
    imgClass: "w-3/6",
  },
  {
    wrap: "bg-white rounded-[20px] overflow-hidden flex flex-col",
    delay: "520ms",
    body: "p-6 mt-4 ml-1",
    imgWrap: "flex-1 flex items-center justify-center mt-0 sm:mt-4 lg:mt-[70px]",
    imgBox: "hc-float-soft motion-reduce:animate-none",
    imgDelay: "260ms",
    imgClass: "w-3/6",
  },
  {
    wrap: "bg-white rounded-[20px] overflow-hidden flex flex-col lg:row-span-2 lg:col-start-3 lg:row-start-2",
    delay: "640ms",
    body: "p-6",
    bodyText: "mr-0 lg:mr-[80px]",
    imgWrap: "flex-1 flex items-end justify-end sm:justify-center lg:justify-center pt-4 pb-0 min-h-[200px] lg:min-h-[260px]",
    imgBox: "hc-float-soft-2 motion-reduce:animate-none ml-[20%] sm:ml-0 lg:ml-0",
    imgDelay: "120ms",
    imgClass: "w-full",
  },
];

const WaysToGive = () => {
  const content = useHomepageContent();
  const section = content?.sections?.waysToGive;
  const cards = Array.isArray(section?.cards) ? section.cards : [];

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setInView(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setInView(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  const revealBase =
    "hc-reveal motion-reduce:transition-none transition-[transform,opacity,filter] duration-[700ms] ease-out";
  const revealIn = inView ? "hc-reveal-in" : "";
  const cardHover = "group relative";
  const imgHover = "transition-transform duration-500 ease-in-out group-hover:scale-105";

  if (section?.enabled === false) return null;

  const last = cards[5];

  return (

    <section ref={sectionRef} className="lg:py-[130px] md:py-[100px] py-20 bg-[#F6F6F6]" id="ways-to-give">
        <div className="max-w-[1350px] mx-auto px-6 md:px-3 xl:px-0">
            <div className={`${revealBase} ${revealIn} text-center mb-12`} style={{ transitionDelay: "0ms" }}>
                <h2 className="text-2xl lg:text-[28px] font-bold text-[#1A1A1A] m-0 tracking-tight">
                    {section?.title || "Ways to Give"}
                </h2>
                <p className="text-[15px] text-[#737373] mt-3 mb-0 leading-relaxed">
                    {section?.subtitle || "Multiple donation types to fulfill your religious obligations and charitable aspirations."}
                </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 xl:gap-8">
                {CARD_LAYOUT.map((cfg, i) => {
                  const card = cards[i];
                  if (!card) return null;
                  return (
                    <div key={i} className={`${revealBase} ${revealIn} ${cfg.wrap} ${cardHover}`} style={{ transitionDelay: cfg.delay }}>
                        <div className={overlay} />
                        <div className={cfg.body}>
                            <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">{card.title}</h4>
                            <p className={`text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899] ${cfg.bodyText || ""}`}>
                                {card.description}
                            </p>
                        </div>
                        <div className={cfg.imgWrap}>
                            <div className={cfg.imgBox} style={{ animationDelay: cfg.imgDelay }}>
                                <img src={resolveHomepageImage(card.image)} alt={card.image?.alt || card.title || ""} className={`${cfg.imgClass} object-contain ${imgHover}`} />
                            </div>
                        </div>
                    </div>
                  );
                })}

                {last ? (
                  <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-col md:flex-row items-start sm:col-span-2 lg:col-span-2 lg:col-start-1 lg:row-start-3 ${cardHover}`} style={{ transitionDelay: "760ms" }}>
                      <div className={overlay} />
                      <div className="p-6 sm:p-7 flex-1 w-full">
                      <h4 className="text-[20px] lg:text-[32px] font-semibold text-[#383838]">{last.title}</h4>
                      <p className="text-[13px] lg:text-[18px] font-semibold text-[#38383899]">
                          {last.description}
                      </p>
                      </div>
                      <div className="flex-[0_0_auto] md:flex-1 flex items-end justify-center md:justify-end pt-2 md:pt-4 shrink-0 max-h-[200px] md:max-h-[260px] w-full md:w-auto self-end">
                      <div className="hc-float-soft-3 motion-reduce:animate-none w-full md:w-auto flex justify-center md:justify-end" style={{ animationDelay: "420ms" }}>
                        <img src={resolveHomepageImage(last.image)} alt={last.image?.alt || last.title || ""} className={`h-full max-h-[200px] md:max-h-[260px] w-auto object-contain ${imgHover}`} />
                      </div>
                      </div>
                  </div>
                ) : null}
            </div>
        </div>
    </section>
  )
}

export default WaysToGive

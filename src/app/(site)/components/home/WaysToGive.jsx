"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WaysToGive = () => {
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
    "hc-reveal motion-reduce:transition-none transition-[transform,opacity,filter] duration-[700ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]";
  const revealIn = inView ? "hc-reveal-in" : "";
  const cardHover =
    "group transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-[transform] hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,0,0,0.14)]";
  const imgHover =
    "transform-gpu scale-100 will-change-transform transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-1";
  const zakatImgSize = "w-[120%] sm:w-[128%] lg:w-[255%] max-w-none";
  const sadaqahImgSize = "w-[78%] sm:w-[84%] lg:w-[165%]";

  return (

    <section ref={sectionRef} className="lg:py-[130px] md:py-[100px] py-20 bg-[#F6F6F6]" id="ways-to-give">
        <div className="max-w-[1350px] mx-auto px-6 md:px-3 xl:px-0">
            <div className={`${revealBase} ${revealIn} text-center mb-12`} style={{ transitionDelay: "0ms" }}>
                <h2 className="text-2xl lg:text-[28px] font-bold text-[#1A1A1A] m-0 tracking-tight">
                    Ways to Give
                </h2>
                <p className="text-[15px] text-[#737373] mt-3 mb-0 leading-relaxed">
                    Multiple donation types to fulfill your religious <br className="hidden sm:block" />
                    obligations and charitable aspirations.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 md:gap-4">
                <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-col sm:row-span-1 lg:row-span-2 ${cardHover}`} style={{ transitionDelay: "160ms" }}>
                    <div className="p-6 mt-4 ml-1">
                        <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Zakat</h4>
                        <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                            Obligatory charity for eligible Muslims. Pay your Zakat to purify your wealth.
                        </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="hc-float-soft-2 motion-reduce:animate-none -ml-55" style={{ animationDelay: "0ms" }}>
                          <img src="/images/zakat.png" alt="Zakat" className={`${zakatImgSize} object-contain ${imgHover}`} />
                        </div>
                    </div>
                </div>
                <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-col ${cardHover}`} style={{ transitionDelay: "280ms" }}>
                    <div className="p-6 mt-4 ml-1">
                    <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Sadaqah</h4>
                    <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                        Voluntary charity that can be given at any time to aid those in need.
                    </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="hc-float-soft-2 motion-reduce:animate-none -mt-4" style={{ animationDelay: "180ms" }}>
                          <img src="/images/sadaqah.png" alt="Sadaqah" className={`${sadaqahImgSize} object-contain ${imgHover}`} />
                        </div>
                    </div>
                </div>
                <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-col ${cardHover}`} style={{ transitionDelay: "400ms" }}>
                    <div className="p-6 mt-4 ml-1">
                        <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Emergency Relief</h4>
                        <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                            Rapid responses and aid to disaster areas to help communities recover.
                        </p>
                        </div>
                    <div className="flex-1 flex items-center justify-center pb-4">
                        <div className="hc-float-soft-3 motion-reduce:animate-none" style={{ animationDelay: "320ms" }}>
                          <img src="/images/relief.png" alt="Emergency Relief" className={`w-3/6 object-contain ${imgHover}`} />
                        </div>
                    </div>
                </div>
                <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-col ${cardHover}`} style={{ transitionDelay: "520ms" }}>
                    <div className="p-6 mt-4 ml-1">
                        <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Water Aid</h4>
                        <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                            Build sustainable wells and systems to provide clean, safe water for entire villages.
                        </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center mt-[70px]">
                    <div className="hc-float-soft motion-reduce:animate-none" style={{ animationDelay: "260ms" }}>
                      <img src="/images/water-aid.png" alt="Water Aid" className={`w-3/6 object-contain ${imgHover}`} />
                    </div>
                    </div>
                </div>
                <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-col lg:row-span-2 lg:col-start-3 lg:row-start-2 ${cardHover}`} style={{ transitionDelay: "640ms" }}>
                    <div className="p-6">
                    <h4 className="text-[20px] lg:text-[32px] font-semibold text-[#383838]">Food Aid</h4>
                    <p className="text-[13px] lg:text-[18px] mr-[80px] font-semibold text-[#38383899]">
                        Deliver life-saving meals and nutrition packs to families facing hunger and crisis.
                    </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[200px] lg:min-h-[260px]">
                    <div className="hc-float-soft-2 motion-reduce:animate-none" style={{ animationDelay: "120ms" }}>
                      <img src="/images/food-aid.png" alt="Food Aid" className={`w-full object-contain ${imgHover}`} />
                    </div>
                    </div>
                </div>
                <div className={`${revealBase} ${revealIn} bg-white rounded-[20px] overflow-hidden flex flex-row items-start sm:col-span-2 lg:col-span-2 lg:col-start-1 lg:row-start-3 ${cardHover}`} style={{ transitionDelay: "760ms" }}>
                    <div className="p-7 flex-1">
                    <h4 className="text-[20px] lg:text-[32px] font-semibold text-[#383838]">Child Sponsorship</h4>
                    <p className="text-[13px] lg:text-[18px] font-semibold text-[#38383899]">
                        Provide education, healthcare, and daily essentials to transform an orphan's life.
                    </p>
                    </div>
                    <div className="flex-1 flex items-end justify-end pt-4 shrink-0">
                    <div className="hc-float-soft-3 motion-reduce:animate-none" style={{ animationDelay: "420ms" }}>
                      <img src="/images/child-sponsorship.png" alt="Child Sponsorship" className={`w-full object-contain ${imgHover}`} />
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default WaysToGive

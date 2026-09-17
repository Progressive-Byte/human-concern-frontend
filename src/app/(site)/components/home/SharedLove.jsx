"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHomepageContent } from "@/context/HomepageContentContext";
import { resolveHomepageImage } from "@/utils/homepageDefaults";

const SharedLove = () => {
  const content = useHomepageContent();
  const section = content?.sections?.sharedLove;
  const sectionImages = Array.isArray(section?.images) ? section.images : [];
  const imgSrc = (n) => resolveHomepageImage(sectionImages[n - 1], `/images/love-${n}.png`);

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const delays = useMemo(
    () => ({
      "love-1": 0,
      "love-5": 100,
      "love-2": 200,
      "love-4": 300,
      "love-3": 400,
      "love-6": 500,
      "love-9": 600,
      "love-8": 700,
      "love-7": 800,
    }),
    []
  );

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
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  const itemBase =
    "hc-reveal motion-reduce:transition-none transition-[transform,opacity,filter,box-shadow] duration-[650ms] ease-out";
  const itemIn = inView ? "hc-reveal-in" : "";
  const hoverWrap = "group";
  const hoverImg =
    "object-cover transition duration-500 ease-in-out motion-reduce:transition-none group-hover:scale-[1.08] group-hover:brightness-75";

  if (section?.enabled === false) return null;

  return (
    <section ref={sectionRef} className="pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-[116px] lg:pb-[70px] bg-white" id="shared-love">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-0">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14 px-2 sm:px-0">
          <p className="text-[18px] sm:text-[20px] font-semibold text-[#616161] mb-2">
            {section?.eyebrow || "Our Global Impact"}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#383838] m-0">
            {section?.title || "#Sharedlove"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_2fr_1.5fr_1.6fr_0.9fr] lg:grid-rows-[repeat(20,_26px)] gap-4" >
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[290px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[382px] rounded-2xl lg:rounded-none lg:rounded-r-2xl overflow-hidden lg:col-[1] lg:row-[1/10] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-1"]}ms` }}>
                <Image src={imgSrc(1)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[391px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[323px] rounded-2xl lg:rounded-none lg:rounded-r-2xl overflow-hidden lg:col-[1] lg:row-[10/21] lg:mt-[25px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-6"]}ms` }}>
                <Image src={imgSrc(6)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[472px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[312px] lg:rounded-l-2xl rounded-2xl overflow-hidden lg:col-[2] lg:row-[3/15] lg:ml-[-90px] lg:mt-[-15px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-2"]}ms` }}>
                <Image src={imgSrc(2)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[385px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[242px] lg:rounded-l-2xl rounded-2xl overflow-hidden lg:col-[2] lg:row-[16/21] lg:mt-[-225px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-7"]}ms` }}>
                <Image src={imgSrc(7)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[315px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[392px] rounded-2xl overflow-hidden lg:col-[3] lg:row-[5/19] lg:ml-[7px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-3"]}ms` }}>
                <Image src={imgSrc(3)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[300px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[348px] rounded-2xl overflow-hidden lg:col-[4] lg:row-[3/9] lg:ml-[8px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-4"]}ms` }}>
                <Image src={imgSrc(4)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[198px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[242px] rounded-2xl overflow-hidden lg:col-[4] lg:row-[11/15] lg:mt-[30px] lg:ml-[8px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-8"]}ms` }}>
                <Image src={imgSrc(8)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[268px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[196px] rounded-2xl overflow-hidden lg:col-[6] lg:row-[10/21] lg:ml-[-118px] lg:mt-[72px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-9"]}ms` }}>
                <Image src={imgSrc(9)} alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[435px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[433px] rounded-2xl lg:rounded-none lg:rounded-l-2xl overflow-hidden lg:col-[6] lg:row-[1/19] lg:ml-[-15px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-5"]}ms` }}>
                <Image src={imgSrc(5)} alt="" fill className={hoverImg} />
            </div>
        </div>
      </div>
    </section>
  );
};

export default SharedLove;

 "use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const SharedLove = () => {
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
  const hoverWrap =
    "group will-change-transform transition duration-500 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.18)]";
  const hoverImg =
    "object-cover transition duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03] group-hover:brightness-90";

  return (
    <section ref={sectionRef} className="pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-[116px] lg:pb-[70px] bg-white" id="shared-love">
      <div className="w-full mx-auto px-2 lg:px-0 ">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[18px] sm:text-[20px] font-semibold text-[#616161] mb-2">
            Our Global Impact
          </p>
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#383838] m-0">
            #Sharedlove
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_2fr_1.5fr_1.6fr_0.9fr] lg:grid-rows-[repeat(20,_26px)] gap-4" >
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[290px] h-[250px] lg:h-[382px] rounded-2xl lg:rounded-none lg:rounded-r-2xl overflow-hidden lg:col-[1] lg:row-[1/10] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-1"]}ms` }}>
                <Image src="/images/love-1.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[391px] h-[250px] lg:h-[323px] rounded-2xl lg:rounded-none lg:rounded-r-2xl overflow-hidden lg:col-[1] lg:row-[10/21] lg:mt-[25px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-6"]}ms` }}>
                <Image src="/images/love-6.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[472px] h-[250px] lg:h-[312px] lg:rounded-l-2xl rounded-2xl overflow-hidden lg:col-[2] lg:row-[3/15] lg:ml-[-90px] lg:mt-[-15px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-2"]}ms` }}>
                <Image src="/images/love-2.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[385px] h-[250px] lg:h-[242px] lg:rounded-l-2xl rounded-2xl overflow-hidden lg:col-[2] lg:row-[16/21] lg:mt-[-225px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-7"]}ms` }}>
                <Image src="/images/love-7.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[315px] h-[250px] lg:h-[392px] rounded-2xl overflow-hidden lg:col-[3] lg:row-[5/19] lg:ml-[7px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-3"]}ms` }}>
                <Image src="/images/love-3.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[300px] h-[250px] lg:h-[348px] rounded-2xl overflow-hidden lg:col-[4] lg:row-[3/9] lg:ml-[8px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-4"]}ms` }}>
                <Image src="/images/love-4.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[198px] h-[250px] lg:h-[242px] rounded-2xl overflow-hidden lg:col-[4] lg:row-[11/15] lg:mt-[30px] lg:ml-[8px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-8"]}ms` }}>
                <Image src="/images/love-8.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[268px] h-[250px] lg:h-[196px] rounded-2xl overflow-hidden lg:col-[6] lg:row-[10/21] lg:ml-[-118px] lg:mt-[72px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-9"]}ms` }}>
                <Image src="/images/love-9.png" alt="" fill className={hoverImg} />
            </div>
            <div className={`${itemBase} ${itemIn} relative w-full lg:w-[435px] h-[250px] lg:h-[433px] rounded-2xl lg:rounded-none lg:rounded-l-2xl overflow-hidden lg:col-[6] lg:row-[1/19] lg:ml-[-15px] ${hoverWrap}`} style={{ transitionDelay: `${delays["love-5"]}ms` }}>
                <Image src="/images/love-5.png" alt="" fill className={hoverImg} />
            </div>
        </div>
      </div>
    </section>
  );
};

export default SharedLove;

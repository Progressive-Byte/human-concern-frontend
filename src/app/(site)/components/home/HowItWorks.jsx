"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const HowItWorks = () => {

const sectionRef = useRef(null);
const [inView, setInView] = useState(false);

const reducedMotion = useMemo(() => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}, []);

const steps = [
  {
    signUpText: "Sign up &",
    title: "Choose Your Cause",
    description:
      "Select from Zakat, Sadaqah, emergency relief, or specific campaigns that align with your giving goals.",
    bg: "/images/cause-card.png",
  },
  {
    signUpText: "Sign up or Login to",
    title: "Donate Securely",
    description:
      "SMake one-time or recurring donations with secure payment processing. Set up automated giving schedules.",
    bg: "/images/security-card.png",
  },
  {
    signUpText: "Login and",
    title: "Track Your Impact",
    description:
      "Monitor your giving history, see where your donations go, and understand the real impact you're making.",
    bg: "/images/impact-card.png",
  },
];

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
const cardHover = "group";
const iconHover =
  "transition-transform duration-500 ease-in-out will-change-transform group-hover:-translate-y-1 group-hover:rotate-2";

  return (
    <section className="pt-[60px] pb-[80px] sm:pt-[80px] sm:pb-[100px] lg:pt-[140px] lg:pb-[170px] bg-[url('/images/bg/how-it-works.png')] bg-cover bg-center"
      id="how-it-works"
      ref={sectionRef}
    >
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className={`${revealBase} ${revealIn} text-center mb-10 sm:mb-14`} style={{ transitionDelay: "0ms" }}>
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-white">
            How It Works
          </h2>
          <p className="text-sm sm:text-[18px] text-white mt-2">
            Simple, secure, and transparent donation process
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-[18px]">
          {steps.map(({ signUpText, title, description, bg }, index) => (
            <div
              key={signUpText}
              className={`${revealBase} ${revealIn} group relative bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden h-full px-5 py-6 sm:px-6 sm:py-8 lg:px-[57px] lg:py-[42px] border border-transparent ${cardHover}`}
              style={{ backgroundImage: `url(${bg})`, transitionDelay: `${180 + index * 200}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

              <div
                className={`pointer-events-none absolute top-4 right-4 z-10 h-14 w-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white/50 flex items-center justify-center ${index === 0 ? "hc-float-soft" : index === 1 ? "hc-float-soft-2" : "hc-float-soft-3"} ${iconHover}`}
                style={{ animationDelay: index === 0 ? "0ms" : index === 1 ? "260ms" : "520ms" }}
                aria-hidden="true"
              >
                {index === 0 ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                    <path
                      d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : index === 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                    <path
                      d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                    <path
                      d="M12 12V3a9 9 0 1 1-9 9h9z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-xs sm:text-sm text-white mb-1">
                  {signUpText}
                </div>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">
                  {title}
                </h3>

                <p className="text-sm text-[#A5A5A5] leading-relaxed pr-[120px] sm:pr-9 lg:pr-[90px]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

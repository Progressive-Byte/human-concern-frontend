"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const AUTOPLAY_MS = 5000;

function Chevron({ direction }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Campaign image slider.
 *
 * `images` is the ordered gallery: the form thumbnail first, then the slider images.
 * The hero shows the active image; the strip below switches to any image on click.
 * Arrows overlay the hero, autoplay advances every few seconds and wraps around,
 * and it pauses while the pointer/focus is inside.
 *
 * `overlay` renders on top of the hero (badges), `children` renders between the hero
 * and the thumbnail strip — so the page keeps its existing title order.
 */
const CampaignGallery = ({ images = [], alt = "", overlay = null, className = "", children = null }) => {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  const count = list.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Clamp derived from props (no reset effect needed if the image list changes).
  const active = count > 0 ? Math.min(index, count - 1) : 0;

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, count]);

  if (count === 0) return children;

  const go = (delta) => setIndex((i) => (Math.min(i, count - 1) + delta + count) % count);

  return (
    <div className={className}>
      <div
        className="relative h-[240px] sm:h-[350px] md:h-[490px] rounded-3xl overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {list.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 1000px"
            className={`object-cover ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {overlay ? (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-wrap gap-2">
            {overlay}
          </div>
        ) : null}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#383838] shadow transition hover:bg-white cursor-pointer"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#383838] shadow transition hover:bg-white cursor-pointer"
            >
              <Chevron direction="right" />
            </button>
          </>
        ) : null}
      </div>

      {children}

      {count > 1 ? (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {list.map((src, i) => (
            <button
              key={`thumb-${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={`relative w-[160px] h-[100px] shrink-0 rounded-xl overflow-hidden transition cursor-pointer ${
                i === active ? "ring-2 ring-[#EA3335] ring-offset-2" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CampaignGallery;

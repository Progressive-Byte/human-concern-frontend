import Image from "next/image";
import React from "react";

const SharedLove = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-[116px] bg-white" id="shared-love">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[18px] sm:text-[20px] font-semibold text-[#616161] mb-2">
            Our Global Impact
          </p>
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#383838] m-0">
            #Sharedlove
          </h2>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DESKTOP GRID  (lg+)
            5 columns | 20 explicit rows of 26px | gap 8px
            Each image placed at specific row lines to create
            the staggered / collage vertical offsets
            ───────────────────────────────────────────────────────────── */}
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: "1fr 2fr 1.5fr 1.6fr 1.9fr",
            gridTemplateRows: "repeat(20, 26px)",
            gap: "8px",
          }}
        >
          {/* love-1 — top-left short landscape */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "1", gridRow: "1 / 6" }}
          >
            <Image
              src="/images/love-1.png"
              alt="Shared love 1"
              fill
              sizes="10vw"
              className="object-cover"
            />
          </div>

          {/* love-5 — bottom-left portrait
              rows 10-21 → visible gap between love-1 (ends row 6) and this */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "1", gridRow: "10 / 21" }}
          >
            <Image
              src="/images/love-5.png"
              alt="Shared love 5"
              fill
              sizes="10vw"
              className="object-cover"
            />
          </div>

          {/* love-2 — second column tall portrait
              starts at row 3 (offset lower than love-1) */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "2", gridRow: "3 / 15" }}
          >
            <Image
              src="/images/love-2.png"
              alt="Shared love 2"
              fill
              sizes="18vw"
              className="object-cover"
            />
          </div>

          {/* love-6 — below love-2, no gap */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "2", gridRow: "16 / 21" }}
          >
            <Image
              src="/images/love-6.png"
              alt="Shared love 6"
              fill
              sizes="18vw"
              className="object-cover"
            />
          </div>

          {/* love-7 — CENTER FEATURED with blue border + like counter
              starts at row 6 — big empty space above it is intentional */}
          <div
            className="relative rounded-2xl overflow-hidden border-[3px] border-[#4A90D9]"
            style={{ gridColumn: "3", gridRow: "6 / 19" }}
          >
            <Image
              src="/images/love-7.png"
              alt="Shared love 7"
              fill
              sizes="14vw"
              className="object-cover"
            />
            {/* Like counter pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md whitespace-nowrap">
              <span className="text-[13px] font-semibold text-gray-700">295</span>
              <span className="w-5 h-5 rounded-full bg-[#4A90D9] flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span className="text-[13px] font-semibold text-gray-700">392</span>
            </div>
          </div>

          {/* love-3 — top of fourth column, landscape */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "4", gridRow: "1 / 9" }}
          >
            <Image
              src="/images/love-3.png"
              alt="Shared love 3"
              fill
              sizes="15vw"
              className="object-cover"
            />
          </div>

          {/* love-8 — middle fourth column, small square */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "4", gridRow: "10 / 15" }}
          >
            <Image
              src="/images/love-8.png"
              alt="Shared love 8"
              fill
              sizes="15vw"
              className="object-cover"
            />
          </div>

          {/* love-9 — bottom fourth column */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "4", gridRow: "16 / 21" }}
          >
            <Image
              src="/images/love-9.png"
              alt="Shared love 9"
              fill
              sizes="15vw"
              className="object-cover"
            />
          </div>

          {/* love-4 — far right, very tall, starts from top */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ gridColumn: "5", gridRow: "1 / 19" }}
          >
            <Image
              src="/images/love-4.png"
              alt="Shared love 4"
              fill
              sizes="17vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TABLET GRID  (sm → lg)
            3 columns | explicit rows of 28px | staggered feel
            ───────────────────────────────────────────────────────────── */}
        <div
          className="hidden sm:grid lg:hidden"
          style={{
            gridTemplateColumns: "1fr 1.4fr 1.2fr",
            gridTemplateRows: "repeat(22, 22px)",
            gap: "8px",
          }}
        >
          {/* love-1 top-left */}
          <div className="relative rounded-2xl overflow-hidden" style={{ gridColumn: "1", gridRow: "1 / 7" }}>
            <Image src="/images/love-1.png" alt="" fill sizes="30vw" className="object-cover" />
          </div>
          {/* love-5 bottom-left */}
          <div className="relative rounded-2xl overflow-hidden" style={{ gridColumn: "1", gridRow: "10 / 23" }}>
            <Image src="/images/love-5.png" alt="" fill sizes="30vw" className="object-cover" />
          </div>

          {/* love-7 CENTER FEATURED */}
          <div className="relative rounded-2xl overflow-hidden border-[3px] border-[#4A90D9]" style={{ gridColumn: "2", gridRow: "4 / 20" }}>
            <Image src="/images/love-7.png" alt="" fill sizes="40vw" className="object-cover" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 rounded-full px-3 py-1.5 shadow-md whitespace-nowrap">
              <span className="text-[12px] font-semibold text-gray-700">295</span>
              <span className="w-4 h-4 rounded-full bg-[#4A90D9] flex items-center justify-center shrink-0">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span className="text-[12px] font-semibold text-gray-700">392</span>
            </div>
          </div>
          {/* love-6 below center */}
          <div className="relative rounded-2xl overflow-hidden" style={{ gridColumn: "2", gridRow: "21 / 23" }}>
            <Image src="/images/love-6.png" alt="" fill sizes="40vw" className="object-cover" />
          </div>

          {/* love-4 right tall */}
          <div className="relative rounded-2xl overflow-hidden" style={{ gridColumn: "3", gridRow: "1 / 17" }}>
            <Image src="/images/love-4.png" alt="" fill sizes="30vw" className="object-cover" />
          </div>
          {/* love-9 bottom right */}
          <div className="relative rounded-2xl overflow-hidden" style={{ gridColumn: "3", gridRow: "18 / 23" }}>
            <Image src="/images/love-9.png" alt="" fill sizes="30vw" className="object-cover" />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MOBILE GRID  (< sm)
            2 columns | love-7 full-width hero at top
            ───────────────────────────────────────────────────────────── */}
        <div className="grid sm:hidden grid-cols-2 gap-2.5">
          {/* love-7 featured — spans both columns */}
          <div className="relative col-span-2 h-[200px] rounded-2xl overflow-hidden border-[2.5px] border-[#4A90D9]">
            <Image src="/images/love-7.png" alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 rounded-full px-2.5 py-1 shadow whitespace-nowrap">
              <span className="text-[11px] font-semibold text-gray-700">295</span>
              <span className="w-4 h-4 rounded-full bg-[#4A90D9] flex items-center justify-center shrink-0">
                <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span className="text-[11px] font-semibold text-gray-700">392</span>
            </div>
          </div>

          {[
            { src: "/images/love-1.png", h: "h-[140px]" },
            { src: "/images/love-2.png", h: "h-[200px]" },
            { src: "/images/love-3.png", h: "h-[200px]" },
            { src: "/images/love-4.png", h: "h-[140px]" },
            { src: "/images/love-5.png", h: "h-[140px]" },
            { src: "/images/love-6.png", h: "h-[140px]" },
            { src: "/images/love-8.png", h: "h-[140px]" },
            { src: "/images/love-9.png", h: "h-[140px]" },
          ].map(({ src, h }, i) => (
            <div key={i} className={`relative ${h} rounded-2xl overflow-hidden`}>
              <Image src={src} alt="" fill sizes="50vw" className="object-cover" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SharedLove;
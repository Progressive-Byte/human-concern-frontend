"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const notices = [
  "Ramadan Food Campaign 2026",
  "Iftar & Sohoor Campaign 2026",
  "Palestine Emergency Relief 2026",
  "Clean Water for Yemen 2026",
  "Ramadan Food Campaign 2026",
  "Iftar & Sohoor Campaign 2026",
  "Palestine Emergency Relief 2026",
  "Clean Water for Yemen 2026",
];

export default function TopNoticeBar() {
  const pathname = usePathname();

  // Only show on the home page
  if (pathname !== "/") return null;

  return (
    <>
      <div
        className="relative w-full h-[52px] overflow-hidden flex items-center z-40"
        style={{
          backgroundImage: "url('/images/topbarNotice.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#1a1f3a]/65 pointer-events-none" />

        {/* Corner decorations */}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-2xl select-none pointer-events-none">🌙</span>
        <span className="absolute right-12 top-1/2 -translate-y-1/2 z-10 text-lg select-none pointer-events-none">⭐</span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-2xl select-none pointer-events-none">🌟</span>

        {/* Marquee track */}
        <div className="relative z-10 w-full overflow-hidden">
          <div className="notice-marquee flex items-center gap-4 whitespace-nowrap">
            {notices.map((text, i) => (
              <Link
                key={i}
                href="/campaigns"
                className="inline-flex items-center shrink-0 px-4 py-[5px] rounded-full text-[13px] font-semibold no-underline"
                style={{
                  background: i % 2 === 0 ? "#c0392b" : "#2c3e6b",
                  color: "#fff",
                  border: i % 2 === 0 ? "none" : "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {text}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes noticeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .notice-marquee {
          animation: noticeScroll 28s linear infinite;
        }
        .notice-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
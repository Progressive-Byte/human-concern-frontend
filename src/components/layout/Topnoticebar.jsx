"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHomepageContent } from "@/context/HomepageContentContext";
import { resolveHomepageImage } from "@/utils/homepageDefaults";

const chipClass = "backdrop-blur-[100px] bg-[linear-gradient(103.99deg,_#403DCE_5.42%,_#201F68_83.13%)] px-3 py-1.5 sm:px-[18px] sm:py-[9px] rounded-2xl whitespace-nowrap";

const TopNoticeBar = () => {
  const pathname = usePathname();
  const content = useHomepageContent();
  const notice = content?.header?.noticeBar;

  // Only show on the home page
  if (pathname !== "/") return null;
  if (notice?.enabled === false) return null;

  const chips = (Array.isArray(notice?.chips) ? notice.chips : []).filter((c) => String(c?.label || "").trim());
  if (!chips.length) return null;

  return (
    <div className="relative w-full min-h-[60px] sm:min-h-[75px] py-2 z-40 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${resolveHomepageImage(notice?.backgroundImage, "/images/topbarNotice.png")})` }}
      />
      <div className="absolute" />

      {/* Content */}
      <div className="relative w-full flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-12 flex-wrap text-[#FCFFA1] font-semibold text-xs sm:text-sm md:text-base px-2 py-1">
          {chips.map((chip, i) =>
            chip.href ? (
              <Link key={i} href={chip.href} className={`${chipClass} no-underline`}>
                {chip.label}
              </Link>
            ) : (
              <h2 key={i} className={chipClass}>{chip.label}</h2>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default TopNoticeBar;

"use client";

import { usePathname } from "next/navigation";

const TopNoticeBar = () => {
  const pathname = usePathname();

  // Only show on the home page
  if (pathname !== "/") return null;

  return (
    <div className="relative w-full min-h-[60px] sm:min-h-[75px] py-2 z-40 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-[url('/images/topbarNotice.png')] bg-cover bg-center"
      />
      <div className="absolute" />

      {/* Content */}
      <div className="relative w-full flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-12 flex-wrap text-[#FCFFA1] font-semibold text-xs sm:text-sm md:text-base px-2 py-1">
          <h2 className="backdrop-blur-[100px] bg-[linear-gradient(103.99deg,_#403DCE_5.42%,_#201F68_83.13%)] px-3 py-1.5 sm:px-[18px] sm:py-[9px] rounded-2xl whitespace-nowrap">Ramadan Food Campaign 2026</h2>
          <h2 className="backdrop-blur-[100px] bg-[linear-gradient(103.99deg,_#403DCE_5.42%,_#201F68_83.13%)] px-3 py-1.5 sm:px-[18px] sm:py-[9px] rounded-2xl whitespace-nowrap">Iftar & Sohoor Campaign 2026</h2>
        </div>
      </div>
    </div>
  );
}

export default TopNoticeBar;
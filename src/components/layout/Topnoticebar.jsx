"use client";

import { usePathname } from "next/navigation";

const TopNoticeBar = () => {
  const pathname = usePathname();

  // Only show on the home page
  if (pathname !== "/") return null;

  return (
    <div className="relative w-full h-[75px] z-40 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-[url('/images/topbarNotice.png')] bg-cover bg-center"
      />
      <div className="absolute" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="flex gap-12 text-[#FCFFA1] font-semibold text-sm md:text-base">
          <h2 className="backdrop-blur-[100px] bg-[linear-gradient(103.99deg,_#403DCE_5.42%,_#201F68_83.13%)] px-[18px] py-[9px] rounded-2xl">Ramadan Food Campaign 2026</h2>
          <h2 className="backdrop-blur-[100px] bg-[linear-gradient(103.99deg,_#403DCE_5.42%,_#201F68_83.13%)] px-[18px] py-[9px] rounded-2xl">Iftar & Sohoor Campaign 2026</h2>
        </div>
      </div>
    </div>
  );
}

export default TopNoticeBar;
"use client";

import { usePathname } from "next/navigation";

export default function TopNoticeBar() {
  const pathname = usePathname();

  // Only show on the home page
  if (pathname !== "/") return null;

  return (
    <div className="relative w-full h-[52px] z-40 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-[url('/images/topbarNotice.png')] bg-cover bg-center"
      />
      <div className="absolute" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="flex gap-12 whitespace-nowrap text-white font-semibold text-sm md:text-base">
          <h2>Ramadan Food Campaign 2026</h2>
          <h2>Iftar & Sohoor Campaign 2026</h2>
        </div>
      </div>
    </div>
  );
}
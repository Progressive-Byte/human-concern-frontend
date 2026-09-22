"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/utils/utm";

/**
 * Records UTM attribution the moment ANY public page is opened with `utm_*` params — not just when
 * the visitor reaches the donation form. Writes the first-touch cookie and this session's last
 * touch; renders nothing.
 *
 * Reads `window.location.search` directly (instead of `useSearchParams`) so it needs no Suspense
 * boundary and can sit in the site layout.
 */
const AttributionCapture = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    captureAttribution(window.location.search);
  }, [pathname]);

  return null;
};

export default AttributionCapture;

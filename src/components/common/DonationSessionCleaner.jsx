"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Routes that are part of the active donation flow.
// /donate/* covers the generic flow and thank-you page.
// /[campaignSlug]/1-4 covers campaign-specific steps.
const inDonateFlow = (path) =>
  /^\/donate(\/|$)/.test(path) || /^\/[^/]+\/[1-4]$/.test(path);

export default function DonationSessionCleaner() {
  const pathname = usePathname();
  // Initialise the ref from the current path so a hard-load on a donate
  // page doesn't immediately trigger a false "just left" clear.
  const wasInFlowRef = useRef(inDonateFlow(pathname));

  useEffect(() => {
    const nowInFlow = inDonateFlow(pathname);
    if (nowInFlow) {
      wasInFlowRef.current = true;
    } else if (wasInFlowRef.current) {
      // Donor just navigated away from the flow without completing payment.
      wasInFlowRef.current = false;
      try { sessionStorage.removeItem("hc_donation"); } catch {}
    }
  }, [pathname]);

  return null;
}

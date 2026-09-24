"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { computeDonationProgress } from "@/utils/donationFormProgress";

// The form config is written to sessionStorage (by CampaignConfigLoader and the admin
// preview) before the steps render. Reading it through useSyncExternalStore lets the
// server snapshot differ from the client one without a hydration mismatch.
const subscribe = () => () => {};
const getConfigSnapshot = () => {
  try { return sessionStorage.getItem("campaignData") ?? ""; } catch { return ""; }
};
const getServerConfigSnapshot = () => null;

// Sticky wizard chrome: the form (campaign) name and how much of the required
// information is filled in. Read-only — it never blocks navigation.
const DonateFormHeader = ({ maxWidth = "max-w-[700px]" }) => {
  const { data } = useDonation();
  const pathname = usePathname();
  const rawConfig = useSyncExternalStore(subscribe, getConfigSnapshot, getServerConfigSnapshot);

  // The admin preview renders the same steps inside the admin shell, where a
  // viewport-fixed header would sit on top of the admin chrome. Skip it there.
  if (pathname?.startsWith("/admin")) return null;
  // null = server snapshot: the config is only read on the client, so hold off a render
  // rather than flash a percentage computed from a half-known field set.
  if (rawConfig === null) return null;

  let config = {};
  try { config = JSON.parse(rawConfig || "{}"); } catch { config = {}; }

  const formName = data.campaignTitle || config.name || "";
  const { percent } = computeDonationProgress(data, config);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#EBEBEB] bg-white/95 backdrop-blur">
      <div className={`mx-auto ${maxWidth} px-3 sm:px-4 py-3`}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="truncate text-[14px] font-semibold text-[#383838]">
            {formName || "Donation"}
          </p>
          <span className="shrink-0 text-[12px] font-semibold text-[#737373]">
            {percent}% complete
          </span>
        </div>
        <div
          className="h-[6px] w-full overflow-hidden rounded-full bg-[#E5E5E5]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Form completion"
        >
          <div
            className="h-full rounded-full bg-[#EA3335] transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </header>
  );
};

export default DonateFormHeader;

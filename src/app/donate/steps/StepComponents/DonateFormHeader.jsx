"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { computeDonationProgress } from "@/utils/donationFormProgress";
import { CircleCheckIcon } from "@/components/common/SvgIcon";

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
  // Read the current field values, so the bar moves while the donor types/selects.
  const percent = computeDonationProgress(data, config).percent;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#EBEBEB] bg-white/95 backdrop-blur">
      <div className={`mx-auto ${maxWidth} px-3 sm:px-4 py-2 sm:py-3`}>
        <div className="mb-1.5 flex items-start justify-between gap-3 sm:mb-2">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-[#383838] sm:text-[20px]">
              {formName || "Donation"}
            </p>
            {/* The completion figure sits under the name, where it reads as a subtitle rather
                than as an unrelated chip pinned to the right edge. */}
            <p className="mt-0.5 text-[11px] font-semibold text-[#737373] sm:text-[12px]">
              {percent}% complete
            </p>
          </div>

          {/* Zakat eligibility lives here now, on the row the percentage used to occupy. */}
          {data.zakatEligible && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#38383833] bg-[#F7FFED] px-2 py-1 sm:px-2.5">
              <span className="shrink-0 text-[13px] leading-none">{CircleCheckIcon}</span>
              <span className="whitespace-nowrap text-[10px] font-medium text-[#383838] sm:text-[11px]">
                Zakat Eligible
              </span>
            </span>
          )}
        </div>
        <div
          className="h-[4px] w-full overflow-hidden rounded-full bg-[#E5E5E5] sm:h-[6px]"
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

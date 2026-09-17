"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api";
import { buildCampaignData } from "@/utils/campaignData";
import UnavailablePage from "@/components/campaign/UnavailablePage";

function isScheduleEditMode() {
  try {
    return Boolean(JSON.parse(sessionStorage.getItem("hc_schedule_edit") || "{}").isEditMode);
  } catch {
    return false;
  }
}

// Refreshes the campaign configuration the donate steps read, so admin changes
// are reflected on every entry (including a refresh or a shared/direct link).
//
// It ONLY rewrites `sessionStorage.campaignData` (form config). Donor input lives
// in `hc_donation` (DonationContext) and the dashboard edit prefill in
// `hc_schedule_edit` — both are left untouched.
const CampaignConfigLoader = ({ campaignSlug, children }) => {
  const [ready, setReady] = useState(false);
  // null = servable (or transient error). {} / config = render the unavailable page.
  const [unavailable, setUnavailable] = useState(null);

  useEffect(() => {
    // Schedule-edit sessions reach the wizard through this same route, but their
    // config is built by getUserScheduleEditForm (fresh on every click, and tailored
    // to that schedule: availableCauses/availableAddOns/constraints). Overwriting it
    // with the public campaign config would change the cause/add-on options and inject
    // payment methods + global notes, so leave edit sessions alone.
    if (isScheduleEditMode()) {
      setReady(true);
      return undefined;
    }

    let alive = true;

    async function refresh() {
      try {
        const [campaignRes, settingsRes] = await Promise.all([
          apiRequest(`campaigns/${encodeURIComponent(campaignSlug)}`, { cache: "no-store" }),
          apiRequest("payment/settings", { cache: "no-store" }),
        ]);
        if (!alive) return;

        const campaign = campaignRes?.data ?? null;
        const globalNote = settingsRes?.data?.globalNote ?? [];
        if (campaign) {
          sessionStorage.setItem("campaignData", JSON.stringify(buildCampaignData(campaign, globalNote)));
        }
      } catch (e) {
        // A form that exists but is not published (or an unknown slug) shows the configured
        // unavailable page. Any other failure is transient and must never block a donation.
        if (e?.code === "FORM_UNAVAILABLE") {
          setUnavailable(e?.body?.error?.details?.unavailablePage ?? {});
        } else if (e?.code === "FORM_NOT_FOUND") {
          setUnavailable({});
        } else {
          console.error("[CampaignConfigLoader] refresh failed:", e);
        }
      } finally {
        if (alive) setReady(true);
      }
    }

    refresh();
    return () => {
      alive = false;
    };
  }, [campaignSlug]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#6B7280]">
        Loading…
      </div>
    );
  }

  if (unavailable !== null) {
    return <UnavailablePage config={unavailable} />;
  }

  return children;
};

export default CampaignConfigLoader;

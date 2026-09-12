"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api";
import { buildCampaignData } from "@/utils/campaignData";

// Refreshes the campaign configuration the donate steps read, so admin changes
// are reflected on every entry (including a refresh or a shared/direct link).
//
// It ONLY rewrites `sessionStorage.campaignData` (form config). Donor input lives
// in `hc_donation` (DonationContext) and the dashboard edit prefill in
// `hc_schedule_edit` — both are left untouched.
const CampaignConfigLoader = ({ campaignSlug, children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
        // Never block a donation: fall through and render with the existing config.
        console.error("[CampaignConfigLoader] refresh failed:", e);
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

  return children;
};

export default CampaignConfigLoader;

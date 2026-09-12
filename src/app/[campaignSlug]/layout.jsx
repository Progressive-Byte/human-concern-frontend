import { DonationProvider } from "@/context/DonationContext";
import { BrandingProvider } from "@/context/BrandingContext";
import CampaignConfigLoader from "./components/CampaignConfigLoader";

export default async function CampaignDonateLayout({ children, params }) {
  const { campaignSlug } = await params;

  return (
    <BrandingProvider>
      <DonationProvider>
        <CampaignConfigLoader campaignSlug={campaignSlug}>{children}</CampaignConfigLoader>
      </DonationProvider>
    </BrandingProvider>
  );
}

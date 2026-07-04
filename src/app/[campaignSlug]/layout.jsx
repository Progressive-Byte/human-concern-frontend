import { DonationProvider } from "@/context/DonationContext";
import { BrandingProvider } from "@/context/BrandingContext";

export default function CampaignDonateLayout({ children }) {
  return (
    <BrandingProvider>
      <DonationProvider>{children}</DonationProvider>
    </BrandingProvider>
  );
}

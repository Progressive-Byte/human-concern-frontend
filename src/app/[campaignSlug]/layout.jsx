import { DonationProvider } from "@/context/DonationContext";

export default function CampaignDonateLayout({ children }) {
  return <DonationProvider>{children}</DonationProvider>;
}

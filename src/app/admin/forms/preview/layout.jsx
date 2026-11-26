import { DonationProvider } from "@/context/DonationContext";
import { BrandingProvider } from "@/context/BrandingContext";

/*
  The preview renders the real donation steps, so it needs the same providers the /donate route
  gives them. Without BrandingProvider the Google Maps key and the donation colours resolved to
  defaults — the address section drew a search box that could never work, and the amount colour
  fell back to plain red.
*/
export default function AdminFormPreviewLayout({ children }) {
  return (
    <BrandingProvider>
      <DonationProvider>{children}</DonationProvider>
    </BrandingProvider>
  );
}

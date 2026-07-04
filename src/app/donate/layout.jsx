import { DonationProvider } from "@/context/DonationContext";
import { BrandingProvider } from "@/context/BrandingContext";

const DonateLayout = ({ children }) => {
  return (
    <BrandingProvider>
      <DonationProvider>
        {children}
      </DonationProvider>
    </BrandingProvider>
  );
}
export default DonateLayout;

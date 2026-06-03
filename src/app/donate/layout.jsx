import { DonationProvider } from "@/context/DonationContext";

const DonateLayout = ({ children }) => {
  return (
    <DonationProvider>
      {children}
    </DonationProvider>
  );
}
export default DonateLayout;

import { DonationProvider } from "@/context/DonationContext";

export default function DonateLayout({ children }) {
  return (
    <DonationProvider>
      {children}
    </DonationProvider>
  );
}

import { DonationProvider } from "@/context/DonationContext";

export default function AdminFormPreviewLayout({ children }) {
  return <DonationProvider>{children}</DonationProvider>;
}

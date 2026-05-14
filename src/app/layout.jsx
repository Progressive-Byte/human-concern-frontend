import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import DonationSessionCleaner from "@/components/common/DonationSessionCleaner";

export const metadata = {
  title: "Human Concern",
  description: "A platform for connecting people and resources to address human concerns.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RouteProgressBar />
        <AuthProvider>
          <DonationSessionCleaner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

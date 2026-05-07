import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteProgressBar from "@/components/layout/RouteProgressBar";

export const metadata = {
  title: "Human Concern",
  description: "A platform for connecting people and resources to address human concerns.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RouteProgressBar />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

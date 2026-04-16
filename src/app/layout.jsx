import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteProgressBar from "@/components/layout/RouteProgressBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Human Concern",
  description: "A platform for connecting people and resources to address human concerns.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <RouteProgressBar />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

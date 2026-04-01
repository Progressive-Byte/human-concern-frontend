import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "HumanConcern — Give with Purpose, Transform Lives",
  description:
    "Connect with verified campaigns and make a real difference. Donate to education, healthcare, clean water, and more.",
};

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

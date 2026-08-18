import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopNoticeBar from "@/components/layout/Topnoticebar";
import { BrandingProvider } from "@/context/BrandingContext";

export const metadata = {
  title: "HumanConcern — Give with Purpose, Transform Lives",
  description:
    "Connect with verified campaigns and make a real difference. Donate to education, healthcare, clean water, and more.",
};

const SiteLayout = ({ children }) => {
  return (
    <BrandingProvider>
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        <TopNoticeBar />
        <Navbar />
      </div>
      {children}
      <Footer />
    </BrandingProvider>
  );
}

export default SiteLayout
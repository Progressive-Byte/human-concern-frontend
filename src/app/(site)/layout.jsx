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
      <div className="h-[100px] sm:h-[110px] md:h-[120px] lg:h-[160px]" aria-hidden="true" />
      {children}
      <Footer />
    </BrandingProvider>
  );
}

export default SiteLayout
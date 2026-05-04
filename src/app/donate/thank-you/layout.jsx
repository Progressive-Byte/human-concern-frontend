import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopNoticeBar from "@/components/layout/Topnoticebar";

const ThankYouLayout = ({ children }) => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        <TopNoticeBar />
        <Navbar />
      </div>
      {children}
      <Footer />
    </>
  );
}

export default ThankYouLayout

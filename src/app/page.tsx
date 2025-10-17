import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import Paragraph from "./components/Paragraph";
import VisionSection from "./components/VisionSection";
import NewsSection from "./components/newsection";
import ActivitiesSection from "./components/ActivitiesSection";
import ActivitiesGallery from "./components/ActivitiesGallery";
import LoginPage from "@/app/components/LoginPage"
import SignUp from "@/app/components/SignUp";
import Statistics from "./components/Statistics";
import Services from "./components/Services";
import Footer from "./components/Footer";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
    
      {/* <LoginPage /> */}
      {/* <SignUp /> */}
      <Paragraph />
      <VisionSection />
      <NewsSection />
      <Statistics />
      <ActivitiesSection />
      <Services />
      <ActivitiesGallery />
      <Footer />
    </>
  );
}

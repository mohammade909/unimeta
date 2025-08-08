import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import HeroSection from "../components/HeroSection";
import TradingAsset from "../components/TradingAsset";
import WorkProcess from "../components/WorkProcess";
import FAQSection from "../components/FAQSection"
import Broker from "../components/Broker";
import TradingMarket from "../components/TradingMarket"
import AboutSection from "../components/AboutSection";
import Pricing from "../components/Pricing"
import  Contact  from "../components/Contact";
 const Home = () => {
  return (
    <>
      <Header />
      <HeroSection/>
      <TradingMarket/>
      <AboutSection/>
      <WorkProcess/>
      <TradingAsset/>
      <Broker/>
      <Pricing/>
      <Contact/>
      <FAQSection/>
      <Footer />
    </>
  );
};
export default Home;

import Header from "@/components/layout/Header";
import Hero from "@/components/homepage/Hero";
// import TrustedByCompanies from "@/components/homepage/TrustedByCompanies";
import Examples from "@/components/homepage/Examples";
import Features from "@/components/homepage/Features";
import Pricing from "@/components/homepage/Pricing";
// import HowItWorks from "@/components/homepage/HowItWorks";
import UseCases from "@/components/homepage/UseCases";
import Comparison from "@/components/homepage/Comparison";
import FAQs from "@/components/homepage/FAQs";
import PhotographyCompared from "@/components/homepage/PhotographyCompared";
import Footer from "@/components/homepage/Footer";
import HeadshotShowcase from "@/components/homepage/HeadshotShowcase";

export default function Home() {
  return (
    <>
      <Header />
      <main id="content" role="main">
        <Hero />
        <Examples />
        <Features />
        <PhotographyCompared />
        <Pricing />
        {/* <HowItWorks /> */}
        <UseCases />
        <Comparison />
        {/* <TrustedByCompanies /> */}
        <HeadshotShowcase />
        <FAQs />
      </main>
      <Footer />
    </>
  );
}

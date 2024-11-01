import Header from "@/components/layout/Header";
import Hero from "@/components/homepage/Hero";
import Reviews from "@/components/homepage/Reviews";
import Features from "@/components/homepage/Features";
import Pricing from "@/components/homepage/Pricing";
import HowItWorks from "@/components/homepage/HowItWorks";
import UseCases from "@/components/homepage/UseCases";
import Comparison from "@/components/homepage/Comparison";
import FAQs from "@/components/homepage/FAQs";
import TestimonialsCarousel from "@/components/homepage/TestimonialsCarousel";
import PhotographyCompared from "@/components/homepage/PhotographyCompared";
import Footer from "@/components/homepage/Footer";
// import Detailed from "@/components/homepage/Detailed";
// import Compare from "@/components/homepage/Compare";
// import MediaPublications from "@/components/homepage/MediaPublications";
// import CardSlider from "@/components/homepage/CardSlider";

export default function Home() {
  return (
    <>
      <main id="content" role="main">
        <Header />
        <Hero />
        <Reviews />
        <Features />
        <PhotographyCompared />
        <Pricing />
        <HowItWorks />
        <UseCases />
        <Comparison />
        <TestimonialsCarousel />
        <FAQs />
      </main>
      <Footer />
    </>
  );
}

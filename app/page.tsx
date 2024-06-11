import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import FAQs from "@/components/homepage/FAQs";
import Pricing from "@/components/homepage/Pricing";
import Testimonials from "@/components/homepage/Testimonials";
import HeroParallax from "@/components/homepage/Hero";
import HowItWorks from "@/components/homepage/HowItWorks";
import Detailed from "@/components/homepage/Detailed";
import Compare from "@/components/homepage/Compare";
import PhotographyCompare from "@/components/homepage/PhotographyCompare";
import CardSlider from "@/components/homepage/CardSlider";
import Teams from "@/components/homepage/Teams";

export default function Home() {
  return (
    <>
      <main id="content" role="main">
        <Header />
        <HeroParallax />
        {/* <ComparisonTable /> */}
        {/* <Detailed /> */}
        {/* <Compare /> */}
        {/* <Testimonials /> */}
        <PhotographyCompare />
        {/* <MediaPublications /> */}
        {/* <Teams /> */}
        <Pricing />
        <HowItWorks />
        <CardSlider />
        <FAQs />
      </main>
      <Footer />
    </>
  );
}

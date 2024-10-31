import Header from "@/components/layout/Header";
import Hero from "@/components/homepage/Hero";
import Reviews from "@/components/homepage/Reviews";
import Footer from "@/components/homepage/Footer";
import FAQs from "@/components/homepage/FAQs";
import Pricing from "@/components/homepage/Pricing";
import Testimonials from "@/components/homepage/Testimonials";
// import HeroParallax from "@/components/homepage/Hero";
// import HowItWorks from "@/components/homepage/HowItWorks";
import Detailed from "@/components/homepage/Detailed";
import Compare from "@/components/homepage/Compare";
import MediaPublications from "@/components/homepage/MediaPublications";
import PhotographyCompare from "@/components/homepage/PhotographyCompare";
import CardSlider from "@/components/homepage/CardSlider";

export default function Home() {
  return (
    <>
      <main id="content" role="main">
        <Header />
        <Hero />
        <Reviews />
        {/* <PhotographyCompare /> */}
        {/* <Detailed /> */}
        {/* <Compare /> */}
        {/* <Testimonials /> */}
        {/* <Pricing /> */}
        {/* <HowItWorks /> */}
        {/* <MediaPublications /> */}
        {/* <CardSlider /> */}
        {/* <FAQs /> */}
      </main>
      {/* <Footer /> */}
    </>
  );
}

import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header";
import FAQs from "@/components/homepage/FAQs";
import Pricing from "@/components/homepage/Pricing";
import ComparisonTable from "@/components/homepage/ComparisonTable";
import Testimonials from "@/components/homepage/Testimonials";

export default function Home() {
  return (
    <>
      <main id="content" role="main">
        <div className="overflow-hidden">
          <Header />
          <Pricing />
        </div>
        <ComparisonTable />
        <Testimonials />
        <FAQs />
      </main>
      <Footer />
    </>
  );
}

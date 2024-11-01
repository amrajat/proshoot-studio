import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";
import AIHeadshotExamples from "@/app/free-ai-headshot-generator-examples/ai-headshots-examples";
export const metadata = {
  title: { absolute: "Free AI Headshots Examples" },
  description:
    "See the power of AI headshots! Explore Proshoot.co's free examples & discover the perfect professional look for less.",
};

function Headshots() {
  return (
    <>
      <Header />
      <div className="relative overflow-hidden">
        {/* Gradients */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]  " />
          <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[90rem] h-[50rem] roundeds origin-top-left -rotate-12 -translate-x-[15rem]   " />
        </div>
        {/* End Gradients */}
        <div className="relative z-10">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            {/* Examples */}
            <AIHeadshotExamples />
          </div>
        </div>
      </div>
      <Container></Container>
      <Footer />
    </>
  );
}

export default Headshots;

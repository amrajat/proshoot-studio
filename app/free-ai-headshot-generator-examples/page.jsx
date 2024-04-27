import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";

export const metadata = {
  title: { absolute: "Free AI Headshots Examples" },
  description:
    "See the power of AI headshots! Explore Proshoot.co's free examples & discover the perfect professional look for less.",
};

function Headshots() {
  return (
    <>
      <Header />
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          {/* <div className="space-y-3"> */}
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Headshots Examples
          </h1>
          <p className="text-lg text-gray-800 dark:text-neutral-200">
            This page is under development please visit this after some time.
          </p>
          {/* </div> */}
        </div>
        {/* End Content */}
      </Container>
      {/* End Blog Article */}
      <Footer />
    </>
  );
}

export default Headshots;

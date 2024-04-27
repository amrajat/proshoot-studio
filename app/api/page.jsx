import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";

export const metadata = {
  title: "Developers",
  description:
    "Integrate AI headshot generation into your app! Proshoot.co's developer API unlocks powerful creative possibilities.",
};

function Developers() {
  return (
    <>
      <Header />
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          {/* <div className="space-y-3"> */}
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Devlopers: API
          </h1>
          <p className="text-lg text-gray-800 dark:text-neutral-200 pb-[4.5rem]">
            This page is under development please visit this after some time.
            Our team is working hard to launch this API for developers who want
            to generate images for their app without managing servers, GPUs,
            setting parameters, and fine-tuning.
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

export default Developers;

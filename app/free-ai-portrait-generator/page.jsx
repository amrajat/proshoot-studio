import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";

export const metadata = {
  title: { absolute: "Free AI Portraits Generator" },
  description:
    "Free AI Portrait/Headshot Generator: Create professional portraits/headshots in seconds with Proshoot.co's AI technology.",
};

function FreeHeadshot() {
  return (
    <>
      <Header />
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          {/* <div className="space-y-3"> */}
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Free Headshot Generator
          </h1>
          <p className="text-lg text-gray-800 dark:text-neutral-200 pb-[4.5rem]">
            If you fall under these special categores of NGOs, Education,
            Influencer, Reviewer SaaS/AI/Other. Please email us and we&apos;ll
            arrange AI studio for free/or at discounted price to generate free
            ai headshots.
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

export default FreeHeadshot;

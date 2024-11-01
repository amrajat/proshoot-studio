import Heading from "@/components/shared/Heading";
import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";
import Link from "next/link";

export const metadata = {
  title: { absolute: "Free AI Portraits Generator" },
  description:
    "Free AI Portrait/Headshot Generator: Create professional portraits/headshots in seconds with Proshoot.co's AI technology.",
};

function FreeHeadshot() {
  return (
    <>
      <Header />

      <Container>
        <div className="space-y-5 md:space-y-8">
          <Heading as="h3" variant={"hero"}>
            Free Headshot Generator
          </Heading>
          <p className="text-lg  pb-[4.5rem]">
            If you fall under these special categores of NGOs, Education,
            Influencer, Reviewer SaaS/AI/Other. Please email us at
            support@proshoot.co or visit our&nbsp;
            <Link className="underline" href="/contact">
              contact page
            </Link>
            &nbsp; and we&apos;ll arrange AI studio for free/or at discounted
            price to generate free ai headshots.
          </p>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default FreeHeadshot;

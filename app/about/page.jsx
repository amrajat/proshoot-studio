import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
import Heading from "../../components/ui/Heading";
import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Meet Proshoot.co, the AI startup using cutting-edge tech for easy professional headshots. Discover who we are & how we're shaping the future of headshots.",
};

function About() {
  return (
    <>
      <Header />
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          {/* <div className="space-y-3"> */}
          <Heading type="h3">About Us</Heading>
          <p className="text-lg text-gray-800 ">
            Prime AI Company is a Artificial Intelligence startup focused on
            revolutionizing the way professional headshots are generated. We are
            a team of passionate innovators dedicated to harnessing the power of
            artificial intelligence to create high-quality, personalized
            headshots that are affordable and faster to generate. Our mission is
            to empower individuals and businesses to create professional
            headshots that are both time-saving and cost-effective. We believe
            that everyone deserves to have a headshot that portrays them in a
            positive and professional light. We are driven by a team of experts
            in artificial intelligence. Our team members are passionate about
            creating innovative solutions that make a real difference. Say hello
            to us by clicking&nbsp;
            <Link className="underline" href={"/contact"}>
              here
            </Link>
            .
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

export default About;

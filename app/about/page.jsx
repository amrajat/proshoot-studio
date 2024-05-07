import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";

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
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            About Us
          </h1>
          <p className="text-lg text-gray-800 dark:text-neutral-200">
            Proshoot.co is a cutting-edge AI startup focused on revolutionizing
            the way professional headshots are generated. We are a team of
            passionate innovators dedicated to harnessing the power of
            artificial intelligence to create high-quality, personalized
            headshots that are accessible to everyone.<br></br>Our Mission
            <br></br>
            Our mission is to empower individuals and businesses to create
            professional headshots that are both time-saving and cost-effective.
            We believe that everyone deserves to have a headshot that portrays
            them in a positive and professional light.<br></br>The Team
            <br></br>
            Proshoot.co is driven by a team of experts in artificial
            intelligence, design, and technology. Our team members are
            passionate about creating innovative solutions that make a real
            difference in people's lives. <br></br>Join Us!
            <br></br>
            Are you excited about the future of AI and its potential to
            revolutionize creative industries? If so, we encourage you to join
            our team! We are always looking for talented individuals who share
            our passion for innovation.
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

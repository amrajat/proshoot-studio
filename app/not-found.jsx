import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";
import Image from "next/image";
import Heading from "@/components/ui/Heading";

export const metadata = {
  title: { absolute: "Not Found!" },
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
          <Heading type="h4">Houston, we have a problem...</Heading>

          <h5 className="text-lg md:text-md ">
            Looks like you've drifted off course, Captain. Our scanners can't
            detect the page you're requesting in this sector of the digital
            cosmos. Fear not, intrepid explorer! Double-check your coordinates
            and try again, or use the navigation panel below to chart a new
            course.
          </h5>
          <Image
            src={"/404.jpg"}
            alt="error 404 not found"
            width={"0"}
            height={"0"}
            sizes="100vw"
            quality={50}
            className="w-80 h-auto"
          />

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

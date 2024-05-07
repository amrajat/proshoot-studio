import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";

export const metadata = {
  title: "Contact",
  description:
    "Have questions about Proshoot.co? We're here to help! Get in touch with our friendly support team today.",
};

function Contact() {
  return (
    <>
      <Header />
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          {/* <div className="space-y-3"> */}
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Contact Us
          </h1>
          <p className="text-lg text-gray-800 dark:text-neutral-200 pb-[3rem]">
            We're thrilled to hear from you! Whether you have a question about
            our services, want to collaborate, or simply want to say hello,
            we're here and ready to chat.<br></br>
            <br></br>
            How to Reach Us<br></br>
            You can reach out to us via support@proshoot.co We value your
            feedback and strive to respond to all inquiries promptly. Thank you
            for reaching out!
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

export default Contact;

import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";
import Heading from "@/components/shared/heading";
export const metadata = {
  title: "Contact",
  description:
    "Have questions about Proshoot.co? We're here to help! Get in touch with our friendly support team today.",
};

function Contact() {
  return (
    <>
      <Header />
      <Container>
        <div className="space-y-5 md:space-y-8">
          <Heading as="h1" variant="hero">
            Contact Us
          </Heading>
          <p className="text-sm font-normal ">
            We’d love to hear from you!<br></br>
            <br></br>
            For any questions, support, or inquiries, Simply click on the small
            <strong> round messenger icon at the bottom right</strong> of your
            screen to chat with us instantly.
            <br></br>
            <br></br>
            Prefer email? No problem! Reach us at{" "}
            <strong>support@proshoot.co</strong>, and we’ll get back to you as
            soon as possible. We’re here to help—let’s connect! 😊
          </p>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default Contact;

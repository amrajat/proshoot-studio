import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
import Heading from "../../components/ui/Heading";
import TallyContactForm from "@/app/contact/contact-form";
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
          <Heading type="h3">Contact Us</Heading>
          <p className="text-sm font-normal ">
            Please fill below form or email us at support@proshoot.co to get in
            touch with us. Thank you!
          </p>
          <TallyContactForm />
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default Contact;

import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
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
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Contact Us
          </h1>
          <p className="text-sm font-normal dark:text-white">
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

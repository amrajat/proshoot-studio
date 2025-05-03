import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";

import Terms from "@/app/legal/terms";
import Privacy from "@/app/legal/privacy";
import Disclaimer from "@/app/legal/disclaimer";
import Refunds from "@/app/legal/refunds";
import FairUsage from "@/app/legal/fup";
import SubProcessors from "@/app/legal/sub-processors";
import Heading from "@/components/shared/heading";

export const metadata = {
  title: { absolute: "Legal Policies" },
  robots: {
    index: false,
    follow: true,
  },
};
function Legal() {
  return (
    <>
      <Header />

      <Container>
        <div className="space-y-5 md:space-y-8">
          <Heading variant={"hero"}>Legal Policies</Heading>
          <p>
            Please read our legal policies for better understanding and
            transparency.
          </p>

          <Refunds />
          <Terms />
          <Privacy />
          <Disclaimer />
          <FairUsage />
          <SubProcessors />

          <p>Page Last Updated: Wednesday, January 29, 2025</p>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default Legal;

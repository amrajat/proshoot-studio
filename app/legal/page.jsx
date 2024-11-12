import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";

import Terms from "@/app/legal/terms";
import Privacy from "@/app/legal/privacy";
import Disclaimer from "@/app/legal/disclaimer";
import Refunds from "@/app/legal/refunds";
import FairUsage from "@/app/legal/fup";
import SubProcessors from "@/app/legal/sub-processors";

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
          <h1>All Legal Polices</h1>
          <p>
            Please read our legal policies for better understanding and
            transparency.
          </p>

          <Terms />

          <Privacy />
          <Disclaimer />
          <Refunds />
          <FairUsage />
          <SubProcessors />

          <p>Page Last Updated: Saturday, May 05, 2024</p>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default Legal;

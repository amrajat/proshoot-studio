import Heading from "@/components/shared/heading";

function SubProcessors() {
  return (
    <div className="space-y-4">
      <Heading variant={"subtitle"}>Sub-Processors</Heading>

      <section>
        <p>
          Proshoot relies on various sub-processors, including third-party
          providers listed below, as well as content delivery networks to help
          deliver Proshoot services under the Master Subscription and
          Professional Services Agreement (“MSA”). Terms used in this document
          carry the same meaning as in the MSA.
        </p>
      </section>

      <section>
        <h2>What is a Sub-processor?</h2>
        <p>
          A sub-processor is an external or internal data processor engaged by
          Proshoot, who may handle or have access to Customer Content containing
          personal data. Proshoot employs sub-processors for specific
          operational functions, as outlined in the tables below.
        </p>
      </section>

      <section>
        <h2>Due Diligence and Safeguard Measures</h2>
        <p>
          Proshoot evaluates potential sub-processors based on their security,
          privacy, and confidentiality practices and enters into Data Protection
          Agreements with each sub-processor that may handle Customer Content.
        </p>
        <p>
          This document is informational and does not grant customers additional
          rights or remedies, nor does it create a binding agreement. It serves
          to outline Proshoot’s sub-processor engagement process and provides
          the current list of third-party sub-processors and content delivery
          networks used by Proshoot for service support as of this publication
          date.
        </p>
        <p>
          Proshoot customers wishing to sign a Data Processing Agreement (DPA)
          can reach out via email at support@proshoot-dot-co.
        </p>
      </section>

      <section>
        <h2>Adding New Sub-processors</h2>
        <p>
          Proshoot provides ongoing updates regarding sub-processors engaged to
          support service delivery. Proshoot commits to regularly refreshing
          this list, enabling customers to stay aware of sub-processing
          practices relevant to the services.
        </p>
      </section>

      <section>
        <h2>Infrastructure Sub-processors – Service Data Handling</h2>
        <p>
          Proshoot either owns or controls access to the infrastructure used to
          manage and store Customer Content, except where noted. Currently,
          Proshoot’s production systems for hosting Customer Content operate
          within facilities in the United States and the following
          infrastructure sub-processors. The table below lists the countries and
          entities involved in Service Data storage and processing. Proshoot may
          utilize additional services from these sub-processors to fulfill data
          processing needs as required by the services.
        </p>

        <table className="border-collapse border border-gray-300 w-full mt-2">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Entity</th>
              <th className="border border-gray-300 p-2">Type</th>
              <th className="border border-gray-300 p-2">Country</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Vercel, Inc.</td>
              <td className="border border-gray-300 p-2">Cloud Data Center</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Supabase</td>
              <td className="border border-gray-300 p-2">
                Cloud Database and Storage
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Replicate, Inc.</td>
              <td className="border border-gray-300 p-2">AGI</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Cloudnary, Inc.</td>
              <td className="border border-gray-300 p-2">
                AI based Image Processing and Manipulation
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Cloudflare Inc.</td>
              <td className="border border-gray-300 p-2">
                Data Storage, CND and Security
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">OpenAI</td>
              <td className="border border-gray-300 p-2">AGI</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Anthropic PBC</td>
              <td className="border border-gray-300 p-2">AGI</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">
                Amazon Web Services
              </td>
              <td className="border border-gray-300 p-2">Cloud Data Center</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Service-Specific Sub-processors</h2>
        <p>
          Proshoot collaborates with specific third-party providers to enhance
          functionality within its Services. These sub-processors have
          controlled access to Customer Content to provide necessary functions,
          as indicated below.
        </p>

        <table className="border-collapse border border-gray-300 w-full mt-2">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Entity</th>
              <th className="border border-gray-300 p-2">Purpose</th>
              <th className="border border-gray-300 p-2">Country</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Google Analytics</td>
              <td className="border border-gray-300 p-2">Analytics</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Zoho Corporation</td>
              <td className="border border-gray-300 p-2">Customer Support</td>
              <td className="border border-gray-300 p-2">India</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">
                Lemon Squeezy & Stripe
              </td>
              <td className="border border-gray-300 p-2">Payment Gateway</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default SubProcessors;

import Heading from "@/components/shared/Heading";

function SubProcessors() {
  return (
    <div className="space-y-4">
      <Heading
        as="h2"
        id="sub-processors"
        className="text-xl font-bold md:text-2xl"
      >
        Sub-Processors
      </Heading>

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
          can reach out via email at{" "}
          <a href="mailto:legal@postcrafts.com">legal@postcrafts.com</a>.
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

        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Entity Name</th>
              <th className="border border-gray-300 p-2">Entity Type</th>
              <th className="border border-gray-300 p-2">Entity Country</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Render</td>
              <td className="border border-gray-300 p-2">
                Cloud Computing/Data Center Hosting
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">
                Google Cloud Platform
              </td>
              <td className="border border-gray-300 p-2">
                Cloud Computing/Data Center Hosting
              </td>
              <td className="border border-gray-300 p-2">EU/US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">MongoDB, Inc.</td>
              <td className="border border-gray-300 p-2">
                Cloud Database/Data Center Hosting
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Replicate Inc.</td>
              <td className="border border-gray-300 p-2">
                AI Processing and Training
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">
                Features & Labels (Fal.ai)
              </td>
              <td className="border border-gray-300 p-2">
                AI Processing and Training
              </td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Cloudflare Inc.</td>
              <td className="border border-gray-300 p-2">Data Storage</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">OpenAI</td>
              <td className="border border-gray-300 p-2">
                AI Processing, Content Generation, and Vision
              </td>
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

        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Entity Name</th>
              <th className="border border-gray-300 p-2">Purpose</th>
              <th className="border border-gray-300 p-2">Entity Country</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Crisp, IM SAS</td>
              <td className="border border-gray-300 p-2">Customer Support</td>
              <td className="border border-gray-300 p-2">EU</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">
                Bento, Backpack Internet Pty. Ltd
              </td>
              <td className="border border-gray-300 p-2">Email Marketing</td>
              <td className="border border-gray-300 p-2">Australia</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Posthog</td>
              <td className="border border-gray-300 p-2">Analytics</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Stripe</td>
              <td className="border border-gray-300 p-2">Payment Processing</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Content Delivery Networks (CDNs)</h2>
        <p>
          Proshoot may leverage content delivery networks (“CDNs”) to deliver
          services, enhance security, and optimize performance. CDNs are
          distributed systems that enable faster content delivery based on
          geographic location. Content served to site visitors and domain
          details may be stored within a CDN for quick access. Information
          transmitted through a CDN may be accessed by that CDN to carry out its
          functions. Below are the CDNs utilized by Proshoot’s services.
        </p>

        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">CDN Provider</th>
              <th className="border border-gray-300 p-2">Services Using CDN</th>
              <th className="border border-gray-300 p-2">
                Description of CDN Services
              </th>
              <th className="border border-gray-300 p-2">CDN Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">
                Google Cloud Platform
              </td>
              <td className="border border-gray-300 p-2">
                All Proshoot Services
              </td>
              <td className="border border-gray-300 p-2">
                Public website content for visitors is stored with Cloudflare,
                Inc., and transmitted to expedite loading speeds.
              </td>
              <td className="border border-gray-300 p-2">Global</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Advertising Partners</h2>
        <p>
          Proshoot uses third-party advertising services to provide targeted
          advertisements. These services may collect and use customer data to
          deliver customized advertising experiences.
        </p>

        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Entity Name</th>
              <th className="border border-gray-300 p-2">Purpose</th>
              <th className="border border-gray-300 p-2">Entity Country</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Facebook</td>
              <td className="border border-gray-300 p-2">Advertising</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Google LLC</td>
              <td className="border border-gray-300 p-2">Advertising</td>
              <td className="border border-gray-300 p-2">US</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default SubProcessors;

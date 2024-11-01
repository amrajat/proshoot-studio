import Heading from "@/components/shared/Heading";

function Disclaimer() {
  return (
    <div className="space-y-4">
      <Heading
        as="h2"
        id="disclaimer"
        className="text-xl font-bold md:text-2xl"
      >
        Disclaimer
      </Heading>

      <section>
        <h3>Limitations of Liability and Disclaimers</h3>
        <p>
          Proshoot.co strives to provide users with a state-of-the-art
          AI-powered headshot generation service. However, it is crucial to
          acknowledge the inherent limitations of this developing technology.
        </p>
      </section>

      <section>
        <h4>1. Service Availability and Functionality</h4>
        <p>
          The Service, including all materials and content made available
          through it, is provided "as is" and "as available." We disclaim all
          warranties, express or implied, regarding the Service’s uninterrupted
          operation, security, or absence of errors, viruses, or other harmful
          components. We also do not guarantee the prompt correction of any such
          issues.
        </p>
      </section>

      <section>
        <h4>2. Reliance on Information and Accuracy of AI Headshots</h4>
        <p>
          No information or advice, whether written or oral, obtained from
          Proshoot.co or its affiliated entities shall create any warranty not
          expressly stated herein. You agree that you use the Service at your
          own sole risk and that Proshoot.co shall not be liable for any damage
          to your property (including your computer system or mobile device) or
          any loss of data, including User Content.
        </p>
      </section>

      <section>
        <h4>3. Nature of Artificial Intelligence Technology</h4>
        <p>
          Proshoot.co leverages artificial intelligence and machine learning to
          generate headshots. You acknowledge and agree that this technology is
          under continuous development and subject to unexpected outputs. The AI
          Headshot Generator may produce results containing errors, omissions,
          or inaccuracies that do not precisely reflect real-world events,
          locations, individuals, or facts. Proshoot.co shall not be held liable
          for any mistakes, inaccuracies, omissions, or offensive content within
          the AI-generated headshots or any other content produced by the
          Service. You rely on the AI Headshots entirely at your own risk.
        </p>
      </section>

      <section>
        <h4>4. Limitation of Liability</h4>
        <p>
          The limitations and disclaimers outlined in this section ("Limitations
          of Liability and Disclaimers") apply to the fullest extent permitted
          by applicable law. Proshoot.co does not disclaim any warranty or other
          right that it is prohibited from disclaiming under such law.
        </p>
        <p>
          In conclusion, by using Proshoot.co, you acknowledge the evolving
          nature of AI technology and the potential for imperfections in the
          generated headshots. We remain committed to ongoing advancements and
          providing you with a valuable and reliable headshot creation
          experience.
        </p>
      </section>
    </div>
  );
}

export default Disclaimer;

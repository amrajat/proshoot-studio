import Heading from "@/components/shared/heading";

function FairUsage() {
  return (
    <div className="space-y-4">
      <Heading variant={"subtitle"}>Fair Usage Policy</Heading>

      <section>
        <p>
          Welcome to Proshoot.co! We empower users to leverage the power of AI
          for creative headshot generation. This Fair Use Policy outlines
          acceptable use guidelines to ensure a positive experience for all
          users.
        </p>
      </section>

      <section>
        <h3>1. Responsible Content Creation</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Adhere to G-Rated Content: Proshoot.co prohibits the creation,
            upload, or sharing of any content deemed inappropriate for all
            audiences.
          </li>
          <li>
            Respectful Representation: Avoid content promoting hate speech,
            harassment, violence, self-harm, or sexually suggestive material.
          </li>
          <li>
            Avoid Sensitive Topics: Refrain from generating headshots depicting
            illegal activities, shocking imagery, or content related to public
            health, politics, or major news events that could be misleading.
          </li>
          <li>
            Transparency in AI Use: When sharing your AI-generated headshots, be
            transparent about the role of AI in their creation.
          </li>
        </ul>
      </section>

      <section>
        <h3>2. Respecting Intellectual Property</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Consent is Key: Uploading images of identifiable individuals
            requires their explicit consent.
          </li>
          <li>
            Proper Licensing: Ensure you hold the appropriate usage rights for
            any uploaded images.
          </li>
          <li>
            Public Figures: Generating headshots of public figures is not
            permitted.
          </li>
        </ul>
      </section>

      <section>
        <h3>3. Reporting Violations</h3>
        <p>
          We encourage users to report any suspected violations of this Fair Use
          Policy by contacting our support team at support-at-proshoot-dot-co.
          We will investigate all reports promptly and take appropriate action,
          including account termination in severe cases.
        </p>
      </section>

      <section>
        <p>
          By using Proshoot.co, you agree to abide by this Fair Use Policy. We
          reserve the right to modify this policy at any time. We encourage you
          to review this policy periodically to stay informed of any updates.
          Together, let's create a positive and responsible AI-powered
          experience for all!
        </p>
      </section>
    </div>
  );
}

export default FairUsage;

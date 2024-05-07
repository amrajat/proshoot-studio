import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";

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
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Legal Pages
          </h1>
          {/* Terms & Conditions Starts Here */}
          <div className="space-y-3">
            <h3
              id="terms"
              className="text-xl font-bold md:text-2xl dark:text-white"
            >
              Terms & Conditions
            </h3>
            <p className="text-lg text-gray-800 dark:text-neutral-200">
              Welcome to Proshoot.co! This document outlines the terms and
              conditions ("Terms") that govern your use of the Proshoot.co
              website (the "Website") and its services (the "Services"), which
              are operated by Prime AI Company ("Prime AI," "we," "us," or
              "our"). By accessing or using the Website or Services, you agree
              to be bound by these Terms. If you disagree with any part of the
              Terms, you may not access or use the Website or Services.
              <br></br>
              <br></br>
              1. Services<br></br>
              Proshoot.co is a Software-as-a-Service (SaaS) application that
              utilizes artificial intelligence (AI) to generate
              professional-quality corporate portraits. The Services allow you
              to:
              <br></br>
              Upload your photo Select desired background and attire options
              Generate multiple headshot variations Download your chosen
              headshot(s)<br></br>
              <br></br>
              2. User Accounts
              <br></br>
              To access certain features of the Services, you may be required to
              create an account. You are responsible for maintaining the
              confidentiality of your account information, including your
              username and password. You are also fully responsible for all
              activities that occur under your account. You agree to notify
              Prime AI Company immediately of any unauthorized use of your
              account or any other security breach.
              <br></br>
              <br></br>
              3. Intellectual Property
              <br></br>
              The Website and Services, including all content, features, and
              functionality, are the property of Prime AI Company and its
              licensors and are protected by copyright, trademark, and other
              intellectual property laws. These Terms do not grant you any
              ownership rights to the intellectual property of Proshoot.co or
              its licensors.
              <br></br>
              <br></br>
              4. User Content
              <br></br>
              You retain all ownership rights to the photographs you upload to
              the Services ("User Content"). By uploading User Content, you
              grant Prime AI Company a non-exclusive, worldwide, royalty-free
              license to use, modify, reproduce, and distribute such User
              Content solely for the purpose of providing you with the Services.
              <br></br>
              <br></br>
              5. Disclaimer
              <br></br>
              The Services are provided "as is" and "as available" without
              warranty of any kind, express or implied. Prime AI Company does
              not warrant that the Services will be uninterrupted, error-free,
              or meet your specific requirements. The AI-generated headshots are
              a creative tool and may require adjustments for optimal results.
              We are not responsible for any dissatisfaction with the generated
              headshots.
              <br></br>
              <br></br>
              6. Limitation of Liability
              <br></br>
              Prime AI Company shall not be liable for any direct, indirect,
              incidental, consequential, or special damages arising out of or in
              any way connected with the use of the Website or Services,
              including, without limitation, damages for loss of profits,
              goodwill, use, data, or other intangible losses, even if Prime AI
              Company has been advised of the possibility of such damages.
              <br></br>
              <br></br>
              7. Termination
              <br></br>
              Prime AI Company may terminate your access to the Website or
              Services at any time, with or without cause, and with or without
              notice.
              <br></br>
              <br></br>
              8. Governing Law
              <br></br>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Rajasthan, India.
              <br></br>
              <br></br>
              9. Entire Agreement
              <br></br>
              These Terms constitute the entire agreement between you and Prime
              AI regarding your use of the Website and Services.
              <br></br>
              <br></br>
              10. Changes to these Terms
              <br></br>
              Prime AI Company reserves the right to update these Terms at any
              time. We will notify you of any changes by posting the revised
              Terms on the Website. Your continued use of the Website or
              Services after the revised Terms are posted constitutes your
              agreement to be bound by the revised Terms.
              <br></br>
              <br></br>
              11. Contact Us
              <br></br>
              If you have any questions about these Terms, please contact us at
              support-at-proshoot-dot-co. Thank you for using Proshoot.co!
            </p>
          </div>
          {/* Terms & Conditions Ends Here */}
          {/* Privacy Policy Starts Here */}
          <div className="space-y-3">
            <h3
              id="privacy"
              className="text-xl font-bold md:text-2xl dark:text-white"
            >
              Privacy Policy
            </h3>
            <p className="text-lg text-gray-800 dark:text-neutral-200">
              Prime AI Company ("Prime AI," "we," "us," or "our") is committed
              to protecting the privacy of our users. This Privacy Policy
              explains what information we collect, how we use it, and under
              what circumstances we may disclose it.
              <br></br>
              <br></br>
              1. Information We Collect We collect two types of information
              through Proshoot.co: Personal Information: This includes
              information that can be used to identify you, such as your name
              and email address (optional, for account creation). We only
              collect this information if you choose to create an account on our
              platform. Non-Personal Information: This includes information that
              cannot be used to identify you directly, such as your device
              information, IP address, browsing activity on our Website, and the
              number of times you use the Services to generate headshots.
              <br></br>
              <br></br>2. Use of Information We use the information we collect
              for the following purposes: To provide and improve the Services To
              create and manage your account (if applicable) To communicate with
              you about the Services, including updates, promotions, and support
              inquiries To analyze how users interact with the Services To
              comply with the law<br></br>
              <br></br>
              3. User Content The photographs you upload to the Services ("User
              Content") are considered your personal data. We store User Content
              securely and use it solely for the purpose of generating your
              headshots. We do not share User Content with any third parties
              without your consent. Once you download your chosen headshot(s),
              the User Content associated with that headshot will be deleted
              from our servers.
              <br></br>
              <br></br>
              4. Data Retention We will retain your personal information for as
              long as your account is active or as needed to provide you with
              the Services. We will also retain non-personal information for as
              long as it is useful for us to analyze how users interact with the
              Services.
              <br></br>
              <br></br>
              5. Security We take reasonable steps to protect the information
              you provide to us from unauthorized access, disclosure,
              alteration, or destruction. However, no internet transmission is
              completely secure, and we cannot guarantee the security of your
              information.
              <br></br>
              <br></br>
              6. Children's Privacy Our Services are not directed to children
              under the age of 13. We do not knowingly collect personal
              information from children under 13. If you are a parent or
              guardian and you believe your child has under 13 provided us with
              personal information, please contact us.
              <br></br>
              <br></br>
              7. Third-Party Links The Website may contain links to third-party
              websites. We are not responsible for the privacy practices of
              these websites. We encourage you to read the privacy policies of
              any website you visit.
              <br></br>
              <br></br>
              8. Your Choices You can access, update, or delete your personal
              information by contacting us at [Your Email Address].
              <br></br>
              <br></br>
              9. Changes to this Privacy Policy Prime AI reserves the right to
              update this Privacy Policy at any time. We will notify you of any
              changes by posting the revised Privacy Policy on the Website. Your
              continued use of the Website or Services after the revised Privacy
              Policy is posted constitutes your agreement to be bound by the
              revised Privacy Policy.
              <br></br>
              <br></br>
              10. Contact Us If you have any questions about this Privacy
              Policy, please contact us at [Your Email Address]. Thank you for
              choosing Proshoot.co! Sources info
            </p>
          </div>
          {/* Privacy Policy Ends Here */}
          {/* Disclaimer Starts Here */}
          <div className="space-y-3">
            <h3
              id="disclaimer"
              className="text-xl font-bold md:text-2xl dark:text-white"
            >
              Disclaimer
            </h3>
            <p className="text-lg text-gray-800 dark:text-neutral-200">
              Limitations of Liability and Disclaimers<br></br>
              <br></br>
              Proshoot.co strives to provide users with a state-of-the-art
              AI-powered headshot generation service. However, it is crucial to
              acknowledge the inherent limitations of this developing
              technology.
              <br></br>
              <br></br>
              1. Service Availability and Functionality: The Service, including
              all materials and content made available through it, is provided
              "as is" and "as available." We disclaim all warranties, express or
              implied, regarding the Service's uninterrupted operation,
              security, or absence of errors, viruses, or other harmful
              components. We also do not guarantee the prompt correction of any
              such issues.
              <br></br>
              <br></br>
              2. Reliance on Information and Accuracy of AI Headshots: No
              information or advice, whether written or oral, obtained from
              Proshoot.co or its affiliated entities shall create any warranty
              not expressly stated herein. You agree that you use the Service at
              your own sole risk and that Proshoot.co shall not be liable for
              any damage to your property (including your computer system or
              mobile device) or any loss of data, including User Content.
              <br></br>
              <br></br>
              3. Nature of Artificial Intelligence Technology: Proshoot.co
              leverages artificial intelligence and machine learning to generate
              headshots. You acknowledge and agree that this technology is under
              continuous development and subject to unexpected outputs. The AI
              Headshot Generator may produce results containing errors,
              omissions, or inaccuracies that do not precisely reflect
              real-world events, locations, individuals, or facts. Proshoot.co
              shall not be held liable for any mistakes, inaccuracies,
              omissions, or offensive content within the AI-generated headshots
              or any other content produced by the Service. You rely on the AI
              Headshots entirely at your own risk.
              <br></br>
              <br></br>
              4. Limitation of Liability: The limitations and disclaimers
              outlined in this section ("Limitations of Liability and
              Disclaimers") apply to the fullest extent permitted by applicable
              law. Proshoot.co does not disclaim any warranty or other right
              that it is prohibited from disclaiming under such law. In
              conclusion, by using Proshoot.co, you acknowledge the evolving
              nature of AI technology and the potential for imperfections in the
              generated headshots. We remain committed to ongoing advancements
              and providing you with a valuable and reliable headshot creation
              experience.
            </p>
          </div>
          {/* Disclaimer Ends Here */}
          {/* Refund Policy Starts Here */}
          <div className="space-y-3">
            <h3
              id="refund"
              className="text-xl font-bold md:text-2xl dark:text-white"
            >
              Refund Policy
            </h3>
            <p className="text-lg text-gray-800 dark:text-neutral-200">
              Proshoot.co is committed to exceeding your expectations. However,
              we understand that achieving the perfect headshot can be a
              subjective process. This policy outlines the conditions under
              which a full refund may be requested.
              <br></br>
              <br></br>
              Eligibility for Refund: A full refund of your purchase price is
              available if the following criteria are met:
              <br></br>
              <blockquote className="relative mt-2">
                <div className="relative z-10">
                  <p className="text-gray-800 sm:text-lg dark:text-white">
                    <em>
                      If you see Downloaded: False on Studio page, then your are
                      eligible for refund. This means your have not downloaded
                      any of images yet or the 7 day window is still open.
                      <br></br>
                      If you see Downloaded: True on Studio page, then your are
                      not eligible for refund. This means your have downloaded
                      any of images or the 7 day window is closed.
                    </em>
                  </p>
                </div>
              </blockquote>
              <br></br>
              <br></br>
              Unutilized Headshots: You have not downloaded any of the
              AI-generated headshots from your order. Your can download the
              images by clicking/tapping on "Download" button.<br></br>
              <br></br>Time Limit: Your request for a refund is submitted within
              seven (7) days of Studio Creation Date not the placing the order
              for your ease. Refund Process:
              <br></br>
              You're not eligible for for refund if you redo the studio, or
              upload less than 20 images(5 full-body shots, 5 medium shots, and
              10 close-ups) as shown on studio creation page on your dashboard.
              <br></br>
              To request a refund, please email us support@proshoot.co
              <br></br>
              <br></br>
              Processing Times: Refunds submitted through the self-service
              portal are typically processed within fourteen (14) business days.
              You will receive a confirmation email once your refund is
              complete.
              <br></br>
              <br></br>
              Our Commitment to Satisfaction: At Proshoot.co, your satisfaction
              is our top priority. This refund policy reflects our dedication to
              providing a positive user experience. If you have any questions or
              concerns, please feel free to reach out to our support team via
              email.
            </p>
          </div>
          {/* Refund Policy Ends Here */}
          {/* Fair Usage Policy Starts Here */}
          <div className="space-y-3">
            <h3
              id="fair-usage"
              className="text-xl font-bold md:text-2xl dark:text-white"
            >
              Fair Usage Policy
            </h3>
            <p className="text-lg text-gray-800 dark:text-neutral-200">
              Welcome to Proshoot.co! We empower users to leverage the power of
              AI for creative headshot generation. This Fair Use Policy outlines
              acceptable use guidelines to ensure a positive experience for all
              users.
              <br></br>
              <br></br>
              1. Responsible Content Creation: <br></br>Adhere to G-Rated
              Content: Proshoot.co prohibits the creation, upload, or sharing of
              any content deemed inappropriate for all audiences. <br></br>
              Respectful Representation: Avoid content promoting hate speech,
              harassment, violence, self-harm, or sexually suggestive material.{" "}
              <br></br>
              Avoid Sensitive Topics: Refrain from generating headshots
              depicting illegal activities, shocking imagery, or content related
              to public health, politics, or major news events that could be
              misleading. <br></br>Transparency in AI Use: When sharing your
              AI-generated headshots, be transparent about the role of AI in
              their creation.
              <br></br>
              <br></br>
              2. Respecting Intellectual Property: <br></br>Consent is Key:
              Uploading images of identifiable individuals requires their
              explicit consent. <br></br>Proper Licensing: Ensure you hold the
              appropriate usage rights for any uploaded images. <br></br>Public
              Figures: Generating headshots of public figures is not permitted.
              <br></br>
              <br></br>
              3. Reporting Violations: We encourage users to report any
              suspected violations of this Fair Use Policy by contacting our
              support team at [Your Email Address]. We will investigate all
              reports promptly and take appropriate action, including account
              termination in severe cases. By using Proshoot.co, you agree to
              abide by this Fair Use Policy. We reserve the right to modify this
              policy at any time. We encourage you to review this policy
              periodically to stay informed of any updates. Together, let's
              create a positive and responsible AI-powered experience for all!
            </p>
          </div>
          {/* Fair Usage Policy Ends Here */}
          <p className="text-lg text-gray-800 dark:text-neutral-200">
            Page Last Updated: Saturday, May 05, 2024
          </p>
        </div>
        {/* End Content */}
      </Container>
      {/* End Blog Article */}
      <Footer />
    </>
  );
}

export default Legal;

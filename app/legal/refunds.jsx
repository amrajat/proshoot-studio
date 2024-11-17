import Heading from "@/components/shared/heading";

function Refunds() {
  return (
    <div className="space-y-4">
      <Heading variant={"subtitle"}>Refund Policy</Heading>

      <section>
        <p>
          Proshoot.co is committed to exceeding your expectations. However, we
          understand that achieving the perfect headshot can be a subjective
          process. This policy outlines the conditions under which a full refund
          may be requested.
        </p>
      </section>

      <section>
        <h3>Eligibility for Refund:</h3>
        <p>
          A full refund of your purchase price is available if the following
          criteria are met:
        </p>
        <blockquote className="relative mt-2">
          <p>
            Downloaded: False on the Studio page means you are eligible for a
            refund, indicating that you have not downloaded any images yet or
            that the 7-day window is still open.
            <br />
            Downloaded: True on the Studio page means you are not eligible for a
            refund, indicating that you have downloaded images or that the 7-day
            window is closed.
          </p>
        </blockquote>
      </section>

      <section>
        <h3>Unutilized Headshots:</h3>
        <p>
          You have not downloaded any of the AI-generated headshots from your
          order. You can download the images by clicking or tapping on the
          "Download" button.
        </p>
      </section>

      <section>
        <h3>Time Limit:</h3>
        <p>
          Your refund request must be submitted within seven (7) days of the
          Studio Creation Date (not the order placement date) for your
          convenience.
        </p>
      </section>

      <section>
        <h3>Refund Process:</h3>
        <p>
          You're not eligible for a refund if you redo the studio or do not
          follow the image uploading guidelines shown on the studio creation
          page. To request a refund, please email us at support@proshoot.co.
        </p>
      </section>

      <section>
        <h3>Processing Times:</h3>
        <p>
          Refunds submitted through the self-service portal are typically
          processed within fourteen (14) business days. You will receive a
          confirmation email once your refund is complete.
        </p>
      </section>

      <section>
        <h3>Our Commitment to Satisfaction:</h3>
        <p>
          At Proshoot.co, your satisfaction is our top priority. This refund
          policy reflects our dedication to providing a positive user
          experience. If you have any questions or concerns, please feel free to
          reach out to our support team via email.
        </p>
      </section>
    </div>
  );
}

export default Refunds;

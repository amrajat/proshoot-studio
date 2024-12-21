import Heading from "@/components/shared/heading";

function Refunds() {
  return (
    <div className="space-y-4">
      <Heading variant={"subtitle"}>Refund Policy</Heading>

      <section>
        <p>
          We're committed to exceeding your expectations. However, we understand
          that achieving the perfect headshot is a subjective process. This
          policy outlines the conditions under which a full refund may be
          requested.
        </p>
      </section>

      <section>
        <p className="italic">
          We’ve kept everything as simple and jargon-free as possible. If you
          feel there’s room for improvement or greater transparency, please
          don’t hesitate to reach out and share your thoughts with us.
        </p>
      </section>

      <section>
        <p className="font-medium">
          You are eligible for a full refund if the following criteria are met:
        </p>
        <blockquote className="relative mt-2">
          <p>
            + If the{" "}
            <span className="font-medium underline">downloaded status</span> is{" "}
            <span className="font-medium underline">false</span> on the Studio
            page, it means you{" "}
            <span className="font-medium underline">
              are eligible for a refund
            </span>
            .
            <br />
            <span className="text-sm italic">
              This indicates that you have not downloaded any images, and the
              7-day window is still open.
            </span>
            <br />+ If the{" "}
            <span className="font-medium underline">downloaded status</span> is{" "}
            <span className="font-medium underline">true</span> on the Studio
            page, it means you{" "}
            <span className="font-medium underline">
              are not eligible for a refund
            </span>
            .
            <br />
            <span className="text-sm italic">
              This indicates that you have downloaded some or all images, or the
              7-day window has passed.
            </span>
          </p>
        </blockquote>
      </section>

      <section>
        <h3 className="font-medium">
          What are the Preview and Download buttons?
        </h3>
        <p>
          Our dashboard includes two buttons for your convenience: "
          <span className="font-medium underline">Preview</span>" and "
          <span className="font-medium underline">Download</span>".
          <br />
          <span className="font-medium underline">Preview</span>: Clicking the "
          <span className="font-medium underline">Preview</span>" button opens
          your headshots in a new window, where they remain compressed and
          watermarked. This allows you to examine each generated headshot before
          downloading.
          <br />
          <span className="font-medium underline">Download</span>: Clicking the
          "<span className="font-medium underline">Download</span>" button
          provides the images in full quality, with all watermarks removed. By
          clicking "<span className="font-medium underline">Download</span>",
          you confirm your satisfaction with the results, and the images will be
          marked as downloaded.
        </p>
        <br />
        <p className="font-medium underline">
          If you need headshots with custom outfits or backgrounds, feel free to
          reach out to us via chat or email. We’ll do our best to accommodate
          your request at no additional cost.
        </p>
      </section>

      <section>
        <p>
          + Refund requests must be submitted within seven (7) days of the
          Studio Creation Date (not the order placement date){" "}
          <span className="font-medium underline">for your convenience</span>.
        </p>
      </section>

      <section>
        <p>
          + Refunds are not eligible if you redo the studio or fail to follow
          the image uploading guidelines (
          <span className="font-medium underline">
            see our Simple Guidelines below
          </span>
          ) displayed on the studio creation page. To request a refund, please
          email us at support@proshoot.co.
        </p>
      </section>

      <section>
        <p>
          <span className="font-medium underline">+ Processing Times:</span>{" "}
          Refunds submitted through the self-service portal or via email are
          typically processed within{" "}
          <span className="font-medium underline">
            one to two (1-2) business days
          </span>
          . You will receive a confirmation email once your refund is complete.
        </p>
      </section>

      <section>
        <span className="font-medium underline">
          What are the image uploading guidelines? Is it too complicated?
        </span>
        <p>
          Please follow our{" "}
          <span className="font-medium underline">Simple Guidelines</span> for
          refund eligibility. Our face detection model will assist you in
          uploading quality images.
        </p>
        <p>
          <br />
          <span className="font-medium underline">Simple Guidelines:</span> To
          make it easy for you,{" "}
          <span className="font-medium underline">
            upload minimum 10 clearly visible, frontal face photos taken at
            different times, with different outfits, and maximum background
            variations if possible.
          </span>
        </p>
      </section>

      <section>
        <p>
          Your satisfaction is our top priority. This refund policy reflects our
          commitment to providing a positive user experience. If you have any
          questions or concerns, please don’t hesitate to contact our support
          team via email.
        </p>
      </section>
    </div>
  );
}

export default Refunds;

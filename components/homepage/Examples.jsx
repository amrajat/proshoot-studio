import SectionParaHeading from "@/components/shared/section-para-heading";
import StarRatings from "@/components/shared/star-ratings";
import Reviews from "@/components/shared/Reviews";

function Examples() {
  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="flex justify-center mb-4">
        <StarRatings size="size-4" />
      </div>
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <SectionParaHeading badgeText={"Trust"} title={"reviews and examples"}>
          Curious about the quality of our AI headshot generator? Check out the
          professional headshots we've created for our customers. Special thanks
          to them for allowing us to showcase their headshots here.
        </SectionParaHeading>
      </div>
      <Reviews />
    </section>
  );
}

export default Examples;

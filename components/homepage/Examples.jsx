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
        <SectionParaHeading
          badgeText={"Trust"}
          title={"Reviews, Examples, and Ratings"}
        >
          Professional online profiles are drastically changing with our
          Proshoot AI Headshot Generator. Customers enjoy the simplicity of the
          process, high-quality images, and their ethnicity being represented
          accurately. They appreciate the strong resemblance to their features
          and the wide range of style options available. Plus, our technology
          ensures no deformation, guaranteeing a natural and authentic look.
          Measures are actively being put in place to improve on generating the
          same at a faster rate.
        </SectionParaHeading>
      </div>
      <Reviews />
    </section>
  );
}

export default Examples;

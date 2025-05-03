"use client";
import { ArrowRight } from "lucide-react";
import SectionParaHeading from "@/components/shared/section-para-heading";
import StarRatings from "@/components/shared/star-ratings";
import Link from "next/link";
import Reviews from "@/components/shared/Reviews";
import { buttonVariants } from "@/components/ui/button";

function AIHeadshotExamples() {
  return (
    <>
      <div className="flex justify-center mb-4">
        <StarRatings />
      </div>

      <SectionParaHeading badgeText={"Trust"} title={"examples and reviews"}>
        Curious about the quality of headshots we can generate? Check out these
        examples to explore ultra-realistic professional headshots generated
        using our AI headshot generator.
      </SectionParaHeading>
      <div className="container text-center mx-auto">
        <div className="mt-8 gap-3 flex justify-center flex-col">
          <Link
            href="/dashboard/studio"
            className={
              buttonVariants({
                variant: "destructive",
                size: "lg",
              }) + " self-center h-12 px-10"
            }
          >
            Generate AI Headshots
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <span className="text-xs font-light mb-8">
            Trust & Safety - We will not use images without the customer's
            consent, nor will we sell your pictures to anyone. All photos will
            be deleted from the server within 30 days. You may request immediate
            deletion of images by contacting us.
          </span>
        </div>
      </div>

      <Reviews />
    </>
  );
}

export default AIHeadshotExamples;

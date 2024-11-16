"use client";
import { ArrowRight, Check, Quote, Sparkles, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useState } from "react";
import SectionParaHeading from "@/components/shared/section-para-heading";
import StarRatings from "@/components/shared/star-ratings";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Reviews from "@/components/shared/Reviews";

// Mock data for reviews
const mockReviews = Array(30)
  .fill(null)
  .map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    // Comment limit is already set so don't exceed this comment limit.
    comment: `This is a sample review ${
      i + 1
    }. The product is great! I'd highly recommend everyone. The moment i got my images i was very happy`,
    image: `/examples/ai-portrait-1.jpg`,
  }));

const aiSummary = {
  id: "ai-summary",
  name: "AI Summary",
  rating: 5,
  image: "/examples/ai-portrait-1.jpg",
  comment: `Customers find the headshots easy to generate and appreciate
                    the high resolution, realistic look, and accurate ethnicity
                    representation. Many mention satisfaction with the strong
                    resemblance to their features and the variety of style
                    options available. They also highlight that the headshots
                    consistently avoid deformations. However, several users note
                    that the generation process takes considerable time, with
                    some expressing that it could be faster.`,
};

function AIHeadshotExamples() {
  return (
    <>
      <div className="flex justify-center mb-4">
        <StarRatings />
      </div>

      <SectionParaHeading badgeText={"Trust"} title={"See our AI Headshots"}>
        Curious about the quality of headshots Proshoot.co can generate? Take a
        look at these examples and discover the potential for professional,
        personalized portraits created.
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

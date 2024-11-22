"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StarRatings from "@/components/shared/star-ratings";
import { REVIEWS_ARRAY } from "@/lib/reviews";

import { Button } from "@/components/ui/button";

function TestimonialSlider() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % REVIEWS_ARRAY.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + REVIEWS_ARRAY.length) % REVIEWS_ARRAY.length
    );
  };

  return (
    <div className="relative hidden w-0 flex-1 lg:block">
      <Image
        className="absolute aspect-square inset-0 h-full w-full object-cover"
        src={REVIEWS_ARRAY[currentTestimonial].squareImage}
        alt="Background"
        width={832}
        height={832}
        quality={100}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent bg-opacity-10 flex lg:flex-none flex-col justify-end p-12">
        {/* <div className="absolute inset-0 bottom-0 bg-gradient-to-t from-foreground to-transparent p-12"> */}
        <blockquote className="text-white text-2xl font-medium mb-4">
          {REVIEWS_ARRAY[currentTestimonial].comment}
        </blockquote>
        <div className="text-white">
          <p className="font-semibold">
            {REVIEWS_ARRAY[currentTestimonial].name}
          </p>
          {/* <p>
            {REVIEWS_ARRAY[currentTestimonial].position &&
              REVIEWS_ARRAY[currentTestimonial].company &&
              `${REVIEWS_ARRAY[currentTestimonial].position} at ${REVIEWS_ARRAY[currentTestimonial].company}`}
            {REVIEWS_ARRAY[currentTestimonial].position &&
              !REVIEWS_ARRAY[currentTestimonial].company &&
              `${REVIEWS_ARRAY[currentTestimonial].position}`}
            {!REVIEWS_ARRAY[currentTestimonial].position &&
              !REVIEWS_ARRAY[currentTestimonial].company &&
              "Proshoot Customer"}
          </p> */}
        </div>
        <div className="flex items-center mt-4">
          <StarRatings rating={REVIEWS_ARRAY[currentTestimonial].rating} />
        </div>
        <div className="flex space-x-2 mt-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={prevTestimonial}
            className="rounded-full bg-transparent border text-muted"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={nextTestimonial}
            className="rounded-full bg-transparent border text-muted"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
export default TestimonialSlider;

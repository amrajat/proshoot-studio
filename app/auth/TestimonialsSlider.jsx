"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StarRatings from "@/components/shared/star-ratings";

import { Button } from "@/components/ui/button";

function TestimonialSlider() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };
  const testimonials = [
    {
      quote:
        "We move 10x faster than our peers and stay consistent. While they're bogged down with design debt, we're releasing new features.",
      author: "Sophie Hall",
      role: "Founder, Catalog",
      company: "Web Design Agency",
      rating: 5,
      image: "/how-to-generate-ai-headshot.jpg",
    },
    {
      quote: "This is new testimonial from best user",
      author: "Say My Name",
      role: "God mode, Catalog",
      company: "VC ruined",
      rating: 5,
      image: "/how-to-generate-ai-headshot.jpg",
    },
    // Add more testimonials here
  ];
  return (
    <div className="relative hidden w-0 flex-1 lg:block">
      <Image
        className="absolute inset-0 h-full w-full object-cover"
        src={testimonials[currentTestimonial].image}
        alt="Background"
        width={1200}
        height={800}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-12">
        <blockquote className="text-white text-2xl font-medium mb-4">
          {testimonials[currentTestimonial].quote}
        </blockquote>
        <div className="text-white">
          <p className="font-semibold">
            {testimonials[currentTestimonial].author}
          </p>
          <p>
            {testimonials[currentTestimonial].role},{" "}
            {testimonials[currentTestimonial].company}
          </p>
        </div>
        <div className="flex items-center mt-4">
          <StarRatings />
        </div>
        <div className="flex space-x-2 mt-4">
          <Button variant="secondary" size="icon" onClick={prevTestimonial}>
            <ChevronLeft />
          </Button>
          <Button variant="secondary" size="icon" onClick={nextTestimonial}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
export default TestimonialSlider;

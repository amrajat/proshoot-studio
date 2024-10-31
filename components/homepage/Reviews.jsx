"use client";
import { Check, Quote, Sparkles, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
import SectionParaHeading from "@/components/shared/section-para-heading";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function Reviews() {
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [selectedReview, setSelectedReview] = useState(null);

  const loadMore = () => {
    setVisibleReviews((prev) => Math.min(prev + 4, mockReviews.length));
  };

  const truncateComment = (comment, maxLength = 100) => {
    if (comment.length <= maxLength) return comment;
    return comment.slice(0, maxLength) + "... ";
  };

  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="flex justify-center mb-4">
        <RatingStars />
      </div>

      <SectionParaHeading
        badgeText={"Trust"}
        title={"4.5 rating of 237 reviews"}
      >
        Customers find the headshots easy to generate and appreciate the high
        resolution, realistic look, and accurate ethnicity representation. Many
        mention satisfaction with the strong resemblance to their features and
        the variety of style options available. They also highlight that the
        headshots consistently avoid deformations. However, several users note
        that the generation process takes considerable time, with some
        expressing that it could be faster.
      </SectionParaHeading>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* AI Summary Starts here */}
          <div className="relative overflow-hidden rounded-lg shadow-md">
            <AspectRatio ratio={2 / 3} className="relative rounded">
              {/* <Image
                src={"/examples/ai-portrait-1.jpg"}
                fill
                className="object-cover"
                alt={`Before`}
              /> */}
              <div className="absolute h-full bg-foreground top-0 right-0 text-muted py-2 px-1">
                <span className="[writing-mode:vertical-lr] transform rotate-180 uppercase text-xs tracking-widest">
                  Summarized by Claude Sonnet 3.5
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground to-transparent"></div>
              <div className="absolute top-2.5 left-2.5">
                <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                  <Sparkles className="text-destructive" strokeWidth={1.5} />
                  AI <span className="italic">Summary</span>
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Quote className="scale-[-1] text-destructive block lg:hidden xl:hidden 2xl:block" />

                <blockquote className="mt-3">
                  <p className="text-sm italic font-medium text-muted block lg:hidden xl:hidden 2xl:block">
                    {truncateComment(aiSummary.comment, 175)}
                    {aiSummary.comment.length > 100 && (
                      <Button
                        variant="link"
                        className="text-sm text-muted underline p-0 h-auto"
                        onClick={() => setSelectedReview(aiSummary)}
                      >
                        read more
                      </Button>
                    )}
                  </p>

                  <Badge
                    variant="secondary"
                    className="flex items-center justify-self-start cursor-pointer hidden lg:block xl:block 2xl:hidden"
                    onClick={() => setSelectedReview(aiSummary)}
                  >
                    Show AI Summary
                  </Badge>
                </blockquote>
                <div className="flex flex-wrap gap-1 mt-3">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    Easy
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    High Resolution
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    Maintains Ethnicity
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    Satisfaction
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    Realistic
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    Resemblance
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    Style
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Check size={16} strokeWidth={1.5} />
                    No Deformation
                  </Badge>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <X size={16} strokeWidth={1.5} />
                    Time
                  </Badge>
                </div>
                {/* <p className="text-xs text-muted mt-1">Summarized by Claude.</p> */}

                {/* <RatingStars /> */}
              </div>
            </AspectRatio>
          </div>
          {/* AI Summary Ends here */}
          {mockReviews.slice(0, visibleReviews).map((review, index) => (
            <div
              key={review.id}
              className="relative overflow-hidden rounded-lg shadow-md"
            >
              <AspectRatio ratio={2 / 3} className="relative rounded">
                <Image
                  src={review.image}
                  fill
                  className="object-cover"
                  alt={`Before ${review.name}`}
                />
                <div className="absolute h-full bg-foreground top-0 right-0 text-muted py-2 px-1">
                  <span className="[writing-mode:vertical-lr] transform rotate-180 uppercase text-xs tracking-widest">
                    Generated with our latest fai model
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground to-transparent"></div>
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                    <Sparkles className="text-destructive" strokeWidth={1.5} />
                    AI <span className="italic">Generated</span>
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <Quote className="scale-[-1] text-destructive" />

                  <blockquote className="mt-3">
                    <p className="text-sm italic font-medium text-muted">
                      {truncateComment(review.comment)}
                      {review.comment.length > 100 && (
                        <Button
                          variant="link"
                          className="text-sm text-muted underline p-0 h-auto"
                          onClick={() => setSelectedReview(review)}
                        >
                          read more
                        </Button>
                      )}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-normal text-muted">
                          {review.name}
                        </p>
                        <p className="text-xs text-muted">
                          President at Bankers Life Securities
                        </p>
                      </div>
                    </div>
                  </blockquote>
                  <RatingStars />
                </div>
              </AspectRatio>
            </div>
          ))}
        </div>
        {visibleReviews < mockReviews.length && (
          <div className="text-center mt-8">
            <Button size={"sm"} variant={"secondary"} onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
      {/* Full Review Modal */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedReview?.name}'s Review</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm">{selectedReview?.comment}</p>
            <div className="mt-4">
              <RatingStars />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Reviews;

const RatingStars = () => {
  return (
    <div className="mt-3 flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span className="bg-green-600 p-1" key={i}>
          <svg
            height="21px"
            version="1.1"
            viewBox="0 0 20 21"
            width="20px"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="size-4 text-muted fill-muted"
          >
            <title />
            <desc />
            <defs />
            <g
              fill="none"
              fillRule="evenodd"
              id="Page-1"
              stroke="none"
              strokeWidth={1}
            >
              <g
                fill="currentColor"
                id="Core"
                transform="translate(-296.000000, -422.000000)"
              >
                <g id="star" transform="translate(296.000000, 422.500000)">
                  <path
                    d="M10,15.273 L16.18,19 L14.545,11.971 L20,7.244 L12.809,6.627 L10,0 L7.191,6.627 L0,7.244 L5.455,11.971 L3.82,19 L10,15.273 Z"
                    id="Shape"
                  />
                </g>
              </g>
            </g>
          </svg>
        </span>
      ))}
    </div>
  );
};

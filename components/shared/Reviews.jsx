"use client";
import { Check, Quote, Sparkles, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { REVIEWS_ARRAY } from "@/lib/reviews";
import StarRatings from "./star-ratings";

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
    setVisibleReviews((prev) => Math.min(prev + 4, REVIEWS_ARRAY.length));
  };

  const truncateComment = (comment, maxLength = 100) => {
    if (comment.length <= maxLength) return comment;
    return comment.slice(0, maxLength) + "... ";
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* AI Summary Starts here */}
          <div className="relative overflow-hidden rounded-lg shadow-md">
            <AspectRatio ratio={2 / 3} className="relative rounded">
              <Image
                src={"/ai-summary-bg.jpeg"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                alt={`ai summary written by a robot`}
              />
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
                  {[
                    "Easy",
                    "High Resolution",
                    "Realistic",
                    "Resemblance",
                    "Style",
                    "No Deformation",
                  ].map((title, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Check size={16} strokeWidth={1.5} />
                      {title}
                    </Badge>
                  ))}
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <X size={16} strokeWidth={1.5} />
                    Time
                  </Badge>
                </div>
              </div>
            </AspectRatio>
          </div>
          {/* AI Summary Ends here */}
          {REVIEWS_ARRAY.slice(0, visibleReviews).map((review, index) => (
            <div
              key={review.id}
              className="relative overflow-hidden rounded-lg shadow-md"
            >
              <AspectRatio ratio={2 / 3} className="relative rounded">
                <Image
                  src={review.headshot}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  alt={`ai headshot review by ${review.name}`}
                />
                {review?.latestModel !== false ? (
                  <div className="absolute h-full bg-foreground top-0 right-0 text-muted py-2 px-1">
                    <span className="[writing-mode:vertical-lr] transform rotate-180 uppercase text-xs tracking-widest">
                      Generated with our latest f.ai model
                    </span>
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground to-transparent"></div>
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                    <Sparkles className="text-destructive" strokeWidth={1.5} />
                    AI <span className="italic">Generated</span>
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  {review.comment.length > 1 && (
                    <Quote className="scale-[-1] text-destructive" />
                  )}

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
                      <div className="flex-1 min-w-0 mb-1">
                        <p className="text-base font-normal text-muted">
                          {review.name}
                        </p>
                        {/* <p className="text-xs text-muted">
                          {review.position &&
                            review.company &&
                            `${review.position} at ${review.company}`}
                          {review.position &&
                            !review.company &&
                            `${review.position}`}
                          {!review.position &&
                            !review.company &&
                            "Proshoot Customer"}
                        </p> */}
                      </div>
                    </div>
                  </blockquote>
                  <StarRatings size="size-4" rating={review.rating} />
                </div>
              </AspectRatio>
            </div>
          ))}
        </div>
        {visibleReviews < REVIEWS_ARRAY.length && (
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
              <StarRatings size="size-4" rating={selectedReview?.rating} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Reviews;

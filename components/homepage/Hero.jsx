import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles, Trophy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRatings from "@/components/shared/star-ratings";
import { REVIEWS_ARRAY } from "@/lib/reviews";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Tooltip from "@/components/shared/tooltip";

function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24 pb-0 sm:pb-0">
      <div className="container mx-auto px-4 py-8 pb-0">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h5 className="py-1 px-2 rounded-lg flex text-xs font-normal gap-1 items-center text-foreground bg-success/15 justify-self-center mb-2 sm:text-sm lg:text-base">
            <Sparkles className="text-success" /> New AI Headshot Model Upgraded
            on November, 2024{" "}
            <Tooltip content="This newer model produces ultra-realistic ai headshots with the highest resemblance possible to date." />
          </h5>

          <h5 className="py-1 px-2 rounded-lg flex text-xs font-normal gap-1 items-center text-foreground bg-success/15 justify-self-center mb-6 sm:text-sm lg:text-base">
            <Trophy className="text-success" />
            The #1 Realistic Professional Headshots Generator{" "}
            <Tooltip content="We do not use any harsh upscaler that makes your face look plastic. We focus on realism and resemblance." />
          </h5>
          <h2 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] mb-6">
            Create Professional Headshots from Everyday Photos with AI Headshot
            Generator
          </h2>

          <p className="text-lg font-light text-foreground mb-8">
            Effortlessly create high-quality, professional headshots with the
            best AI headshot generator. Perfect for social media, business
            cards, team pages, and online presence. Trusted by businesses &
            individuals worldwide.
          </p>

          <div className="flex flex-col items-center justify-center mb-8 gap-4">
            <Link
              href="/auth"
              className={
                buttonVariants({
                  variant: "destructive",
                  size: "lg",
                }) + " h-12 px-10"
              }
            >
              Create your AI Headshots Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <span className="text-muted-foreground text-sm flex items-center justify-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-success" />
              7-days money-back guarantee
            </span>
          </div>
          <UsedByHappyCustomers />
          <MediaLogos />
          <ReviewsCarousel />
        </div>
      </div>
      <LeftImage />
      <RightImage />
    </section>
  );
}

export default Hero;

const LeftImage = () => {
  return (
    <div className="absolute left-5 top-10 hidden w-1/6 max-w-[250] justify-self-start xl:block">
      <div className="relative aspect-[2/3] border shadow-xl overflow-hidden rounded">
        <Image
          src="/examples/ai-portrait-2.jpg"
          alt="ai headshot"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
};
const RightImage = () => {
  return (
    <div className="absolute right-5 top-10 hidden w-1/6 max-w-[250] justify-self-start xl:block">
      <div className="relative aspect-[2/3] border shadow-xl overflow-hidden rounded">
        <Image
          src="/examples/ai-portrait-3.jpg"
          alt="ai headshot"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

const ReviewsCarousel = () => {
  return (
    <Carousel className="w-full max-w-4xl mt-2">
      <CarouselContent>
        {REVIEWS_ARRAY.filter((review) => review.comment.length > 1).map(
          (review) => (
            <CarouselItem key={review.id}>
              <Card className="rounded bg-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-4">
                    <StarRatings rating={review.rating} />
                  </div>
                  <p className="text-base font-light text-accent-foreground text-center italic">
                    {review.comment}
                  </p>
                  <div className="mt-4 mb-2 flex flex-col items-center justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="flex -space-x-2">
                      <Avatar className="w-8 h-8 border-2 border-background">
                        <AvatarImage
                          src={review.avatar}
                          alt={`ai headshot generator review by ${review.name}}`}
                        />
                        <AvatarFallback>{review.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {review.name},{" "}
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      {review.position &&
                        review.company &&
                        `${review.position} at ${review.company}`}
                      {review.position &&
                        !review.company &&
                        `${review.position}`}
                      {!review.position &&
                        !review.company &&
                        "Proshoot Customer"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          )
        )}
      </CarouselContent>
      <CarouselPrevious className="relative" />
      <CarouselNext className="relative" />
    </Carousel>
  );
};

const UsedByHappyCustomers = () => {
  const customerAvatars = [
    "/avatar-1.jpg",
    "/avatar-2.jpg",
    "/avatar-3.jpg",
    "/avatar-4.jpg",
  ];
  return (
    <div className="mt-8 mb-4 flex flex-col items-center justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
      <div className="flex -space-x-2">
        {customerAvatars.map((avatar, i) => (
          <Avatar key={i} className="w-8 h-8 border-2 border-background">
            <AvatarImage src={avatar} alt={`User avatar ${i + 1}`} />
            <AvatarFallback>U{i + 1}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        <span className="font-bold">400,000+ headshots</span> created for{" "}
        <span className="font-bold">7,000+ happy customers</span>
      </p>
    </div>
  );
};

const MediaLogos = () => {
  const mediaLogosArray = [
    {
      name: "The Next Web",
      src: "/media-publishers/tnw.svg",
    },
    {
      name: "Bloomberg",
      src: "/media-publishers/bloomberg.svg",
    },
    {
      name: "Wired",
      src: "/media-publishers/wired.svg",
    },
    {
      name: "Vice",
      src: "/media-publishers/vice.svg",
    },
    {
      name: "Y Combinator",
      src: "/media-publishers/yc.svg",
    },
  ];
  return (
    <div className="flex flex-wrap justify-center items-center gap-8">
      {/* <p className="text-sm text-muted-foreground">As seen on</p> */}
      {mediaLogosArray.map((logo, index) => (
        <Image
          key={index}
          src={logo.src}
          alt={`As seen on ${logo.name}`}
          width={60}
          height={15}
          priority={index < 4} // Load the first 4 images with priority
          className="opacity-50 hover:opacity-100 transition-opacity duration-300"
        />
      ))}
    </div>
  );
};

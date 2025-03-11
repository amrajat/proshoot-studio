"use client";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles, Trophy, Quote } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRatings from "@/components/shared/star-ratings";
import { REVIEWS_ARRAY } from "@/lib/reviews";
import Autoplay from "embla-carousel-autoplay";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Tooltip from "@/components/shared/tooltip";

function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24 pb-0 sm:pb-0">
      <div className="container mx-auto px-4 py-8 pb-0">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="py-1 px-2 rounded-lg inline-flex text-xs font-normal gap-1 items-center text-foreground bg-success/15 mx-auto mb-2 sm:text-sm lg:text-base">
            <Trophy className="text-success" />
            Best AI Headshot Generator for Hyper-Realistic Professional
            Headshots{" "}
            <Tooltip content="We do not use any harsh upscaler that makes your face look plastic. We focus on realism and resemblance." />
          </h1>
          <h5 className="py-1 px-2 rounded-lg inline-flex text-xs font-normal gap-1 items-center text-foreground bg-success/15 mx-auto mb-6 sm:text-sm lg:text-base">
            <Sparkles className="text-success" /> New AI Headshot Model Upgraded
            on March, 2025{" "}
            <Tooltip content="This newer model produces ultra-realistic ai headshots with the highest resemblance possible to date." />
          </h5>
          <div className="relative">
            <h2 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] mb-6 lowercase">
              Create{" "}
              <span className="relative">
                Hyper-Realistic
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,5 Q25,8 50,5 T100,5"
                    fill="none"
                    stroke="hsl(var(--destructive))"
                    strokeWidth="2"
                    className="opacity-50"
                  />
                </svg>
              </span>{" "}
              Professional Headshots from Everyday Photos
            </h2>
            {/* Add this new circular label */}
            <div className="absolute left-0 -translate-y-1/2 top-0 hidden lg:block">
              <div className="relative w-32 h-32">
                {/* Center circle with "NO UPSCALER" text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-10 bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-xs font-semibold text-destructive text-center leading-tight">
                      NO HARSH
                      <br />
                      UPSCALER
                    </span>
                  </div>
                </div>
                {/* Rotating text around the circle */}
                <div className="absolute inset-0 animate-spin-slow">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <path
                      id="circlePath"
                      d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="none"
                    />
                    <text className="text-[8px]">
                      <textPath
                        href="#circlePath"
                        className="text-muted-foreground uppercase"
                      >
                        {}· no use of upscalers that makes face looks plastic
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>
            </div>
            {/* end circular table */}
          </div>

          <p className="text-lg font-light text-foreground mb-8">
            Effortlessly generate hyper-realistic, studio-grade professional
            headshots by uploading everyday photos or selfies. Receive hundreds
            of professional headshots in various styles, poses, and outfits that
            are indistinguishable from real ones.
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

          {/* Mobile RightImage - visible on smaller screens */}
          <CenterImageMobile />

          <ReviewsCarousel />
          <UsedByHappyCustomers />
          {/* <MediaLogos /> */}
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
    <div className="absolute left-5 top-10 hidden w-1/6 max-w-[250] justify-self-start xl:block shadow-md">
      <div className="relative overflow-hidden rounded-lg shadow-md">
        <AspectRatio ratio={2 / 3} className="relative rounded">
          <Image
            src="/examples/ai-portrait-2.jpg"
            alt="ai headshot of customer Valerie Leavy"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground to-transparent"></div>
          <div className="absolute top-2.5 left-2.5">
            <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
              <Sparkles className="text-destructive" strokeWidth={1.5} />
              AI <span className="italic">Generated</span>
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <div className="flex items-center gap-4 mt-3">
              <div className="flex-1 min-w-0 mb-1">
                <p className="text-base font-normal text-muted">
                  Valerie Leavy
                </p>
                <p className="text-xs text-muted">Proshoot Customer</p>
              </div>
            </div>
            <StarRatings size="size-3" rating={5} />
          </div>
        </AspectRatio>
      </div>

      <Image
        className="absolute top-full right-0 translate-y-1/2 -translate-x-2/3 rounded shadow-sm object-cover border"
        src={"/selfie-4.jpg"}
        width={100}
        height={100}
        alt="selfie of customer valerie leavy"
      />
      <Image
        className="absolute -translate-x-1/2 translate-y-full scale-x-[-1] rotate-45 bottom-0 right-0 opacity-100"
        src={"/arrow.svg"}
        width={100}
        height={100}
        alt="arrow svg icon, pointing to downside"
      />
    </div>
  );
};
const RightImage = () => {
  return (
    <div className="absolute right-5 top-10 hidden w-1/6 max-w-[250] justify-self-start xl:block shadow-md">
      <div className="relative overflow-hidden rounded-lg shadow-md">
        <AspectRatio ratio={2 / 3} className="relative rounded">
          <Image
            src="/examples/ai-portrait-26.jpg"
            alt="ai headshot of customer Pranay Airan"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground to-transparent"></div>
          <div className="absolute top-2.5 right-2.5">
            <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
              <Sparkles className="text-destructive" strokeWidth={1.5} />
              AI <span className="italic">Generated</span>
            </span>
          </div>
          <div className="absolute flex flex-col self-end justify-self-end inset-x-0 bottom-0 p-2.5">
            <div className="flex justify-self-end items-center gap-4 mt-3">
              <div className="flex-1 min-w-0 mb-1">
                <p className="text-base justify-self-end font-normal text-muted">
                  Pranay Airan
                </p>
                <p className="text-xs justify-self-end text-muted">
                  IIIT, Bangalore
                </p>
              </div>
            </div>
            <StarRatings size="size-3" rating={5} />
          </div>
        </AspectRatio>
      </div>

      <Image
        className="absolute top-full left-0 translate-y-1/2 translate-x-2/3 rounded shadow-sm object-cover border"
        src={"/selfie-3.jpg"}
        width={100}
        height={100}
        alt="selfie of customer pranay airan"
      />
      <Image
        className="absolute translate-x-1/2 -scale-x-[-1] translate-y-full -rotate-45 bottom-0 left-0 opacity-100"
        src={"/arrow.svg"}
        width={100}
        height={100}
        alt="arrow svg icon, pointing to upside"
      />
    </div>
  );
};

const ReviewsCarousel = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-4xl"
      plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]}
    >
      <CarouselContent>
        {REVIEWS_ARRAY.filter((review) => review.comment.length > 1).map(
          (review) => (
            <CarouselItem key={review.id}>
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-2">
                  <div className="flex items-center justify-center">
                    <StarRatings size="size-3" rating={review.rating} />
                  </div>
                  <p className="text-sm font-light text-accent-foreground text-center italic my-2">
                    {review.comment}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Avatar className="h-6 w-6 border border-background">
                      <AvatarImage
                        src={review.avatar}
                        alt={`ai headshot generator review by ${review.name}}`}
                      />
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {review.name}
                      {/* {review.position &&
                        review.company &&
                        `, ${review.position} at ${review.company}`}
                      {review.position &&
                        !review.company &&
                        `, ${review.position}`}
                      {!review.position &&
                        !review.company &&
                        ", Proshoot Customer"} */}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          )
        )}
      </CarouselContent>
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

const CenterImageMobile = () => {
  return (
    <div className="block xl:hidden mb-32 mt-4 max-w-[280px] mx-auto relative">
      <div className="relative overflow-hidden rounded-lg shadow-md">
        <AspectRatio ratio={3 / 4} className="relative rounded">
          <Image
            src="/examples/ai-portrait-26.jpg"
            alt="ai headshot of customer Pranay Airan"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground to-transparent"></div>
          <div className="absolute top-2.5 right-2.5">
            <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
              <Sparkles className="text-destructive" strokeWidth={1.5} />
              AI <span className="italic">Generated</span>
            </span>
          </div>
          <div className="absolute flex flex-col self-end justify-self-end inset-x-0 bottom-0 p-2.5">
            <div className="flex justify-self-end items-center gap-4 mt-3">
              <div className="flex-1 min-w-0 mb-1">
                <p className="text-base justify-self-end font-normal text-muted">
                  Pranay Airan
                </p>
                <p className="text-xs justify-self-end text-muted">
                  IIIT, Bangalore
                </p>
              </div>
            </div>
            <StarRatings size="size-3" rating={5} />
          </div>
        </AspectRatio>
      </div>

      <Image
        className="absolute bottom-[-100px] w-[80px] h-[80px] rounded shadow-sm object-cover border"
        src={"/selfie-3.jpg"}
        width={80}
        height={80}
        alt="selfie of customer pranay airan"
      />
      <Image
        className="absolute bottom-[-50px] left-[40px] w-[80px] h-[80px] rotate-[135deg]"
        src={"/arrow.svg"}
        width={80}
        height={80}
        alt="arrow svg icon, pointing to upside"
      />
    </div>
  );
};

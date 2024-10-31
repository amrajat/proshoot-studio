import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles, Trophy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRatings from "@/components/shared/star-ratings";

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
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h5 className="py-1 px-2 rounded-lg flex text-xs font-normal gap-1 items-center text-foreground bg-primary/15 justify-self-center mb-2 sm:text-sm lg:text-base">
            <Sparkles className="text-primary" /> New AI Model Upgraded on
            October, 2024{" "}
            <Tooltip content="This newer model produces ultra-realistic images with the highest resemblance possible to date." />
          </h5>

          <h5 className="py-1 px-2 rounded-lg flex text-xs font-normal gap-1 items-center text-foreground bg-primary/15 justify-self-center mb-6 sm:text-sm lg:text-base">
            <Trophy className="text-primary" /> The #1 Realistic AI Headshot
            Generator for Professional Headshots{" "}
            <Tooltip content="You'll love it 😍..." />
          </h5>
          <h2 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] mb-6">
            Generate Professional Headshots from Everyday Photos with AI.
          </h2>

          <p className="text-lg font-light text-foreground mb-8">
            Get studio-quality headshots in minutes, not weeks. Perfect for
            LinkedIn, resumes, and personal branding.
          </p>

          <div className="flex flex-col items-center justify-center mb-8 gap-4">
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "destructive",
                size: "lg",
              })}
            >
              Generate AI Headshots
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <span className="text-muted-foreground text-sm flex items-center justify-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
              7-days money-back guarantee
            </span>
          </div>
          <UsedByHappyCustomers />
          <ReviewsCarousel />
        </div>
        <TrustedByCompanies />
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
      <div className="relative aspect-[250/460]">
        <Image
          src="/left.png"
          alt="Left image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
};
const RightImage = () => {
  return (
    <div className="absolute right-5 top-10 hidden w-1/6 max-w-[250] justify-self-start xl:block">
      <div className="relative aspect-[250/460]">
        <Image
          src="/right.png"
          alt="Left image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
};

const ReviewsCarousel = () => {
  const mediaLogos = [
    {
      name: "Bloomberg",
      src: "/bloomberg.svg?height=30&width=120",
    },
    {
      name: "Wired",
      src: "/wired.svg?height=30&width=120",
    },
    {
      name: "Vice",
      src: "/vice.svg?height=30&width=120",
    },
  ];
  return (
    <Carousel className="w-full max-w-4xl">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            {/* <div className="p-1"> */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-4">
                  <StarRatings />
                </div>
                <p className="text-sm text-muted-foreground text-center italic">
                  I needed a professional headshot for my online presence but
                  didn't have the time for a traditional photo shoot. It saved
                  the day! The AI-generated image was flawless and It captured
                  my essence perfectly. The attention to detail and realism
                  makes it a winner in my book.
                </p>
                <div className="mt-4 mb-2 flex flex-col items-center justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                  <div className="flex -space-x-2">
                    <Avatar className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={"/avatar-2.jpg"} alt={`User avatar`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Brian
                  </p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-8">
                  {mediaLogos.map((logo, index) => (
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
              </CardContent>
            </Card>
            {/* </div> */}
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious />
      <CarouselNext /> */}
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

const TrustedByCompanies = () => {
  const companyLogos = [
    { name: "Byte Dance", src: "/bytedance.svg?height=30&width=120" },
    { name: "Dell Technologies", src: "/dell.svg?height=30&width=100" },
    { name: "JP Morgan Chase", src: "/jpmorgan.svg?height=30&width=80" },
    { name: "Meta", src: "/meta.svg?height=30&width=100" },
    { name: "Mozilla Firefox", src: "/mozilla.svg?height=30&width=100" },
    { name: "Open AI", src: "/openai.svg?height=30&width=100" },
    { name: "Vercel", src: "/vercel.svg?height=30&width=100" },
    { name: "Retool", src: "/retool.svg?height=30&width=100" },
  ];
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Trusted by Employees of the Best Companies
      </h2>
      <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
        {companyLogos.map((logo, index) => (
          <Image
            key={index}
            src={logo.src}
            alt={`As seen on ${logo.name}`}
            width={120}
            height={30}
            className="opacity-50 hover:opacity-100 transition-opacity duration-300"
          />
        ))}
      </div>
    </div>
  );
};

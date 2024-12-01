import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Upload } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import SectionParaHeading from "../shared/section-para-heading";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export default function HeadshotShowcase() {
  const gridImages = Array(6).fill("1");

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <SectionParaHeading
            badgeText={"Upload"}
            title={"upload your everyday photos"}
          >
            and receive hundreds of ultra-realistic professional headshots with
            various outfits, styles, poses, lighting, and backgrounds,
            indistinguishable from the real ones. Watch them come to life with
            hyper-realistic detail.
          </SectionParaHeading>
          <Link
            href="/auth"
            className={
              buttonVariants({
                variant: "destructive",
                size: "lg",
              }) + " h-12 px-10 mb-6"
            }
          >
            Upload Photos & Generate Headshots
            <Upload className="ml-2 h-5 w-5" />
          </Link>
          <div className="flex justify-center items-center space-x-[-0.5rem] mb-4">
            {[...Array(3).keys()].map((avatar, index) => (
              <Avatar
                key={index}
                className="w-12 h-12 border-2 border-destructive"
              >
                <img src={`/selfie-${index + 1}.jpg`} alt="profile avatar" />
              </Avatar>
            ))}
            <Avatar className="w-12 h-12 border-2 border-destructive">
              <AvatarFallback className="font-semibold text-destructive">
                +3
              </AvatarFallback>
            </Avatar>
          </div>
          <Image
            src={"/arrow.svg"}
            className="mx-auto scale-[-1] -rotate-45 mt-10 mb-12"
            width={150}
            height={150}
            alt="arrow pointing down"
          />
        </div>
        <div className="hidden sm:block">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {gridImages.map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                  <div className="relative p-1 shadow-sm rounded-lg">
                    <Image
                      width={300}
                      height={300}
                      src={`/one/pranay-${index + 1}.jpg`}
                      alt={`professional ai headshot`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />

                    <span className="absolute top-2 right-2 px-1 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                      <Sparkles
                        className="text-destructive"
                        strokeWidth={1.5}
                      />
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="sm:hidden grid grid-cols-2 gap-4">
          {gridImages.map((src, index) => (
            <div key={index} className="relative">
              <img
                src={`/one/pranay-${index + 1}.jpg`}
                alt={`professional ai headshot`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <span className="absolute top-2 right-2 px-1 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                <Sparkles className="text-destructive" strokeWidth={1.5} />
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          We created 40 professional headshots for our customer, Pranay Airan,
          who kindly allowed us to showcase them. He shared his experience on
          Reddit, noting that 28 (70%) of the headshots were ready to use with
          exact facial resemblance. This far exceeds our guarantee of delivering
          at least 1-5 profile-worthy headshots per order.
        </p>
      </div>
    </section>
  );
}

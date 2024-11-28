"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { REVIEWS_ARRAY } from "@/lib/reviews";
import { Sparkles } from "lucide-react";
import SectionParaHeading from "../shared/section-para-heading";

export default function CardSlider({
  items = REVIEWS_ARRAY,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current.appendChild(duplicatedItem);
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-duration",
        speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s"
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full px-4 xl:px-0 py-10 lg:pt-20 lg:pb-20 mx-auto mt-4 scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      {" "}
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <SectionParaHeading
          badgeText={"Affiliates"}
          title={"upload your photos to create ai headshots"}
        >
          this will be written later by our content writer.
        </SectionParaHeading>
      </div>
      <div className="flex justify-center items-center -space-x-4">
        {[1, 2, 3].map((i) => (
          <Image
            key={i}
            width={48}
            height={48}
            className="relative inline-block h-12 w-12 rounded-full border-2 border-white object-cover"
            src={`/avatar-${i}.jpg`}
            alt={`Avatar ${i}`}
          />
        ))}
      </div>
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {[...Array(38).keys()].map((item, index) => (
          <li key={index} className="w-[300px] flex-shrink-0">
            <Card className="relative overflow-hidden h-full rounded shadow-none border-none">
              <CardContent className="p-0 h-full">
                <Image
                  // FIXME:
                  unoptimized={true}
                  src={`/one/fdfv-gdahh-hfahh-shhs-fggjh-nkzd-${index + 1}.jpg`}
                  width={300}
                  height={300}
                  className="w-full h-full rounded object-cover"
                  alt={item.name}
                />
                <div className="absolute inset-0 bg-primary/25 opacity-0 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                    <Sparkles className="text-destructive" strokeWidth={1.5} />
                    AI <span className="italic">Generated</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

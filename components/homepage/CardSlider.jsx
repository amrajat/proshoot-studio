"use client";
import { v4 as uuid4 } from "uuid";
import { cn } from "@/lib/cn";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const CardSlider = ({
  items = [
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
    { image: "/examples/ai-portrait-1.jpg" },
  ],

  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className = null,
}) => {
  const containerRef = React.useRef();
  const scrollerRef = React.useRef();

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full px-4 xl:px-0 py-10 lg:pt-20 lg:pb-20 mx-auto mt-4 scroller relative z-20 overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li key={uuid4()} className="relative block rounded-md">
            <span className="absolute mt-1 ml-1 inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-md text-xs font-medium border border-gray-200 bg-white text-gray-800 shadow-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
              AI Generated
            </span>
            <span className="absolute left-[50%] translate-x-[-50%] bottom-0 inline-flex items-center gap-x-1.5 py-1.5 px-3 text-xs font-medium text-white shadow-sm">
              Compressed Image
            </span>
            <Image
              src={item.image}
              alt={""}
              width="300"
              height="450"
              className="w-full h-auto"
              quality={100}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardSlider;

// {
//   items: {
//     quote: string,
//     name: string,
//     title: string,
//   }[],
//   direction?: "left" | "right",
//   speed?: "fast" | "normal" | "slow",
//   pauseOnHover?: boolean,
//   className?: string,
// }

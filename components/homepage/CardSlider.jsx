"use client";
import { cn } from "@/lib/cn";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ToolTip from "./ToolTip";
import { EXAMPLES } from "@/lib/data";

const CardSlider = ({
  items = EXAMPLES.slice(0, 24),
  direction = "left",
  speed = "normal",
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
          <li
            key={item.title}
            className="relative rounded block bg-white border border-gray-200 shadow-sm   "
          >
            <div className="h-auto ">
              <Image
                src={item.thumbnail}
                width="300"
                height="450"
                // sizes="100vw"
                className="w-full h-auto rounded aspect-[2/3] object-cover"
                quality={100}
                alt={item.title}
              />
              <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-blue-600/25 pointer-events-none"></div>
              <span className="absolute left-1 top-1 flex items-center gap-x-1.5 py-1.5 px-3 rounded text-xs font-medium bg-blue-600 text-white">
                <span className="self-center">AI Generated </span>
                <ToolTip>
                  These images are artificially generated using our AI headshot
                  generator.
                </ToolTip>
              </span>

              <blockquote className="absolute left-[50%] translate-x-[-50%] bottom-0 inline-flex items-center gap-x-1.5 py-4 px-4 text-sm font-medium text-white italic w-full">
                <p className="lowercase bg-blue-600/25 backdrop-blur-md px-2 py-1 rounded mb-4 z-10 relative before:content-['\201C'] before:font-serif before:absolute before:top-0 before:left-0 before:text-2xl before:text-blue-400 before:-mt-4 before:-ml-2 after:content-['\201D'] after:font-serif after:absolute after:bottom-0 after:right-0 after:text-2xl after:text-blue-400 after:-mb-4 after:-mr-2">
                  {item.title}
                </p>
              </blockquote>
            </div>
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

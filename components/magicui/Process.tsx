"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import Image from "next/image";
import Logo from "../homepage/Logo";
import Heading, { SubHeading } from "../ui/Heading";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex sm:size-24 size-16 items-center justify-center rounded-full bg-transparent",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function Process({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-5 py-16 md:px-10 md:py-20",
        className
      )}
      ref={containerRef}
    >
      {/* Title */}
      <div className="mx-auto text-center mb-10">
        <Heading>Simplified Process</Heading>
        {/* <p className="mt-2 lg:text-lg text-gray-800 "> */}
        {/* inline-block text-sm font-medium bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 text-transparent   */}
        <SubHeading>
          Upload your selfies or everyday photos to train the AI model, then
          choose your profession and gender to generate images in your preferred
          styles. Once done, simply download all your AI-generated headshots.
        </SubHeading>
      </div>
      {/* End Title */}
      <div className="flex size-full flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <Image
              src={"/avatar-2.jpg"}
              alt="hi"
              width={144}
              height={144}
              className="rounded shadow-sm border border-blue-200"
            />
          </Circle>
          <Circle ref={div2Ref}>
            <Image
              src={"/avatar-2.jpg"}
              alt="hi"
              width={144}
              height={144}
              className="rounded shadow-sm border border-blue-200"
            />
          </Circle>
          <Circle ref={div3Ref}>
            <Image
              src={"/avatar-2.jpg"}
              alt="hi"
              width={144}
              height={144}
              className="rounded shadow-sm border border-blue-200"
            />
          </Circle>
          <Circle ref={div4Ref}>
            <Image
              src={"/avatar-2.jpg"}
              alt="hi"
              width={144}
              height={144}
              className="rounded shadow-sm border border-blue-200"
            />
          </Circle>
          <Circle ref={div5Ref}>
            <Image
              src={"/avatar-2.jpg"}
              alt="hi"
              width={144}
              height={144}
              className="rounded shadow-sm border border-blue-200"
            />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="sm:size-24 size-16">
            {/* <div className="sm:size-24 size-16 bg-blue-300 flex items-center justify-center rounded p-2"> */}
            <div className="animate-spin">
              <Image
                alt="logo"
                src={"/logo/log-round-symbol.png"}
                height={144}
                width={144}
                className=""
              />
              {/* </div> */}
            </div>
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <Image
              src={"/avatar-2.jpg"}
              alt="hi"
              width={144}
              height={144}
              className="rounded shadow-sm border border-blue-200"
            />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
      />
    </div>
  );
}

"use client";
import Heading from "@/components/ui/Heading";
import { HiShieldCheck } from "react-icons/hi2";
import { v4 as uuidv4 } from "uuid";
import React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import ToolTip from "./ToolTip";
import { figtree } from "@/lib/utils";
import { EXAMPLES } from "@/lib/data";

const HeroParallax = ({ products = EXAMPLES.slice(0, 11) }) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="h-full py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] hero-moving-bg"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={uuidv4()}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={uuidv4()}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={uuidv4()}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-10 md:py-20 px-4 w-full  left-0 top-0 text-white">
      <h1 className="text-sm font-normal sm:text-base mb-4">
        The Most Realistic AI Headshot Generator with Highest Resemble.
      </h1>

      <Heading type="h1" cls="font-semibold text-white">
        Get Realistic AI Headshots
      </Heading>

      <p className="max-w-2xl text-base md:text-xl mt-8">
        Our AI fine-tuning model takes your selfies or everyday photos and
        transforms them into stunning, polished business headshots/portraits. No
        studio like fees, no scheduling hassles, just impactful headshots in
        minutes at low as $29.
      </p>
      <div className="bg-white border border-blue-100 rounded shadow-lg p-4 flex items-center space-x-4 max-w-fit mt-8">
        <div className="bg-blue-100 rounded p-2">
          <HiShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <div className="text-blue-700">
          <h2 className={"text-xl font-bold " + figtree.className}>
            100% Money Back Guarantee
          </h2>
          <p className="text-sm text-blue-600">
            7-Days Risk-Free - 100% Satisfaction
          </p>
        </div>
      </div>
      {/* Avatar */}
      <div className="flex items-center mt-8 gap-2 flex-wrap">
        <div className="flex -space-x-2">
          <Image
            height={96}
            width={96}
            className="inline-block size-[46px] rounded-full ring-2 ring-white"
            src="/avatar-1.jpg"
            alt="Avatar"
          />
          <Image
            height={96}
            width={96}
            className="inline-block size-[46px] rounded-full ring-2 ring-white"
            src="/avatar-2.jpg"
            alt="Avatar"
          />
          <Image
            height={96}
            width={96}
            className="inline-block size-[46px] rounded-full ring-2 ring-white"
            src="/avatar-3.jpg"
            alt="Avatar"
          />
          <Image
            height={96}
            width={96}
            className="inline-block size-[46px] rounded-full ring-2 ring-white"
            src="/avatar-4.jpg"
            alt="Avatar"
          />
        </div>
        <h5 className="text-white text-sm xs:text-md xl:text-lg">
          <strong>400000+</strong> Headshots Generated for
          <strong> 7000+</strong> Customers.
        </h5>
      </div>
      {/* Avatar */}
    </div>
  );
};

export const ProductCard = ({ product, translate }) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-[28.125rem] w-[18.75rem] relative flex-shrink-0 rounded overflow-hidden shadow-lg"
    >
      <Image
        src={product.thumbnail}
        width="0"
        height="0"
        sizes="100vw"
        className="w-full h-auto rounded aspect-[2/3]"
        quality={100}
        alt={product.title}
      />
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-blue-600/25 pointer-events-none"></div>
      {/* <span className="absolute left-1 top-1 gap-x-1.5 py-1.5 px-3 rounded text-xs font-medium border border-gray-200 bg-blue-600 text-white shadow-sm flex items-center">
        <span>AI Generated</span>{" "}
        
      </span> */}
      <span className="absolute left-1 top-1 flex items-center gap-x-1.5 py-1.5 px-3 rounded text-xs font-medium bg-blue-600 text-white">
        <span className="self-center">AI Generated </span>
        <ToolTip>
          These images are artificially generated using our AI headshot
          generator.
        </ToolTip>
      </span>

      <blockquote className="absolute left-[50%] translate-x-[-50%] bottom-0 inline-flex items-center gap-x-1.5 py-4 px-4 text-sm font-medium text-white italic w-full">
        <p className="lowercase bg-blue-600/25 backdrop-blur-md px-2 py-1 rounded mb-4 z-10 relative before:content-['\201C'] before:font-serif before:absolute before:top-0 before:left-0 before:text-2xl before:text-blue-400 before:-mt-4 before:-ml-2 after:content-['\201D'] after:font-serif after:absolute after:bottom-0 after:right-0 after:text-2xl after:text-blue-400 after:-mb-4 after:-mr-2">
          {product.title}
        </p>
      </blockquote>
    </motion.div>
  );
};

export default HeroParallax;

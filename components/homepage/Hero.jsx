"use client";
import ButtonMovingBorder from "@/components/homepage/ButtonMovingBorder";
import { HiCheckCircle, HiMiniStar } from "react-icons/hi2";
import { v4 as uuidv4 } from "uuid";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const HeroParallax = ({
  products = [
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-1.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-2.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-3.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-4.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-5.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-6.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-7.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-8.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-9.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-10.jpg",
    },
    {
      title: "AI Generated",
      thumbnail: "/examples/ai-portrait-11.jpg",
    },
  ],
}) => {
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
      className="h-full py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
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
        <motion.div className="flex flex-row  mb-20 space-x-20 ">
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
    <div className="max-w-7xl relative mx-auto py-10 md:py-20 px-4 w-full  left-0 top-0">
      <h2 className="text-sm font-semibold text-white sm:text-base mb-4">
        The #1 Professional AI Headshot Generator
      </h2>
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        Ditch the Studio!<br></br>Shine on Internet<br></br>Get Realistic
        Headshots with AI
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        Our cutting-edge AI technology takes your selfies or everyday photos and
        transforms them into stunning, polished business portraits. No studio
        like fees, no scheduling hassles, just impactful headshots in hours at
        low as $29.
      </p>
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
      className="group/product h-[28.125rem] w-[18.75rem] relative flex-shrink-0 rounded-md overflow-hidden"
    >
      <Link href={"/auth"} className="block group-hover/product:shadow-2xl ">
        <Image
          src={product.thumbnail}
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-auto"
          quality={100}
          alt={product.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <span className="absolute left-1 top-1 inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-md text-xs font-medium border border-gray-200 bg-white text-gray-800 shadow-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
        AI Generated
      </span>
      <span className="absolute left-[50%] translate-x-[-50%] bottom-0 inline-flex items-center gap-x-1.5 py-1.5 px-3 text-xs font-medium text-white shadow-sm">
        Compressed Image
      </span>
    </motion.div>
  );
};

export default HeroParallax;

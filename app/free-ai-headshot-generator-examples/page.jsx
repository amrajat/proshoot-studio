import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
import Image from "next/image";
import { HiChevronRight } from "react-icons/hi2";
import Link from "next/link";

export const metadata = {
  title: { absolute: "Free AI Headshots Examples" },
  description:
    "See the power of AI headshots! Explore Proshoot.co's free examples & discover the perfect professional look for less.",
};

function Headshots() {
  return (
    <>
      <Header />
      <div className="relative overflow-hidden">
        {/* Gradients */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem] dark:from-violet-900/50 dark:to-purple-900" />
          <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[90rem] h-[50rem] rounded-fulls origin-top-left -rotate-12 -translate-x-[15rem] dark:from-indigo-900/70 dark:via-indigo-900/70 dark:to-blue-900/70" />
        </div>
        {/* End Gradients */}
        <div className="relative z-10">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="max-w-4xl text-center mx-auto">
              <p className="inline-block text-sm font-medium bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 text-transparent dark:from-blue-400 dark:to-violet-400">
                Proshoot: Headshots Example
              </p>
              {/* Title */}
              <div className="mt-5 max-w-4xl">
                <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
                  See our AI Headshots
                </h1>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-4xl">
                <p className="text-lg text-gray-600 dark:text-neutral-400">
                  Curious about the quality of headshots Proshoot.co can
                  generate? Take a look at these examples and discover the
                  potential for professional, personalized portraits created.
                  <br></br>
                  <span className="text-red-500 text-xs font-normal">
                    We will showcase more examples with the customer&apos;s
                    permission.
                  </span>
                </p>
              </div>
              {/* Buttons */}
              <div className="mt-8 gap-3 flex justify-center">
                <Link
                  className="py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-violet-900 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/auth"
                >
                  Generate
                  <HiChevronRight
                    className="flex-shrink-0 size-4"
                    width={24}
                    height={24}
                  />
                </Link>
              </div>
              {/* End Buttons */}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-1.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-2.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-3.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-4.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-5.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-6.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-7.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-8.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-9.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-10.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                <div className="h-auto ">
                  <Image
                    src={"/examples/ai-portrait-11.jpg"}
                    alt="ai generated headshot image"
                    width={"393"}
                    height={"491"}
                    quality={100}
                    className="overflow-hidden w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Container></Container>
      <Footer />
    </>
  );
}

export default Headshots;

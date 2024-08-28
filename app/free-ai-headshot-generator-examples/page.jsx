import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
import Image from "next/image";
import { HiChevronRight } from "react-icons/hi2";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import { EXAMPLES } from "@/lib/data";
import ToolTip from "@/components/homepage/ToolTip";

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
          <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]  " />
          <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[90rem] h-[50rem] roundeds origin-top-left -rotate-12 -translate-x-[15rem]   " />
        </div>
        {/* End Gradients */}
        <div className="relative z-10">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="max-w-4xl text-center mx-auto">
              <p className="inline-block text-sm font-medium bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 text-transparent  ">
                Proshoot: Headshots Example
              </p>
              {/* Title */}
              <div className="mt-5 max-w-4xl">
                <Heading type="h1">See our AI Headshots</Heading>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-4xl">
                <p className="text-lg">
                  Curious about the quality of headshots Proshoot.co can
                  generate? Take a look at these examples and discover the
                  potential for professional, personalized portraits created.
                </p>
              </div>
              {/* Buttons */}
              <div className="mt-8 gap-3 flex justify-center flex-col">
                <Link
                  href="/dashboard/studio"
                  className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none self-center"
                >
                  Get Started
                  <HiChevronRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Link>
                <span className="text-xs font-normal">
                  Trust & Safety - We will not use images without the customer's
                  consent, nor will we sell your pictures to anyone. All photos
                  will be deleted from the server within 30 days. You may
                  request immediate deletion of images by contacting us.
                </span>
              </div>
              {/* End Buttons */}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {EXAMPLES.splice(0, 24).map((example) => {
                return (
                  <div
                    key={example.title}
                    className="relative rounded overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm   "
                  >
                    <div className="h-auto ">
                      <Image
                        src={example.thumbnail}
                        width="0"
                        height="0"
                        sizes="100vw"
                        className="w-full h-auto rounded aspect-[2/3] object-cover hover:scale-110 transition-transform"
                        quality={100}
                        alt={"hi"}
                      />
                      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-blue-600/25 pointer-events-none"></div>
                      <span className="absolute left-1 top-1 flex items-center gap-x-1.5 py-1.5 px-3 rounded text-xs font-medium bg-blue-600 text-white">
                        <span className="self-center">AI Generated </span>
                        <ToolTip>
                          These images are artificially generated using our AI
                          headshot generator.
                        </ToolTip>
                      </span>

                      <blockquote className="absolute left-[50%] translate-x-[-50%] bottom-0 inline-flex items-center gap-x-1.5 py-4 px-4 text-sm font-medium text-white italic w-full">
                        <p className="lowercase bg-blue-600/25 backdrop-blur-md px-2 py-1 rounded mb-4 z-10 relative before:content-['\201C'] before:font-serif before:absolute before:top-0 before:left-0 before:text-2xl before:text-blue-400 before:-mt-4 before:-ml-2 after:content-['\201D'] after:font-serif after:absolute after:bottom-0 after:right-0 after:text-2xl after:text-blue-400 after:-mb-4 after:-mr-2">
                          {example.title}
                        </p>
                      </blockquote>
                    </div>
                  </div>
                );
              })}
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

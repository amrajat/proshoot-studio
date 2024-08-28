import Image from "next/image";
import Heading, { SubHeading } from "@/components/ui/Heading";
import BgGradient from "@/components/homepage/BgGradient";

function Detailed() {
  return (
    <div className="overflow-hidden relative">
      {/* Gradients */}
      <BgGradient />
      {/* End Gradients */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28 mx-auto">
        {/* Title */}
        <div className="mx-auto text-center mb-10">
          <Heading> The Most Detailed AI Headshot Generator.</Heading>
          <SubHeading>
            Capture Your True Essence with High-Resemblance AI
            Headshots—Meticulously Crafted to Reflect Your Professional Identity
            with Unmatched Detail and Precision.
          </SubHeading>
        </div>
        {/* End Title */}
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="text-center">
            <div className="overflow-hidden size-48 mx-auto">
              <Image
                quality={100}
                width={192}
                height={192}
                sizes="100vw"
                className="rounded sm:size-48 lg:size-60 mx-auto w-full h-auto object-cover object-top"
                src="/examples/ai-portrait-10.jpg"
                alt="ai generated portrait"
              />
            </div>
            <div className="mt-2 sm:mt-4">
              <h3 className="text-sm font-medium sm:text-base lg:text-lg ">
                Image Scale 1X
              </h3>
            </div>
          </div>
          {/* End Col */}
          <div className="text-center">
            <div className="rounded overflow-hidden size-48 mx-auto">
              <Image
                quality={100}
                width={192}
                height={192}
                sizes="100vw"
                className="rounded sm:size-48 lg:size-60 mx-auto w-full h-auto object-cover object-top scale-[2]"
                src="/examples/ai-portrait-10.jpg"
                alt="ai generated portrait"
              />
            </div>
            <div className="mt-2 sm:mt-4">
              <h3 className="text-sm font-medium sm:text-base lg:text-lg ">
                Image Scale 2X
              </h3>
            </div>
          </div>
          {/* End Col */}
          <div className="text-center">
            <div className="rounded overflow-hidden size-48 mx-auto">
              <Image
                quality={100}
                width={192}
                height={192}
                sizes="100vw"
                className="rounded sm:size-48 lg:size-60 mx-auto w-full h-auto object-cover object-top scale-[3] object"
                src="/examples/ai-portrait-10.jpg"
                alt="ai generated portrait"
              />
            </div>
            <div className="mt-2 sm:mt-4">
              <h3 className="text-sm font-medium sm:text-base lg:text-lg ">
                Image Scale 3X
              </h3>
            </div>
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default Detailed;

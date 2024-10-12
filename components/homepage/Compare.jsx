import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import ToolTip from "./ToolTip";
import Logo from "./Logo";
import Image from "next/image";
import Heading, { SubHeading } from "@/components/ui/Heading";
import { figtree } from "@/lib/utils";
import BgGradient from "./BgGradient";

function Compare() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradients */}
      <BgGradient />
      {/* End Gradients */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28 mx-auto">
        {/* Title */}
        <div className="mx-auto text-center mb-10">
          <Heading>Proshoot.co Outperforms Its Competitors</Heading>
          <SubHeading>
            Proshoot.co Leads the Market with High-Resemblance, Realistic AI
            Headshots—Guaranteed Sharpness and Ethnicity Integrity. Enjoy
            High-Resolution, Deformation-Free Images, Delivered in Just 2 Hours.
          </SubHeading>
        </div>
        {/* End Title */}

        {/* Grid */}
        <div className="mt-6 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded   overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/dall-e-3.png"
                alt="openai dalle-3 generated image"
                width="0"
                height="0"
                sizes="100vw"
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 md:p-8">
              <h4 className={"font-medium text-lg " + figtree.className}>
                DALL·E 3
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Generative AI model from OpenAI<sup>®</sup>.DALL·E 3 is built
                natively on ChatGPT.
              </p>
              <ul className="mt-7 space-y-2.5 text-sm">
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />

                  <span className=" ">Low Resemblance</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Looks like AI Generated</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">No Money Back Guarantee</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Deformation</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Like Madame Tussaud's Wax</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Low Resolution</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Faster</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Maintains Ethnicity</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Blurry and Lacks Sharpness.</span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border-2 border-blue-600 text-center shadow-xl rounded   overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/examples/ai-portrait-10.jpg"
                alt="proshoot.co generate image"
                width="0"
                height="0"
                sizes="100vw"
                quality={100}
                className="w-full h-auto shadow"
              />
            </div>

            <div className="p-4 md:p-8">
              <h4 className="font-medium text-lg">
                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded text-xs uppercase font-semibold bg-blue-600 text-blue-600  ">
                  <Logo type="white" />
                </span>
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Our AI model creates lifelike portraits in different styles,
                ages, and clothing.It&apos;s capable of generating highly
                realistic images.
              </p>
              <ul className="mt-7 space-y-2.5 text-sm">
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />

                  <span className=" ">Highest Resemblance</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Sharp Realistic</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">
                    Money Back Guarantee{" "}
                    <ToolTip>Subject to our Refund Policy.</ToolTip>
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Almost! No Deformation</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Looks like real image.</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">High Resolution</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">
                    Ready within 2 Hours.
                    <ToolTip>This depends on the input images.</ToolTip>
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Maintains Ethnicity</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Sharp and scales upto 5X.</span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded   overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/midjourney.png"
                alt="midjourney generated image"
                width="0"
                height="0"
                sizes="100vw"
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 md:p-8">
              <h4 className={"font-medium text-lg " + figtree.className}>
                Midjourney
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Owned by San Francisco–based independent research lab Midjourney
                <sup>®</sup>, Inc
              </p>
              <ul className="mt-7 space-y-2.5 text-sm">
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />

                  <span className=" ">Low Resemblance</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Looks like AI Generated</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">No Money Back Guarantee</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Deformation</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Like Madame Tussaud's Wax</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Low Resolution</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Faster</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Maintains Ethnicity</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Blurry and Lacks Sharpness.</span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded   overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/firefly.png"
                alt="adobe firefly generate image"
                width="0"
                height="0"
                sizes="100vw"
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 md:p-8">
              <h4 className={"font-medium text-lg " + figtree.className}>
                Adobe<sup>®</sup> Firefly
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Adobe<sup>®</sup> Firefly, a product of Adobe Creative Cloud, is
                a generative machine learning model that is used in the field of
                image editing.
              </p>
              <ul className="mt-7 space-y-2.5 text-sm">
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />

                  <span className=" ">Low Resemblance</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Looks like AI Generated</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">No Money Back Guarantee</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Deformation</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Like Madame Tussaud's Wax</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Low Resolution</span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className=" ">Faster</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Maintains Ethnicity</span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className=" ">Blurry and Lacks Sharpness.</span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default Compare;

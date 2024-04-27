import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import ToolTip from "./ToolTip";
import Logo from "./Logo";
import Image from "next/image";

function Compare() {
  return (
    <div className="relative">
      {/* Gradients */}
      {/* <div
        aria-hidden="true"
        className="flex absolute -top-48 start-0 -z-[1] overflow-x-hidden"
      >
        <div className="bg-purple-200 opacity-30 blur-3xl w-[1036px] h-[600px] dark:bg-purple-900 dark:opacity-20" />
        <div className="bg-slate-200 opacity-90 blur-3xl w-[577px] h-[300px] transform translate-y-32 dark:bg-slate-800/60" />
      </div> */}
      {/* End Gradients */}
      <div className="max-w-[85rem] px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14 mx-auto">
        {/* Title */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
            proshoots.co outperforms its competitors
            {/* proshoots.co outperforms its competitors when it comes to creating
          photorealistic and accurate images. */}{" "}
          </h2>
          <p className="mt-2 lg:text-lg text-gray-800 dark:text-gray-200">
            Whatever your status, our offers evolve according to your needs.
          </p>
        </div>
        {/* End Title */}

        {/* Grid */}
        <div className="mt-6 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded-2xl dark:bg-slate-900 dark:border-gray-700 overflow-hidden">
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
              <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
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

                  <span className="text-gray-800 dark:text-gray-400">
                    Low Resemblance
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Looks like AI Generated
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    No Money Back Guarantee
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Deformation
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Like Madame Tussaud's Wax
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Low Resolution
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Faster
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Maintains Ethnicity
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Blurry and Lacks Sharpness.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border-2 border-violet-900 text-center shadow-xl rounded-2xl dark:bg-slate-900 dark:border-violet-700 overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/amazon-employee.png"
                alt="proshoot.co generate image"
                width="0"
                height="0"
                sizes="100vw"
                className="w-full h-auto"
              />
            </div>

            {/* <Image
              src="/amazon-employee.png"
              alt=""
              className="w-full"
              fill={true}
              objectFit="contain"
            /> */}
            <div className="p-4 md:p-8">
              <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs uppercase font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-white">
                  <Logo />
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
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />

                  <span className="text-gray-800 dark:text-gray-400">
                    Highest Possible Resemblance
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Sharp Realistic
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Money Back Guarantee{" "}
                    <ToolTip>Subject to our Refund Policy.</ToolTip>
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Almost! No Deformation
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Looks like real image.
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    High Resolution
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Ready within 2 Hours.
                    <ToolTip>This depends on the input images.</ToolTip>
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Maintains Ethnicity
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Sharp and scales upto 5X.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded-2xl dark:bg-slate-900 dark:border-gray-700 overflow-hidden">
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
              <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
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

                  <span className="text-gray-800 dark:text-gray-400">
                    Low Resemblance
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Looks like AI Generated
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    No Money Back Guarantee
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Deformation
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Like Madame Tussaud's Wax
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Low Resolution
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Faster
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Maintains Ethnicity
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Blurry and Lacks Sharpness.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded-2xl dark:bg-slate-900 dark:border-gray-700 overflow-hidden">
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
              <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
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

                  <span className="text-gray-800 dark:text-gray-400">
                    Low Resemblance
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Looks like AI Generated
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    No Money Back Guarantee
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Deformation
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Like Madame Tussaud's Wax
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Low Resolution
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiCheckCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Faster
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Maintains Ethnicity
                  </span>
                </li>
                <li className="flex space-x-2">
                  <HiXCircle
                    width={24}
                    height={24}
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-red-700"
                  />
                  <span className="text-gray-800 dark:text-gray-400">
                    Blurry and Lacks Sharpness.
                  </span>
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

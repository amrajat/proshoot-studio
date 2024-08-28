import { HiArrowRight, HiCheck, HiXMark } from "react-icons/hi2";
import Logo from "./Logo";
import Link from "next/link";
import Heading, { SubHeading } from "../ui/Heading";
import { figtree } from "@/lib/utils";
import BgGradient from "@/components/homepage/BgGradient";

function PhotographyCompare() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradients */}
      <BgGradient />
      {/* End Gradients */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28 mx-auto">
        {/* Title */}
        <div className="mx-auto text-center mb-10">
          <Heading>AI is Getting Better Everyday.</Heading>
          <SubHeading>
            Achieve Unmatched Resemblance, Realism, and Affordability with AI -
            No Deformities, Countless Variations, and Quick 2-Hour Delivery, All
            at a Fraction of the Cost.
          </SubHeading>
        </div>
        {/* End Title */}
        <div className="relative xl:w-10/12 xl:mx-auto">
          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              {/* Card */}
              <div className="shadow-xl shadow-gray-200 p-5 relative z-10 border rounded md:p-10 bg-white">
                <Logo />
                <h3 className={"text-2xl font-bold my-1 " + figtree.className}>
                  AI based Studio.
                </h3>
                <div className="text-xs text-gray-500 ">
                  100% Money Back Guarantee.
                </div>
                <span className="absolute top-0 end-0 rounded-se rounded-es text-xs font-medium bg-blue-600 text-white py-1.5 px-3">
                  Smart Choice
                </span>
                <div className="mt-5">
                  <span className="text-6xl font-bold">$29</span>
                  <span className="text-lg font-bold">.00 USD</span>
                  {/* <span className="ms-3 text-gray-500 ">USD / person</span> */}
                </div>
                <div className="mt-5 grid sm:grid-cols-2 gap-y-2 py-4 first:pt-0 last:pb-0 sm:gap-x-6 sm:gap-y-0">
                  {/* List */}
                  <ul className="space-y-2 text-sm sm:text-base">
                    <li className="flex space-x-3">
                      <HiCheck className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Highest Resemble</span>
                    </li>
                    <li className="flex space-x-3">
                      <HiCheck className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Realistic</span>
                    </li>
                    <li className="flex space-x-3">
                      <HiCheck className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>No deformities</span>
                    </li>
                  </ul>
                  {/* End List */}
                  {/* List */}
                  <ul className="space-y-2 text-sm sm:text-base">
                    <li className="flex space-x-3">
                      <HiCheck className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Very Affordable</span>
                    </li>
                    <li className="flex space-x-3">
                      <HiCheck className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Many Variation.</span>
                    </li>
                    <li className="flex space-x-3">
                      <HiCheck className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Takes about 2 hours.</span>
                    </li>
                  </ul>
                  {/* End List */}
                </div>
                <div className="mt-5 grid grid-cols-1 gap-x-4 py-4 first:pt-0 last:pb-0 w-full">
                  <Link
                    href="/dashboard/studio"
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none shadow"
                  >
                    Get Your Headshots
                    <HiArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                  </Link>
                </div>
              </div>
              {/* End Card */}
            </div>

            <div>
              {/* Card */}
              <div className="p-4 relative z-10 bg-red-50 border rounded md:p-10  ">
                <h3 className={"text-xl font-bold " + figtree.className}>
                  Traditional Photography
                </h3>
                <div className="text-sm text-red-500 ">Expensive</div>
                <span className="absolute top-0 end-0 rounded-se rounded-es text-xs font-medium bg-red-600 text-white py-1.5 px-3  ">
                  Bad Choice
                </span>
                <div className="mt-5">
                  <span className="text-6xl font-bold">$300</span>
                  <span className="text-lg font-bold">average</span>
                  <span className="ms-3 text-gray-500 ">USD / person</span>
                </div>
                <p className="text-xs mt-5 text-red-500">
                  Expensive, Limited Styles, Takes longer
                </p>
                <div className="mt-5 grid grid-cols-2 gap-x-4 py-4 first:pt-0 last:pb-0"></div>
              </div>
              {/* End Card */}
            </div>
          </div>
          {/* End Grid */}
        </div>
      </div>
    </div>
  );
}

export default PhotographyCompare;

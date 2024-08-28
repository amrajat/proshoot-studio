import Link from "next/link";
import {
  HiArrowRight,
  HiOutlineCog,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import Heading from "../ui/Heading";
import Image from "next/image";

function BottomCTA() {
  return (
    // <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('/bottom-cta.svg')]  before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2 shadow-lg">
    <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('/bottom-cta.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2 before:rotate-180 shadow-lg">
      {/* Stats */}
      <div className="max-w-5xl px-4 xl:px-0 py-10 mx-auto">
        <div className="p-4 lg:p-8 bg-blue-600 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-y-20 gap-x-12">
            {/* Stats */}
            <div className="relative text-center first:before:hidden before:absolute before:-top-full sm:before:top-1/2 before:start-1/2 sm:before:-start-6 before:w-px before:h-20 before:bg-neutral-800 before:rotate-[60deg] sm:before:rotate-12 before:transform sm:before:-translate-y-1/2 before:-translate-x-1/2 sm:before:-translate-x-0 before:mt-3.5 sm:before:mt-0">
              <HiOutlineShieldCheck
                className="shrink-0 size-6 sm:size-8 text-[#fff] mx-auto"
                strokeWidth={2}
              />
              <div className="mt-3 sm:mt-5">
                <h3 className={"text-lg sm:text-3xl font-semibold text-white"}>
                  Privacy First
                </h3>
                <p className="mt-1 text-sm sm:text-base text-gray-200">
                  to Protect your data.
                </p>
              </div>
            </div>
            {/* End Stats */}
            {/* Stats */}
            <div className="relative text-center first:before:hidden before:absolute before:-top-full sm:before:top-1/2 before:start-1/2 sm:before:-start-6 before:w-px before:h-20 before:bg-white before:rotate-[60deg] sm:before:rotate-12 before:transform sm:before:-translate-y-1/2 before:-translate-x-1/2 sm:before:-translate-x-0 before:mt-3.5 sm:before:mt-0">
              <div className="flex justify-center items-center -space-x-5">
                <Image
                  width={128}
                  height={128}
                  className="relative z-[2] shrink-0 size-8 rounded-full border-[3px] border-white object-contain"
                  src={"/avatar-1.jpg"}
                  alt="Avatar"
                />
                <Image
                  width={128}
                  height={128}
                  className="relative z-[1] shrink-0 size-8 rounded-full border-[3px] border-white -mt-7 object-contain"
                  src={"/avatar-2.jpg"}
                  alt="Avatar"
                />
                <Image
                  width={128}
                  height={128}
                  className="relative shrink-0 size-8 rounded-full border-[3px] border-white object-contain"
                  src={"/avatar-3.jpg"}
                  alt="Avatar"
                />
              </div>
              <div className="mt-3 sm:mt-5">
                <h3 className={"text-lg sm:text-3xl font-semibold text-white"}>
                  7000+
                </h3>
                <p className="mt-1 text-sm sm:text-base text-gray-200">
                  Happy Customers.
                </p>
              </div>
            </div>
            {/* End Stats */}
            {/* Stats */}
            <div className="relative text-center first:before:hidden before:absolute before:-top-full sm:before:top-1/2 before:start-1/2 sm:before:-start-6 before:w-px before:h-20 before:bg-white before:rotate-[60deg] sm:before:rotate-12 before:transform sm:before:-translate-y-1/2 before:-translate-x-1/2 sm:before:-translate-x-0 before:mt-3.5 sm:before:mt-0">
              <HiOutlineCog
                className="shrink-0 size-6 sm:size-8 text-[#fff] mx-auto"
                strokeWidth={2}
              />
              <div className="mt-3 sm:mt-5">
                <h3 className={"text-lg sm:text-3xl font-semibold text-white"}>
                  400K+
                </h3>
                <p className="mt-1 text-sm sm:text-base text-gray-200">
                  Headshots Generated.
                </p>
              </div>
            </div>
            {/* End Stats */}
          </div>
        </div>
      </div>
      {/* End Stats */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Title */}
        <div className="mt-5 w-full text-center mx-auto">
          <Heading>
            get your&nbsp;
            <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-blue-600 text-transparent">
              AI Headshots
            </span>
          </Heading>
        </div>
        {/* End Title */}
        <div className="mt-5 max-w-3xl text-center mx-auto">
          <p className="text-xs uppercase font-semibold">
            comes with 100% money back guarantee.
          </p>
        </div>
        {/* Buttons */}
        <div className="mt-8 gap-3 flex justify-center">
          <Link
            href="/dashboard/studio"
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            Generate AI Headshots
            <HiArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        {/* End Buttons */}
      </div>
    </div>
  );
}

export default BottomCTA;

import Link from "next/link";
import ButtonMovingBorder from "./ButtonMovingBorder";

function BottomCTA() {
  return (
    <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Title */}
        <div className="mt-5 max-w-2xl text-center mx-auto">
          <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
            get your&nbsp;
            <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-violet-600 text-transparent">
              AI Headshots
            </span>
          </h1>
        </div>
        {/* End Title */}
        <div className="mt-5 max-w-3xl text-center mx-auto">
          <p className="text-xs text-gray-600 dark:text-neutral-400 uppercase">
            comes with 100% money back guarantee.
          </p>
        </div>
        {/* Buttons */}
        <div className="mt-8 gap-3 flex justify-center">
          <Link href="/dashboard/studio/create">
            <ButtonMovingBorder>Generate Now</ButtonMovingBorder>
          </Link>
        </div>
        {/* End Buttons */}
      </div>
    </div>
  );
}

export default BottomCTA;

import Link from "next/link";
import Container from "@/components/dashboard/Container";
import ButtonMovingBorder from "@/components/homepage/ButtonMovingBorder";
import { HiPlus } from "react-icons/hi2";

async function Dashboard() {
  return (
    <Container>
      <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/squared-bg-element.svg')] before:bg-no-repeat before:bg-top before:w-full before:h-full before:-z-[1] before:transform before:-translate-x-1/2 dark:before:bg-[url('https://preline.co/assets/svg/examples/squared-bg-element-dark.svg')]">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          {/* Announcement Banner */}
          {/* <div className="flex justify-center">
            <Link
              className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-xs text-gray-600 p-2 px-3 rounded-full transition hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:text-gray-400"
              href="/dashboard/studio/buy"
            >
              Buy Studios to generate images.
              <span className="flex items-center gap-x-1">
                <span className="border-s border-gray-200 text-blue-600 ps-2 dark:text-blue-500">
                  Buy
                </span>
                <svg
                  className="flex-shrink-0 w-4 h-4 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </Link>
          </div> */}
          {/* End Announcement Banner */}
          {/* Title */}
          <div className="mt-5 max-w-xl text-center mx-auto">
            <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-gray-200">
              Get Realistic Headshots with AI
            </h1>
          </div>
          {/* End Title */}
          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our cutting-edge AI technology takes your selfies or everyday
              photos and transforms them into stunning, polished business
              portraits.
            </p>
          </div>
          {/* Buttons */}
          <div className="mt-8 gap-3 flex justify-center">
            <Link href="/dashboard/studio/buy">
              <ButtonMovingBorder>Buy Studio</ButtonMovingBorder>
            </Link>
            <Link href="/dashboard/studio/create">
              <ButtonMovingBorder>Create Studio</ButtonMovingBorder>
            </Link>
          </div>
          {/* End Buttons */}
        </div>
      </div>
    </Container>
  );
}

export default Dashboard;

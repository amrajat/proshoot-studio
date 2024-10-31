import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
import { HiChevronRight } from "react-icons/hi2";
import Link from "next/link";
import Heading from "@/components/ui/Heading";

export const metadata = {
  title: "Affiliate",
  description:
    "Earn money promoting AI headshots! Join Proshoot.co's affiliate program & share the future of professional portraits.",
};

function Affiliate() {
  return (
    <>
      <Header />
      {/* Hero */}
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
                Proshoot: Affiliate Program
              </p>
              {/* Title */}
              <div className="mt-5 max-w-4xl">
                <Heading type="h2">
                  Become a Proshoot.co affiliate today & earn up to $17.70 on
                  each sale!
                </Heading>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-4xl">
                <p className="text-lg  ">
                  Join the Proshoot.co Affiliate Program and earn a generous 30%
                  commission on every successful sale you refer.
                </p>
              </div>
              {/* Buttons */}
              <div className="mt-8 gap-3 flex justify-center">
                <Link
                  href="https://proshoot.lemonsqueezy.com/affiliates"
                  className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none self-center"
                >
                  Joint Program Today
                  <HiChevronRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
              {/* End Buttons */}
            </div>
          </div>
        </div>
        {/* Icon Blocks */}
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 items-center gap-12">
            {/* Icon Block */}
            <div>
              <div className="relative flex justify-center items-center size-12 bg-white rounded before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded ">
                <svg
                  className="flex-shrink-0 size-6 text-blue-600 "
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
                  <rect width={10} height={14} x={3} y={8} rx={2} />
                  <path d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
                  <path d="M8 18h.01" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-semibold  ">High-Demand Product</h3>
                <p className="mt-1  ">
                  We provide cutting-edge AI headshot generation, a highly
                  sought-after service.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
            {/* Icon Block */}
            <div>
              <div className="relative flex justify-center items-center size-12 bg-white rounded before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded ">
                <svg
                  className="flex-shrink-0 size-6 text-blue-600 "
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
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx={17} cy={17} r={3} />
                  <circle cx={7} cy={7} r={3} />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-semibold  ">Easy to Promote</h3>
                <p className="mt-1  ">
                  Share your unique affiliate link with your audience and watch
                  your commissions grow.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
            {/* Icon Block */}
            <div>
              <div className="relative flex justify-center items-center size-12 bg-white rounded before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded ">
                <svg
                  className="flex-shrink-0 size-6 text-blue-600 "
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-semibold  ">Real-Time Tracking</h3>
                <p className="mt-1  ">
                  Monitor your performance and earnings through our
                  user-friendly dashboard.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
            {/* Icon Block */}
            <div>
              <div className="relative flex justify-center items-center size-12 bg-white rounded before:absolute before:-inset-px before:-z-[1] before:bg-gradient-to-br before:from-blue-600 before:via-transparent before:to-violet-600 before:rounded ">
                <svg
                  className="flex-shrink-0 size-6 text-blue-600 "
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
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-semibold  ">Fast Payouts</h3>
                <p className="mt-1  ">
                  We make sure you get paid quickly and easily through your
                  preferred method.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
          </div>
        </div>
        {/* End Icon Blocks */}
      </div>
      {/* End Hero */}

      <Container></Container>
      <Footer />
    </>
  );
}

export default Affiliate;

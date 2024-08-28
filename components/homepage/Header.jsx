import Link from "next/link";
import Logo from "./Logo";
import { HiArrowRight, HiBars3, HiMiniXMark } from "react-icons/hi2";
import AnnouncementBanner from "@/components/homepage/AnnouncementBanner";
import { figtree } from "@/lib/utils";

function Header() {
  return (
    <>
      <AnnouncementBanner />
      <header
        className={
          "flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm py-3 md:py-0 shadow h-auto bg-white " +
          figtree.className
        }
      >
        <nav
          className="max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8"
          aria-label="Global"
        >
          <div className="relative md:flex md:items-center md:justify-between">
            <div className="flex items-center justify-between">
              <Link className="flex-none   " href="/">
                <Logo />
              </Link>

              <div className="md:hidden">
                <button
                  type="button"
                  className="hs-collapse-toggle w-9 h-9 flex justify-center items-center text-sm font-semibold rounded border border-gray-200 text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none      "
                  data-hs-collapse="#navbar-collapse-with-animation"
                  aria-controls="navbar-collapse-with-animation"
                  aria-label="Toggle navigation"
                >
                  <HiBars3
                    className="hs-collapse-open:hidden flex-shrink-0 w-4 h-4"
                    width="24"
                    height="24"
                  />

                  <HiMiniXMark
                    className="hs-collapse-open:block hidden flex-shrink-0 w-4 h-4"
                    width="24"
                    height="24"
                  />
                </button>
              </div>
            </div>

            <div
              id="navbar-collapse-with-animation"
              className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block"
            >
              <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300  ">
                <div className="flex flex-col text-black gap-x-0 mt-5 divide-y divide-dashed divide-gray-200 md:flex-row md:items-center md:justify-end md:gap-x-7 md:mt-0 md:ps-7 md:divide-y-0 md:divide-solid ">
                  <Link
                    className="font-semibold text-base hover:text-gray-500 py-3 md:py-6     "
                    href="/"
                    aria-current="page"
                  >
                    Home
                  </Link>

                  <Link
                    className="font-semibold text-base hover:text-gray-500 py-3 md:py-6     "
                    href="/#pricing"
                  >
                    Pricing
                  </Link>

                  <Link
                    className="font-semibold text-base hover:text-gray-500 py-3 md:py-6     "
                    href="/free-ai-headshot-generator-examples"
                  >
                    Examples
                  </Link>

                  <Link
                    className="font-semibold text-base hover:text-gray-500 py-3 md:py-6     "
                    href="/#faqs"
                  >
                    FAQs
                  </Link>

                  <Link
                    className="font-semibold text-base hover:text-gray-500 py-3 md:py-6     "
                    href="/contact"
                  >
                    Contact
                  </Link>

                  <div className="pt-3 md:pt-0">
                    <Link
                      href="/dashboard/studio"
                      className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Get Started
                      <HiArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Header;

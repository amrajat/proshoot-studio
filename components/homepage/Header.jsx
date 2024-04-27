import Image from "next/image";
import Link from "next/link";
import Logo from "./Logo";
import AnnouncementBanner from "@/components/homepage/AnnouncementBanner";
import { HiBars3, HiMiniXMark, HiOutlineChevronDown } from "react-icons/hi2";

function Header() {
  return (
    <>
      <AnnouncementBanner />
      <header className="flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm py-3 md:py-0">
        <nav
          className="max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8"
          aria-label="Global"
        >
          <div className="relative md:flex md:items-center md:justify-between">
            <div className="flex items-center justify-between">
              <Link
                className="flex-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="/"
              >
                <Logo />
              </Link>

              <div className="md:hidden">
                <button
                  type="button"
                  className="hs-collapse-toggle w-9 h-9 flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
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
              <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500">
                <div className="flex flex-col gap-x-0 mt-5 divide-y divide-dashed divide-gray-200 md:flex-row md:items-center md:justify-end md:gap-x-7 md:mt-0 md:ps-7 md:divide-y-0 md:divide-solid dark:divide-gray-700">
                  <Link
                    className="font-medium text-gray-600 hover:text-gray-500 py-3 md:py-6 dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/"
                    aria-current="page"
                  >
                    Home
                  </Link>

                  <Link
                    className="font-medium text-gray-600 hover:text-gray-500 py-3 md:py-6 dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/#pricing"
                  >
                    Pricing
                  </Link>

                  <Link
                    className="font-medium text-gray-600 hover:text-gray-500 py-3 md:py-6 dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/#teams"
                  >
                    Teams
                  </Link>

                  <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] md:[--trigger:hover] py-3 md:py-4">
                    <button
                      type="button"
                      className="flex items-center w-full text-gray-600 hover:text-gray-400 font-medium dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    >
                      Headshots For
                      <HiOutlineChevronDown
                        className="ms-2 w-2.5 h-2.5 text-gray-600"
                        width="16"
                        height="16"
                      />
                    </button>

                    <div className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full hidden z-10 top-full start-0 min-w-[15rem] bg-white md:shadow-2xl rounded-lg py-2 md:p-4 dark:bg-slate-900 dark:divide-gray-700 before:absolute before:-top-5 before:start-0 before:w-full before:h-5">
                      <div className="md:grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="flex flex-col mx-1 md:mx-0">
                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Legal Professionals
                              </p>
                            </div>
                          </a>

                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Social Service Professionals
                              </p>
                            </div>
                          </a>

                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Financial Professionals
                              </p>
                            </div>
                          </a>

                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Tech Professionals
                              </p>
                            </div>
                          </a>
                        </div>

                        <div className="flex flex-col mx-1 md:mx-0">
                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Education Professionals
                              </p>
                            </div>
                          </a>

                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Creative Professionals
                              </p>
                            </div>
                          </a>

                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Business Professionals
                              </p>
                            </div>
                          </a>
                          <a
                            className="group flex gap-x-5 text-gray-800 hover:bg-gray-100 rounded-lg p-4 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            href="/free-ai-headshot-generator-examples"
                          >
                            <div className="grow">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Medical, Health & Wellness Professionals
                              </p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    className="font-medium text-gray-600 hover:text-gray-500 py-3 md:py-6 dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/#faqs"
                  >
                    FAQs
                  </Link>

                  <Link
                    className="font-medium text-gray-600 hover:text-gray-500 py-3 md:py-6 dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/blog"
                  >
                    Blog
                  </Link>

                  <Link
                    className="font-medium text-gray-600 hover:text-gray-500 py-3 md:py-6 dark:text-gray-400 dark:hover:text-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/auth"
                  >
                    Login
                  </Link>

                  <div className="pt-3 md:pt-0">
                    <Link
                      className="py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-violet-900 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                      href="/dashboard/studio"
                    >
                      Generate
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

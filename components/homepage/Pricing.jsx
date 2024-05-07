import { HiCheck, HiCheckBadge, HiCheckCircle } from "react-icons/hi2";
import ToolTip from "@/components/homepage/ToolTip";

function Pricing() {
  return (
    <div id="pricing" className="relative">
      {/* Gradients */}
      {/* <div aria-hidden="true" className="flex absolute -top-48 start-0 -z-[1]">
        <div className="bg-purple-200 opacity-30 blur-3xl w-[1036px] h-[600px] dark:bg-purple-900 dark:opacity-20" />
        <div className="bg-slate-200 opacity-90 blur-3xl w-[577px] h-[300px] transform translate-y-32 dark:bg-slate-800/60" />
      </div> */}
      {/* End Gradients */}
      <div className="max-w-[85rem] px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14 mx-auto">
        {/* Title */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 lg:text-lg text-gray-800 dark:text-gray-200">
            Whatever your status, our offers evolve according to your needs.
          </p>
        </div>
        {/* End Title */}

        {/* Grid */}
        <div className="mt-6 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded-2xl p-4 md:p-8 dark:bg-slate-900 dark:border-gray-700">
            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
              Basic
            </h4>
            <span className="mt-7 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 dark:text-gray-200">
              $29
            </span>
            <p className="mt-2 text-sm text-gray-500">
              Works well if you&apos;re on a tight budget.
            </p>
            <ul className="mt-7 space-y-2.5 text-sm">
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />

                <span className="text-gray-800 dark:text-gray-400">
                  20 Headshots
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  5 Unique Clothing
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  5 Unique Backgrounds
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Consists 1 Studio
                  <ToolTip>
                    Each studio generates images for one single person.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
            </ul>
            <a
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-violet-600 text-violet-600 hover:border-violet-500 hover:text-violet-500 disabled:opacity-50 disabled:pointer-events-none dark:border-violet-500 dark:text-violet-500 dark:hover:text-violet-400 dark:hover:border-violet-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="/auth?pricing=Basic"
            >
              Get started
            </a>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border-2 border-violet-900 text-center shadow-xl rounded-2xl p-4 md:p-8 dark:bg-slate-900 dark:border-violet-700">
            <p className="mb-3">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs uppercase font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-white">
                Most popular
              </span>
            </p>
            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
              Standard
            </h4>
            <span className="mt-5 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 dark:text-gray-200">
              $39
            </span>
            <p className="mt-2 text-sm text-gray-500">
              Get started with our most loved plan.
            </p>
            <ul className="mt-7 space-y-2.5 text-sm">
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />

                <span className="text-gray-800 dark:text-gray-400">
                  40 Headshots
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  10 Unique Clothing
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  10 Unique Backgrounds
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Consists 1 Studio
                  <ToolTip>
                    Each studio generates images for one single person.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
            </ul>
            <a
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="/auth?pricing=Standard"
            >
              Get started
            </a>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded-2xl p-4 md:p-8 dark:bg-slate-900 dark:border-gray-700">
            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
              Premium
            </h4>
            <span className="mt-5 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 dark:text-gray-200">
              $49
            </span>
            <p className="mt-2 text-sm text-gray-500">
              Everything you need for a growing internet presence.
            </p>
            <ul className="mt-7 space-y-2.5 text-sm">
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />

                <span className="text-gray-800 dark:text-gray-400">
                  60 Headshots
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  15 Unique Clothing
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  15 Unique Backgrounds
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Consists 1 Studio
                  <ToolTip>
                    Each studio generates images for one single person.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
            </ul>
            <a
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-violet-600 text-violet-600 hover:border-violet-500 hover:text-violet-500 disabled:opacity-50 disabled:pointer-events-none dark:border-violet-500 dark:text-violet-500 dark:hover:text-violet-400 dark:hover:border-violet-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="/auth?pricing=Premium"
            >
              Get started
            </a>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded-2xl p-4 md:p-8 dark:bg-slate-900 dark:border-gray-700">
            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
              Pro
            </h4>
            <span className="mt-5 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 dark:text-gray-200">
              $59
            </span>
            <p className="mt-2 text-sm text-gray-500">
              Step into Professionalism with Confidence
            </p>
            <ul className="mt-7 space-y-2.5 text-sm">
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />

                <span className="text-gray-800 dark:text-gray-400">
                  80 Headshots
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  30 Unique Clothing
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  30 Unique Backgrounds
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  Consists 1 Studio
                  <ToolTip>
                    Each studio generates images for one single person.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
                />
                <span className="text-gray-800 dark:text-gray-400">
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
            </ul>
            <a
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-violet-600 text-violet-600 hover:border-violet-500 hover:text-violet-500 disabled:opacity-50 disabled:pointer-events-none dark:border-violet-500 dark:text-violet-500 dark:hover:text-violet-400 dark:hover:border-violet-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="/auth?pricing=Pro"
            >
              Get started
            </a>
          </div>
          {/* End Card */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default Pricing;

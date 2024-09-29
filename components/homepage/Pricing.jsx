import { HiCheck, HiCheckBadge, HiCheckCircle } from "react-icons/hi2";
import ToolTip from "@/components/homepage/ToolTip";
import Link from "next/link";
import Heading, { SubHeading } from "../ui/Heading";
import BgGradient from "./BgGradient";
import { figtree } from "@/lib/utils";

function Pricing() {
  return (
    <div id="pricing" className="relative overflow-hidden">
      {/* Gradients */}
      <BgGradient />
      {/* End Gradients */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28 mx-auto">
        {/* Title */}
        <div className="mx-auto text-center mb-10">
          <Heading>Simple Pricing</Heading>
          {/* <p className="mt-2 lg:text-lg text-gray-800 "> */}
          {/* inline-block text-sm font-medium bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 text-transparent   */}
          <SubHeading>
            No recurring payments or hidden charges. You have complete ownership
            and commercial rights to your images, allowing you to use them
            freely without any restrictions.
          </SubHeading>
        </div>
        {/* End Title */}

        {/* Grid */}
        <div className="mt-6 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded p-4 md:p-8  ">
            <h4 className={"font-medium text-lg " + figtree.className}>
              Basic
            </h4>
            <span className="mt-7 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 ">
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />

                <span>40 Headshots</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>10 Unique Clothing</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>10 Unique Backgrounds</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                <span>
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>Customized AI Prompts</span>
              </li>
            </ul>
            <Link
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded border border-blue-600 text-blue-600 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none       "
              href="/auth"
            >
              Get started
            </Link>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border-2 border-blue-600 text-center shadow-xl rounded p-4 md:p-8  ">
            <p className="mb-3">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded text-xs uppercase font-semibold bg-blue-100 text-blue-600  ">
                Most popular
              </span>
            </p>
            <h4 className={"font-medium text-lg " + figtree.className}>
              Standard
            </h4>
            <span className="mt-5 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 ">
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />

                <span>60 Headshots</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>15 Unique Clothing</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>15 Unique Backgrounds</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                <span>
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>Customized AI Prompts</span>
              </li>
            </ul>
            <Link
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
              href="/auth"
            >
              Get started
            </Link>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded p-4 md:p-8  ">
            <h4 className={"font-medium text-lg " + figtree.className}>
              Premium
            </h4>
            <span className="mt-5 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 ">
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />

                <span>80 Headshots</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>20 Unique Clothing</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>20 Unique Backgrounds</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                <span>
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>Customized AI Prompts</span>
              </li>
            </ul>
            <Link
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded border border-blue-600 text-blue-600 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none       "
              href="/auth"
            >
              Get started
            </Link>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="flex flex-col bg-white border border-gray-200 text-center rounded p-4 md:p-8  ">
            <h4 className={"font-medium text-lg " + figtree.className}>Pro</h4>
            <span className="mt-5 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 ">
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />

                <span>100 Headshots</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>25 Unique Clothing</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>25 Unique Backgrounds</span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                <span>
                  Money Back Guarantee
                  <ToolTip>Subject to our Refund Policy.</ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
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
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>
                  1 Studio Redo
                  <ToolTip>
                    If you&apos;re not satisfied with results. You can always
                    redo the studio.
                  </ToolTip>
                </span>
              </li>
              <li className="flex space-x-2">
                <HiCheckCircle
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5 h-4 w-4 text-blue-600"
                />
                <span>Customized AI Prompts</span>
              </li>
            </ul>
            <Link
              className="mt-5 py-3 px-4 w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded border border-blue-600 text-blue-600 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none       "
              href="/auth"
            >
              Get started
            </Link>
          </div>
          {/* End Card */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default Pricing;

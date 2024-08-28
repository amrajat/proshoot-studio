import Logo from "@/components/homepage/Logo";
import BottomCTA from "@/components/homepage/BottomCTA";
import Link from "next/link";
import Heading from "../ui/Heading";

function Footer() {
  return (
    <>
      <BottomCTA />
      <footer className="relative overflow-hidden footer-bg">
        {/* Gradients */}
        {/* <div aria-hidden="true" className="flex absolute start-0 -z-[1]">
          <div className="bg-purple-200 opacity-10 blur-3xl w-[1036px] h-[600px]  " />
          <div className="bg-slate-200 opacity-20 blur-3xl w-[577px] h-[300px] transform translate-y-32 " />
        </div> */}
        {/* End Gradients */}
        <div className="w-full max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
            <div className="col-span-full hidden lg:col-span-1 lg:block">
              <Link className="flex-none" href="#">
                <Logo type="white" />
              </Link>
              <p className="mt-3 text-xs sm:text-sm text-gray-200 ">
                Most Realistic AI Headshot Generator with Highest Resemble.
              </p>
            </div>
            {/* End Col */}
            <div>
              <Heading type="h5" cls="text-white text-md xs:text-lg xl:text-xl">
                Helpful Links
              </Heading>
              <div className="mt-3 grid space-y-3 text-sm">
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/#pricing"
                  >
                    Pricing
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/blog"
                  >
                    Blog
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/affiliate"
                  >
                    Affiliate
                  </Link>
                </p>

                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Examples
                  </Link>
                </p>
              </div>
            </div>
            {/* End Col */}
            <div>
              <Heading type="h5" cls="text-white text-md xs:text-lg xl:text-xl">
                Headshots for
              </Heading>
              <div className="mt-3 grid space-y-3 text-sm">
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Legal Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Medical Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Financial Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Tech Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Education Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Creative Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Business Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Health &amp; Wellness Professionals
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-headshot-generator-examples"
                  >
                    Social Service Professionals
                  </Link>
                </p>
              </div>
            </div>
            {/* End Col */}
            <div>
              <Heading type="h5" cls="text-white text-md xs:text-lg xl:text-xl">
                Legals
              </Heading>
              <div className="mt-3 grid space-y-3 text-sm">
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/legal#terms"
                  >
                    Terms &amp; Conditions
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/legal#privacy"
                  >
                    Privacy Policy
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/legal#disclaimer"
                  >
                    Disclaimer
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/legal#refund"
                  >
                    Refund Policy
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/legal#fair-usage"
                  >
                    Fair Usage Policy
                  </Link>
                </p>
              </div>
            </div>
            {/* End Col */}
            <div>
              <Heading type="h5" cls="text-white text-md xs:text-lg xl:text-xl">
                Company
              </Heading>
              <div className="mt-3 grid space-y-3 text-sm">
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/about"
                  >
                    About
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/contact"
                  >
                    Contact
                  </Link>
                </p>
              </div>
              {/* <h4 className="mt-7 text-xs font-semibold text-white uppercase "> */}
              <Heading
                type="h5"
                cls="mt-7 text-white text-md xs:text-lg xl:text-xl"
              >
                Special Categories&nbsp;
                <span className="inline text-blue-600 text-xs">
                  - 100% Off<sup>*</sup>
                </span>
              </Heading>
              <div className="mt-3 grid space-y-3 text-sm">
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-portrait-generator"
                  >
                    NGOs
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-portrait-generator"
                  >
                    Education
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-portrait-generator"
                  >
                    Influencer
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-gray-300"
                    href="/free-ai-portrait-generator"
                  >
                    Reviewer SaaS/AI/Other
                  </Link>
                </p>
                <p className="inline-flex text-xs gap-x-2 text-gray-200     ">
                  *upto 100% off on our Basic plan.
                </p>
              </div>
            </div>
            {/* End Col */}
          </div>
          {/* End Grid */}
          <div className="pt-5 mt-5 border-t border-gray-200 ">
            <div className="sm:flex sm:justify-between sm:items-center">
              <div className="flex items-center gap-x-3">
                <div className="space-x-4 text-sm ms-4">
                  <p className="mt-3 text-xs text-gray-200 ">
                    © 2024. All Rights Reserved by Prime AI Company &amp;
                    respected owners.
                  </p>
                  <p className="mt-3 text-xs text-gray-200 ">
                    Trust & Safety - We will not use images without the
                    customer&apos;s consent, nor will we sell your pictures to
                    anyone. All photos will be deleted from the server within 30
                    days. You may request immediate deletion of images by
                    contacting us.
                  </p>
                </div>
              </div>
              {/* <div className="flex justify-between items-center">
                <div className="mt-3 sm:hidden">
                  <Link
                    className="flex-none text-xl font-semibold "
                    href="#"
                    aria-label="Brand"
                  >
                    <Logo />
                  </Link>
                  <p className="mt-1 text-xs sm:text-sm text-gray-200 ">
                    Most Realistic AI Headshot Generator with Highest Resemble.
                  </p>
                </div>
              </div> */}
              {/* End Col */}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;

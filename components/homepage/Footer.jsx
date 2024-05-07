import Logo from "@/components/homepage/Logo";
import { HiEnvelope } from "react-icons/hi2";

function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradients */}
      <div aria-hidden="true" className="flex absolute start-0 -z-[1]">
        <div className="bg-purple-200 opacity-10 blur-3xl w-[1036px] h-[600px] dark:bg-purple-900 dark:opacity-20" />
        <div className="bg-slate-200 opacity-20 blur-3xl w-[577px] h-[300px] transform translate-y-32 dark:bg-slate-800/60" />
      </div>
      {/* End Gradients */}
      <div className="w-full max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          <div className="col-span-full hidden lg:col-span-1 lg:block">
            <a className="flex-none" href="#">
              <Logo />
            </a>
            <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              The #1 Professional AI Headshot Generator.
            </p>
          </div>
          {/* End Col */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase dark:text-gray-100">
              Helpful Links
            </h4>
            <div className="mt-3 grid space-y-3 text-sm">
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/#pricing"
                >
                  Pricing
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/blog"
                >
                  Blog
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/affiliate"
                >
                  Affiliate
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/#teams"
                >
                  Teams
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Examples
                </a>
              </p>
            </div>
          </div>
          {/* End Col */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase dark:text-gray-100">
              headshots for
            </h4>
            <div className="mt-3 grid space-y-3 text-sm">
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Legal Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Medical Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Financial Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Tech Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Education Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Creative Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Business Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Health &amp; Wellness Professionals
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-headshot-generator-examples"
                >
                  Social Service Professionals
                </a>
              </p>
            </div>
          </div>
          {/* End Col */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase dark:text-gray-100">
              Legals
            </h4>
            <div className="mt-3 grid space-y-3 text-sm">
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/legal#terms"
                >
                  Terms &amp; Conditions
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/legal#privacy"
                >
                  Privacy Policy
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/legal#disclaimer"
                >
                  Disclaimer
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/legal#refund"
                >
                  Refund Policy
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/legal#fair-usage"
                >
                  Fair Usage Policy
                </a>
              </p>
            </div>
          </div>
          {/* End Col */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase dark:text-gray-100">
              Company
            </h4>
            <div className="mt-3 grid space-y-3 text-sm">
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/about"
                >
                  About
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/contact"
                >
                  Contact
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/api"
                >
                  API
                </a>{" "}
                <span className="inline text-violet-600 dark:text-violet-500">
                  — Coming Soon
                </span>
              </p>
            </div>
            <h4 className="mt-7 text-xs font-semibold text-gray-900 uppercase dark:text-gray-100">
              Special Categories&nbsp;
              <span className="inline text-violet-600 dark:text-violet-500">
                — 100% Off<sup>*</sup>
              </span>
            </h4>
            <div className="mt-3 grid space-y-3 text-sm">
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-portrait-generator"
                >
                  NGOs
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-portrait-generator"
                >
                  Education
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-portrait-generator"
                >
                  Influencer
                </a>
              </p>
              <p>
                <a
                  className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  href="/free-ai-portrait-generator"
                >
                  Reviewer SaaS/AI/Other
                </a>
              </p>
              <p className="inline-flex text-xs gap-x-2 text-gray-600  dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                *upto 100% off on our Basic plan.
              </p>
            </div>
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
        <div className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="sm:flex sm:justify-between sm:items-center">
            <div className="flex items-center gap-x-3">
              <div className="space-x-4 text-sm ms-4">
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  © 2024. All Rights Reserved by Prime AI Company &amp;
                  respected owners.
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="mt-3 sm:hidden">
                <a
                  className="flex-none text-xl font-semibold dark:text-white"
                  href="#"
                  aria-label="Brand"
                >
                  <Logo />
                </a>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  The #1 Professional AI Headshot Generator.
                </p>
              </div>
              {/* Social Brands */}
              <div className="space-x-4">
                <a
                  className="inline-block text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  href="mailto:support@proshoot.co"
                >
                  <HiEnvelope className="w-4 h-4" width={16} height={16} />
                </a>
              </div>
              {/* End Social Brands */}
            </div>
            {/* End Col */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

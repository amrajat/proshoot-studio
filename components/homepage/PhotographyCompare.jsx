import { HiCheck, HiXMark } from "react-icons/hi2";

function PhotographyCompare() {
  return (
    <>
      {/* Features */}
      <div className="overflow-hidden">
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          {/* Title */}
          <div className="mx-auto max-w-2xl mb-8 lg:mb-14 text-center">
            <h2 className="text-3xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
              proshoot's AI based Studio vs Traditional Studio based photography
            </h2>
          </div>
          {/* End Title */}
          <div className="relative xl:w-10/12 xl:mx-auto">
            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                {/* Card */}
                <div className="p-4 relative z-10 bg-white border rounded-xl md:p-10 dark:bg-neutral-900 dark:border-neutral-800">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
                    Traditional Photography
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-neutral-500">
                    Expensive
                  </div>
                  <div className="mt-5">
                    <span className="text-6xl font-bold text-gray-800 dark:text-neutral-200">
                      $200
                    </span>
                    <span className="text-lg font-bold text-gray-800 dark:text-neutral-200">
                      average
                    </span>
                    <span className="ms-3 text-gray-500 dark:text-neutral-500">
                      USD / person
                    </span>
                  </div>
                  <div className="mt-5 grid sm:grid-cols-2 gap-y-2 py-4 first:pt-0 last:pb-0 sm:gap-x-6 sm:gap-y-0">
                    {/* List */}
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Realistic
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Works everywhere
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          No deformities
                        </span>
                      </li>
                    </ul>
                    {/* End List */}
                    {/* List */}
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex space-x-3">
                        <span className="size-5 flex justify-center items-center rounded-full bg-gray-50 text-gray-500 dark:bg-neutral-800 dark:text-neutral-500">
                          <HiXMark
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                            strokeWidth={2}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Not Affordable
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="size-5 flex justify-center items-center rounded-full bg-gray-50 text-gray-500 dark:bg-neutral-800 dark:text-neutral-500">
                          <HiXMark
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                            strokeWidth={2}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Limited styles/images
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="size-5 flex justify-center items-center rounded-full bg-gray-50 text-gray-500 dark:bg-neutral-800 dark:text-neutral-500">
                          <HiXMark
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                            strokeWidth={2}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Takes longer
                        </span>
                      </li>
                    </ul>
                    {/* End List */}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-x-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-neutral-500">
                        Avg. cost in USA
                      </p>
                      <p className="text-sm text-gray-500 dark:text-neutral-500">
                        Source: Google/Bark
                      </p>
                    </div>
                    {/* <div className="flex justify-end">
                      <button
                        type="button"
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-800"
                      >
                        Start free trial
                      </button>
                    </div> */}
                  </div>
                </div>
                {/* End Card */}
              </div>
              <div>
                {/* Card */}
                <div className="shadow-xl shadow-gray-200 p-5 relative z-10 bg-white border rounded-xl md:p-10 dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-gray-900/20">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
                    AI based Photography
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-neutral-500">
                    Affordable
                  </div>
                  <span className="absolute top-0 end-0 rounded-se-xl rounded-es-xl text-xs font-medium bg-gray-800 text-white py-1.5 px-3 dark:bg-white dark:text-neutral-800">
                    Smart Choice
                  </span>
                  <div className="mt-5">
                    <span className="text-6xl font-bold text-gray-800 dark:text-neutral-200">
                      $29
                    </span>
                    <span className="text-lg font-bold text-gray-800 dark:text-neutral-200">
                      .00
                    </span>
                    <span className="ms-3 text-gray-500 dark:text-neutral-500">
                      USD / person
                    </span>
                  </div>
                  <div className="mt-5 grid sm:grid-cols-2 gap-y-2 py-4 first:pt-0 last:pb-0 sm:gap-x-6 sm:gap-y-0">
                    {/* List */}
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Realistic
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Works everywhere
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          No deformities<sup>+</sup>
                        </span>
                      </li>
                    </ul>
                    {/* End List */}
                    {/* List */}
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Very Affordable
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          So much variation.
                        </span>
                      </li>
                      <li className="flex space-x-3">
                        <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500">
                          <HiCheck
                            className="flex-shrink-0 size-3.5"
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="text-gray-800 dark:text-neutral-200">
                          Takes about 2 hours.
                        </span>
                      </li>
                    </ul>
                    {/* End List */}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-x-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-neutral-500">
                        Redo Studio anytime.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-neutral-500">
                        Money-back guarantee.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <a
                        type="button"
                        href="/auth"
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-violet-900 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Get headshots
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Card */}
              </div>
            </div>
            {/* End Grid */}
          </div>
          <div className="mt-7 text-center">
            <p className="text-xs text-gray-400">
              Prices in USD. Taxes may apply. Photography pricing in the US can
              vary depending on the type of shoot and the photographer's
              experience. Expect to pay around $200 per session on average. +may
              seen very rarely.
            </p>
          </div>
        </div>
      </div>
      {/* End Features */}
    </>
  );
}

export default PhotographyCompare;

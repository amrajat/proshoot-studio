function ComparisonTable() {
  return (
    <div className="relative">
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 md:py-14 lg:py-20 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-3xl md:leading-tight dark:text-white">
            Compare plans
          </h2>
        </div>
        {/* Header */}
        <div className="hidden lg:block sticky top-0 start-0 py-2 bg-white/60 backdrop-blur-md dark:bg-slate-900/60">
          {/* Grid */}
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-2">
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Features
              </span>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Free
              </span>
              <p className="mt-2 text-sm text-gray-500">Free forever</p>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Startup
              </span>
              <p className="mt-2 text-sm text-gray-500">
                $39 per month billed annually
              </p>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Team
              </span>
              <p className="mt-2 text-sm text-gray-500">
                $89 per month billed annually
              </p>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Enterprise
              </span>
              <p className="mt-2 text-sm text-gray-500">
                $149 per month billed annually
              </p>
            </div>
            {/* End Col */}
          </div>
          {/* End Grid */}
        </div>
        {/* End Header */}
        {/* Section */}
        <div className="space-y-4 lg:space-y-0">
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 lg:py-3">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                General
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Number of seats
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  1
                </span>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  Up to 3
                </span>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  Up to 10
                </span>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  Unlimited
                </span>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Storage
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  15 GB
                </span>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  1 TB
                </span>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  15 TB
                </span>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  Unlimited
                </span>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Email sharing
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Any time, anywhere access
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
        </div>
        {/* End Section */}
        {/* Section */}
        <div className="mt-6 space-y-4 lg:space-y-0">
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 lg:py-3">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Financial data
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Open/High/Low/Close
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Price-volume difference indicator
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
        </div>
        {/* End Section */}
        {/* Section */}
        <div className="mt-6 space-y-4 lg:space-y-0">
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 lg:py-3">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                On-chain data
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Network growth
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Average token age consumed
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Exchange flow
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Total ERC20 exchange funds flow
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Transaction volume
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Total circulation (beta)
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Velocity of tokens (beta)
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                ETH gas used
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
        </div>
        {/* End Section */}
        {/* Section */}
        <div className="mt-6 space-y-4 lg:space-y-0">
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 lg:py-3">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Social data
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
            {/* Item */}
            <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Dev activity
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Topic search
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
          {/* List */}
          <ul className="grid lg:grid-cols-6 lg:gap-6">
            {/* Item */}
            <li className="lg:col-span-2 pb-1.5 lg:py-3">
              <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-gray-200">
                Relative social dominance
              </span>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Free
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Startup
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Team
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600"
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
                  <path d="M5 12h14" />
                </svg>
              </div>
            </li>
            {/* End Item */}
            {/* Item */}
            <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-gray-200">
                  Enterprise
                </span>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-violet-600 dark:text-violet-500"
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </li>
            {/* End Item */}
          </ul>
          {/* End List */}
        </div>
        {/* End Section */}
        {/* Header */}
        <div className="hidden lg:block mt-6">
          {/* Grid */}
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-2"></div>
            {/* End Col */}
            <div className="col-span-1">
              <a
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
              >
                Get started
              </a>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <a
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
              >
                Get started
              </a>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <a
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
              >
                Get started
              </a>
            </div>
            {/* End Col */}
            <div className="col-span-1">
              <a
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
              >
                Get started
              </a>
            </div>
            {/* End Col */}
          </div>
          {/* End Grid */}
        </div>
        {/* End Header */}
        {/* Button Group */}
        <div className="mt-8 md:mt-12 flex justify-center items-center gap-x-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need a custom plan?
          </p>
          <button
            type="button"
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          >
            Contact us
          </button>
        </div>
        {/* End Button Group */}
      </div>
    </div>
  );
}

export default ComparisonTable;

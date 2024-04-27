import { HiChevronRight } from "react-icons/hi2";

function Teams() {
  return (
    <>
      {/* Icon Blocks */}
      <div
        id="teams"
        className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto"
      >
        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="lg:w-3/4">
            {/* <h2 className="text-3xl text-gray-800 font-bold lg:text-4xl dark:text-white"> */}
            <h2 className="text-3xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
              Get consistent headshots for team
            </h2>
            <p className="mt-3 text-gray-800 dark:text-neutral-400">
              Our team headshots give you consistent headshots for your business
              needs. Our AI headshots for teams are ideal for any professional
              need.
            </p>
            <p className="mt-5">
              <a
                className="inline-flex items-center text-xs gap-x-1 font-medium text-blue-600 dark:text-blue-500"
                href="mailto:support@proshoot.co"
              >
                We offer special pricing for 25+ person team.
                <HiChevronRight
                  width={24}
                  height={24}
                  strokeWidth={1}
                  className="flex-shrink-0 size-4 transition ease-in-out group-hover:translate-x-1"
                />
              </a>
            </p>
          </div>
          {/* End Col */}
          <div className="space-y-6 lg:space-y-10">
            {/* Icon Block */}
            <div className="flex">
              {/* Icon */}
              <span className="flex-shrink-0 inline-flex justify-center items-center size-[46px] rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm mx-auto dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                1
              </span>
              <div className="ms-5 sm:ms-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  Buy AI Studio Plans
                </h3>
                <p className="mt-1 text-gray-600 dark:text-neutral-400">
                  Sign up! and buy any of our plan, match quantity with number
                  of person in your team. We recommend "Premium" or "Pro" plans
                  for teams.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
            {/* Icon Block */}
            <div className="flex">
              {/* Icon */}
              <span className="flex-shrink-0 inline-flex justify-center items-center size-[46px] rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm mx-auto dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                2
              </span>
              <div className="ms-5 sm:ms-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  Upload team photos.
                </h3>
                <p className="mt-1 text-gray-600 dark:text-neutral-400">
                  Start uploading team images to our AI based studio and wait
                  while it fine tunes your images.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
            {/* Icon Block */}
            <div className="flex">
              {/* Icon */}
              <span className="flex-shrink-0 inline-flex justify-center items-center size-[46px] rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm mx-auto dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                3
              </span>
              <div className="ms-5 sm:ms-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  Done!
                </h3>
                <p className="mt-1 text-gray-600 dark:text-neutral-400">
                  You'll receive ai generated headshots for teams. Now your
                  choose from multiple variation and styes and download them.
                </p>
              </div>
            </div>
            {/* End Icon Block */}
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
      </div>
      {/* End Icon Blocks */}
    </>
  );
}

export default Teams;

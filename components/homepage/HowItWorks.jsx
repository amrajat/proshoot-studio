import Image from "next/image";

function HowItWorks() {
  return (
    <div className="max-w-7xl px-4 xl:px-0 py-10 lg:pt-20 lg:pb-20 mx-auto">
      {/* Title */}
      <div className="max-w-7xl mb-10 lg:mb-14 text-center">
        <h2 className="text-3xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
          How this works?
        </h2>
        <p className="mt-1 text-neutral-400">
          Discover the simplicity of our platform and start generating your
          professional headshots today.
        </p>
      </div>
      {/* End Title */}
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 lg:items-center">
        <div className="aspect-w-16 aspect-h-9 lg:aspect-none">
          <Image
            className="w-full h-auto object-cover rounded-xl"
            src="/examples/ai-portrait-1.jpg"
            alt="ai generate headshot"
            width={0}
            height={0}
            sizes="100vw"
            quality={100}
          />
        </div>
        {/* End Col */}
        {/* Timeline */}
        <div>
          {/* Heading */}
          <div className="mb-4">
            <h3 className="text-xs font-medium uppercase text-gray-800 dark:text-gray-200">
              Steps
            </h3>
          </div>
          {/* End Heading */}
          {/* Item */}
          <div className="flex gap-x-5 ms-1">
            {/* Icon */}
            <div className="relative last:after:hidden after:absolute after:top-8 after:bottom-0 after:start-4 after:w-px after:-translate-x-[0.5px] after:bg-neutral-800">
              <div className="relative z-10 size-8 flex justify-center items-center">
                <span className="flex flex-shrink-0 justify-center items-center size-8 border border-neutral-800 text-gray-800 dark:text-gray-200 font-semibold text-xs uppercase rounded-full">
                  1
                </span>
              </div>
            </div>
            {/* End Icon */}
            {/* Right Content */}
            <div className="grow pt-0.5 pb-8 sm:pb-12">
              <p className="text-sm lg:text-base text-neutral-800  dark:text-white">
                <span className="text-gray-800  dark:text-white">
                  Upload your selfies/photos:&nbsp;
                </span>
                In this step you need to upload selfies/photos of yourself.
              </p>
            </div>
            {/* End Right Content */}
          </div>
          {/* End Item */}
          {/* Item */}
          <div className="flex gap-x-5 ms-1">
            {/* Icon */}
            <div className="relative last:after:hidden after:absolute after:top-8 after:bottom-0 after:start-4 after:w-px after:-translate-x-[0.5px] after:bg-neutral-800">
              <div className="relative z-10 size-8 flex justify-center items-center">
                <span className="flex flex-shrink-0 justify-center items-center size-8 border border-neutral-800 text-gray-800 dark:text-gray-200 font-semibold text-xs uppercase rounded-full">
                  2
                </span>
              </div>
            </div>
            {/* End Icon */}
            {/* Right Content */}
            <div className="grow pt-0.5 pb-8 sm:pb-12">
              <p className="text-sm lg:text-base text-neutral-800  dark:text-white">
                <span className="text-gray-800 dark:text-white">
                  Share your profession:&nbsp;
                </span>
                In this step you need to share your profession, gender details.
              </p>
            </div>
            {/* End Right Content */}
          </div>
          {/* End Item */}
          {/* Item */}
          <div className="flex gap-x-5 ms-1">
            {/* Icon */}
            <div className="relative last:after:hidden after:absolute after:top-8 after:bottom-0 after:start-4 after:w-px after:-translate-x-[0.5px] after:bg-neutral-800">
              <div className="relative z-10 size-8 flex justify-center items-center">
                <span className="flex flex-shrink-0 justify-center items-center size-8 border border-neutral-800 text-gray-800 dark:text-gray-200 font-semibold text-xs uppercase rounded-full">
                  3
                </span>
              </div>
            </div>
            {/* End Icon */}
            {/* Right Content */}
            <div className="grow pt-0.5 pb-8 sm:pb-12">
              <p className="text-sm md:text-base text-neutral-800 dark:text-white">
                <span className="text-gray-800 dark:text-white">
                  Magic Done!:&nbsp;
                </span>
                You will be provided with a range of AI-generated images to
                choose from, and you can download all of them.
              </p>
            </div>
            {/* End Right Content */}
          </div>
          {/* End Item */}
          {/* Item */}
          <div className="flex gap-x-5 ms-1">
            {/* Icon */}
            <div className="relative last:after:hidden after:absolute after:top-8 after:bottom-0 after:start-4 after:w-px after:-translate-x-[0.5px] after:bg-neutral-800">
              <div className="relative z-10 size-8 flex justify-center items-center">
                <span className="flex flex-shrink-0 justify-center items-center size-8 border border-neutral-800 text-gray-800 dark:text-gray-200 font-semibold text-xs uppercase rounded-full">
                  +
                </span>
              </div>
            </div>
            {/* End Icon */}
            {/* Right Content */}
            <div className="grow pt-0.5 pb-8 sm:pb-12">
              <p className="text-sm md:text-base text-neutral-800 dark:text-white">
                <span className="text-gray-800 dark:text-white">
                  Money Back Guarantee:&nbsp;
                </span>
                Our service comes with a no-questions-asked money-back
                guarantee, meaning that you can try our service without any risk
                involved.
              </p>
            </div>
            {/* End Right Content */}
          </div>
          {/* End Item */}
          <a
            className="py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-violet-900 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            href="/dashboard/studio"
          >
            Get Headshots
          </a>
        </div>
        {/* End Timeline */}
      </div>
      {/* End Grid */}
    </div>
  );
}

export default HowItWorks;

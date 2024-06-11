import Image from "next/image";

function HowItWorks() {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <h2 className="mb-10 text-center text-3xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
        simple process
      </h2>
      <nav className="max-w-6xl mx-auto grid sm:flex gap-y-4 sm:gap-y-0 sm:gap-x-4">
        <button
          type="button"
          className="w-full flex flex-col text-start bg-gray-100 p-5 md:p-5 rounded-xl dark:bg-neutral-800"
        >
          <h1 className="font-extrabold text-2xl">1.</h1>
          <span className="mt-5">
            <span className="block font-semibold text-gray-800 dark:text-neutral-200">
              Upload images
            </span>
            <span className="lg:block mt-2 text-gray-800 dark:text-neutral-200">
              Upload your selfies or everyday photos to train the AI model.
            </span>
          </span>
        </button>
        <button
          type="button"
          className="w-full flex flex-col text-start bg-gray-100 p-5 md:p-5 rounded-xl dark:bg-neutral-800"
        >
          <h1 className="font-extrabold text-2xl">2.</h1>

          <span className="mt-5">
            <span className="block font-semibold text-gray-800 dark:text-neutral-200">
              Choose styles
            </span>
            <span className="lg:block mt-2 text-gray-800 dark:text-neutral-200">
              You choose your profession and gender for styles and generate
              images accordingly.
            </span>
          </span>
        </button>
        <button
          type="button"
          className="w-full flex flex-col text-start bg-gray-100 p-5 md:p-5 rounded-xl dark:bg-neutral-800"
        >
          <h1 className="font-extrabold text-2xl">3.</h1>

          <span className="mt-5">
            <span className="block font-semibold text-gray-800 dark:text-neutral-200">
              Done!
            </span>
            <span className="lg:block mt-2 text-gray-800 dark:text-neutral-200">
              AI headshots are generated just download all of them.
            </span>
          </span>
        </button>
      </nav>
    </div>
  );
}

export default HowItWorks;

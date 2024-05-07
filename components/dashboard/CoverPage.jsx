import Link from "next/link";

function CoverPage({ title, children, buttonText, buttonLink }) {
  return (
    <div className="text-center py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="block text-2xl font-bold text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-gray-300">{children}</p>
      <div className="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3">
        <Link href={buttonLink}>
          <button
            type="button"
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          >
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CoverPage;

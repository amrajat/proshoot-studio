import Link from "next/link";
import Heading from "../ui/Heading";

function CoverPage({ title, children, buttonText, buttonLink }) {
  return (
    <div className="text-center py-10 px-4 sm:px-6 lg:px-8">
      <Heading>{title}</Heading>
      <p className="mt-3 text-lg">{children}</p>
      <div className="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3">
        <Link href={buttonLink}>
          <button
            type="button"
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CoverPage;

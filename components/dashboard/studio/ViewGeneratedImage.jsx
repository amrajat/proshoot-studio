import Image from "next/image";

async function ViewGeneratedImage({ image }) {
  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
      <div className="h-auto w-full">
        <Image
          src={image}
          alt="ai generated image"
          width={"393"}
          height={"491"}
          className="overflow-hidden w-auto"
          quality={100}
          // objectFit="contain"
          // layout="fill"
        />
      </div>

      <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
        <a
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          href={image}
          target="_blank"
        >
          Download
        </a>
        {/* <a
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          href="#"
        >
          Delete
        </a> */}
      </div>
    </div>
  );
}

export default ViewGeneratedImage;

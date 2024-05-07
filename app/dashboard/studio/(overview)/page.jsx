import { getCurrentSession, getStudios } from "@/lib/supabase/actions/server";
import Error from "@/components/Error";
import CoverPage from "@/components/dashboard/CoverPage";

import StudioCard from "@/components/dashboard/studio/StudioCard";
import { title } from "process";
import Image from "next/image";
import { HiPlus } from "react-icons/hi2";

async function Studio() {
  let studios;
  try {
    const { session } = await getCurrentSession();
    studios = await getStudios(session.user.id);
  } catch (error) {
    return <Error message="Something went wrong." />;
  }
  if (studios.length < 1) {
    return (
      <CoverPage
        title="No Studio Found."
        buttonText="Buy Studio"
        buttonLink="/dashboard/studio/buy"
      >
        It appears that you have not made any purchases for a studio or have not
        yet created a studio.
      </CoverPage>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
        <div className="h-auto ">
          <Image
            src={"/polygon-potrait.jpg"}
            alt="image uploaded"
            width={"393"}
            height={"491"}
            className="overflow-hidden w-auto"
          />
        </div>
        <div className="p-4 md:p-6">
          <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-500">
            Create New Studio
          </span>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 dark:hover:text-white">
            Generate New Images
          </h3>
          <p className="mt-3 text-gray-500">
            Generate more headshots or generate for another person.
          </p>
        </div>
        <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
          <a
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            href={`/dashboard/studio/create`}
          >
            Create Studio
            <HiPlus />
          </a>
        </div>
      </div>
      {/* Card */}
      {studios.map((studio) => (
        <StudioCard key={studio.id} studio={studio} />
      ))}
      {/* End Card */}
    </div>
  );
}

export default Studio;

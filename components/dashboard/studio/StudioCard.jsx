import { updateStudioDownloadStatus } from "@/lib/supabase/actions/server";
import Image from "next/image";
import { isAfter, parseISO, add } from "date-fns";
import ShowLocalTimeStamp from "@/components/dashboard/ShowLocalTimeStamp";

async function StudioCard({ studio }) {
  if (!studio.downloaded) {
    // Parse the target date string into a Date object
    let targetDate = parseISO(studio.created_at);
    // Add 7 days to the target date
    targetDate = add(targetDate, { days: 7 });
    // Get today's date
    const today = new Date();
    // Check if today's date is after the modified target date
    const isPassed = isAfter(today, targetDate);

    if (isPassed) {
      await updateStudioDownloadStatus(studio.id);
    }
  }
  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm   ">
      <div className="h-auto ">
        {/* <Image
          src={studio.coverImage}
          alt="image uploaded"
          width={"393"}
          height={"491"}
          className="overflow-hidden w-auto aspect-[4/5] object-cover"
        /> */}
      </div>
      <div className="p-4 md:p-6">
        <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 ">
          {studio.gender.toUpperCase()}
          <br></br>
        </span>
        <span className="block mb-1 text-xs font-semibold text-blue-600 ">
          {studio.id.toLowerCase()}
        </span>
        <h3 className="text-xl font-semibold text-gray-800  ">
          {studio.title}
        </h3>
        <p className="mt-3 text-xs text-gray-500">
          Downloaded: {studio.downloaded ? "TRUE" : "FALSE"}
          <br></br>
          Created: {<ShowLocalTimeStamp ts={studio.created_at} />}
          <br></br>
          Sharing Permission: {studio.sharing_permission ? "TRUE" : "FALSE"}
        </p>
      </div>
      <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200  ">
        <a
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none       "
          href={`/dashboard/studio/${studio.id}`}
        >
          View Studio
        </a>
      </div>
    </div>
  );
}
// Generated
export default StudioCard;

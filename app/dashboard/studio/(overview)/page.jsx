import {
  getCurrentSession,
  getPurchaseHistory,
  getStudios,
} from "@/lib/supabase/actions/server";
import Error from "@/components/Error";
import CoverPage from "@/components/dashboard/CoverPage";

import StudioCard from "@/components/dashboard/studio/StudioCard";
import Image from "next/image";
import { HiPlus } from "react-icons/hi2";
import Link from "next/link";
import BuyStudio from "../buy/page";

async function Studio() {
  let studios;
  let purchase_history;
  try {
    const { session } = await getCurrentSession();
    [{ purchase_history = [] } = {}] = await getPurchaseHistory();

    studios = await getStudios(session.user.id);
  } catch (error) {
    return <Error message="Something went wrong." />;
  }
  if (purchase_history.length < 1) {
    return <BuyStudio />;
  }
  if (studios.length < 1) {
    return (
      <CoverPage
        title="No Headshots Found!"
        buttonText="Generate AI Headshots"
        buttonLink="/dashboard/studio/create"
      >
        It appears that you have not have any headshots generated yet.
      </CoverPage>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm   ">
        <div className="h-auto ">
          <Image
            src={"/examples/ai-portrait-1.jpg"}
            alt="image uploaded"
            width={"393"}
            height={"491"}
            className="overflow-hidden w-auto aspect-[4/5] object-cover object-left-top"
          />
        </div>
        <div className="p-4 md:p-6">
          <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 ">
            Create New Studio
          </span>
          <h3 className="text-xl font-semibold text-gray-800  ">
            Generate Headshots
          </h3>
          <p className="mt-3 text-gray-500">
            Generate headshots for another person.
          </p>
        </div>
        <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200  ">
          <Link
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none       "
            href={`/dashboard/studio/create`}
          >
            Generate Now
            <HiPlus />
          </Link>
        </div>
      </div>
      {/* Card */}
      {studios.map((studio, index) => (
        <StudioCard key={studio.id} studio={studio} index={index} />
      ))}
      {/* End Card */}
    </div>
  );
}

export default Studio;

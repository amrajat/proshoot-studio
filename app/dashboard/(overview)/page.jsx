import Link from "next/link";
import Container from "@/components/dashboard/Container";
import { HiChevronRight, HiPlus } from "react-icons/hi2";
import Heading from "@/components/ui/Heading";

async function Dashboard() {
  return (
    <Container>
      <div className="relative overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="mt-5 max-w-4xl text-center mx-auto">
            <Heading type="h1">Generate Your AI Headshots.</Heading>
          </div>
          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg">
              You need to buy studio credits first and then start generating
              images.
            </p>
          </div>
          <div className="mt-8 gap-3 flex justify-center">
            <Link
              href="/dashboard/studio/buy"
              className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none self-center"
            >
              Buy Studio
              <HiChevronRight className="ml-2 h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/dashboard/studio/create"
              className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none self-center"
            >
              Create Studio
              <HiPlus className="ml-2 h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Dashboard;

import Link from "next/link";
import Container from "@/components/dashboard/Container";
import ButtonMovingBorder from "@/components/homepage/ButtonMovingBorder";

async function Dashboard() {
  return (
    <Container>
      <div className="relative overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          {/* Title */}
          <div className="mt-5 max-w-xl text-center mx-auto">
            <h1 className="block font-bold text-gray-800 text-3xl md:text-4xl lg:text-5xl dark:text-gray-200">
              Get your AI Headshots.
            </h1>
          </div>
          {/* End Title */}
          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p
              className="text-lg text-gray-700
        dark:text-gray-300"
            >
              You need to buy studio credits first and then start generating
              images.
            </p>
          </div>
          {/* Buttons */}
          <div className="mt-8 gap-3 flex justify-center">
            <Link href="/dashboard/studio/buy">
              <ButtonMovingBorder>Buy Studio</ButtonMovingBorder>
            </Link>
            <Link href="/dashboard/studio/create">
              <ButtonMovingBorder>Create Studio</ButtonMovingBorder>
            </Link>
          </div>
          {/* End Buttons */}
        </div>
      </div>
    </Container>
  );
}

export default Dashboard;

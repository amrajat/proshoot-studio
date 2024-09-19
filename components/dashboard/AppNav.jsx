"use client";
import Link from "next/link";
import { signOutCurrentUser } from "@/lib/supabase/actions/client";
import { useRouter } from "next/navigation";

function AppNav() {
  const router = useRouter();
  return (
    <nav
      className="bg-white text-sm font-medium text-black ring-1 ring-gray-900 ring-opacity-5 border-t shadow-sm shadow-gray-100 pt-6 md:pb-6 -mt-px   "
      aria-label="Jump links"
    >
      <div className="max-w-7xl snap-x w-full flex items-center overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 md:pb-0 mx-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300   ">
        {/* <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last-pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/"
            aria-label="Proshoot.co"
          >
            <Logo />
          </Link>
        </div> */}
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last-pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard/studio"
          >
            Studio
          </Link>
        </div>

        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard/credits"
          >
            Credits
          </Link>
        </div>
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard/profile"
          >
            Profile
          </Link>
        </div>
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="mailto:support@proshoot.co"
          >
            Support
          </Link>
        </div>
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <button
            onClick={async () => {
              await signOutCurrentUser();
              router.refresh();
            }}
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AppNav;

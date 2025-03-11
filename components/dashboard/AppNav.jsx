"use client";
import Link from "next/link";
import { signOutCurrentUser } from "@/lib/supabase/actions/client";
import { useRouter } from "next/navigation";
import { Home, Image, CreditCard, LifeBuoy, LogOut } from "lucide-react";
import { useState } from "react";

function AppNav() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutCurrentUser();
    router.refresh();
    setSigningOut(false);
  };

  return (
    <nav
      className="bg-white text-sm font-medium text-black ring-1 ring-gray-900 ring-opacity-5 border-t shadow-sm shadow-gray-100 pt-6 md:pb-6 -mt-px"
      aria-label="Jump links"
    >
      <div className="max-w-7xl snap-x w-full flex items-center overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 md:pb-0 mx-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 justify-center">
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last-pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard"
          >
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
        </div>
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard/studio"
          >
            <Image className="h-5 w-5 mr-2" />
            Studio
          </Link>
        </div>

        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="/dashboard/credits"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Credits
          </Link>
        </div>
        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <Link
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
            href="#"
            onClick={() => {
              if (window && window.Intercom)
                window.Intercom("showSpace", "messages");
            }}
          >
            <LifeBuoy className="h-5 w-5 mr-2" />
            Support
          </Link>
        </div>

        <div className="snap-center shrink-0 pe-5 sm:pe-8 sm:last:pe-0">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-x-2 hover:text-gray-500     "
          >
            <LogOut className="h-5 w-5 mr-2 text-destructive" />
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AppNav;

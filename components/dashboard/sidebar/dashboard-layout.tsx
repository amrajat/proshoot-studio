"use client";

import { Sidebar } from "@/components/dashboard/sidebar/sidebar";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AccountProvider, OrganizationContext } from "@/context/AccountContext";

// Define minimal Profile type matching the layout
type Profile = {
  user_id: string;
  full_name?: string | null;
};

// Define props for the layout component
interface DashboardLayoutProps {
  children: React.ReactNode;
  initialProfile: Profile | null;
  initialOrganizations: OrganizationContext[];
}

export default function DashboardLayout({
  children,
  initialProfile,
  initialOrganizations,
}: DashboardLayoutProps) {
  const sidebar = useSidebarContext();
  const { getOpenState, settings } = sidebar;
  return (
    <AccountProvider
      initialProfile={initialProfile}
      initialOrganizations={initialOrganizations}
    >
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
        )}
      >
        <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-4 md:mx-8 flex h-14 items-center">
            <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
              Need help please email us at{" "}
              <Link href="mailto:support@proshoot.co">support@proshoot.co</Link>
              .
            </p>
          </div>
        </div>
      </footer>
    </AccountProvider>
  );
}

"use client";

import { Sidebar } from "./sidebar";
import { MobileMenu } from "./mobile-menu";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

/**
 * Dashboard Layout Component
 *
 * Provides the main layout structure for dashboard pages including:
 * - Sidebar navigation with responsive behavior
 * - Main content area with proper spacing
 * - Footer with support contact information
 *
 * @param {React.ReactNode} children - Page content to render
 */
export default function DashboardLayout({ children }) {
  // ===== SIDEBAR CONTEXT =====
  const sidebar = useSidebarContext();
  const { getOpenState, settings } = sidebar;

  // ===== RESPONSIVE MARGIN CALCULATION =====
  const getMainMargin = () => {
    if (settings.disabled) return "";
    return getOpenState() ? "lg:ml-72" : "lg:ml-[90px]";
  };

  // ===== RENDER =====
  return (
    <>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Mobile Menu */}
      <div className="fixed top-4 left-4 z-10 lg:hidden">
        <MobileMenu />
      </div>

      {/* Main Content Area */}
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 transition-[margin-left] ease-in-out duration-300",
          getMainMargin()
        )}
      >
        <div className="mx-auto container pt-20 pb-20 px-4 sm:px-6 md:pb-8 lg:px-8 lg:py-16">
          {children}
        </div>
      </main>

      {/* Footer */}
      {/* <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          getMainMargin()
        )}
      >
        <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-4 md:mx-8 flex h-14 items-center">
            <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
              Need help please email us at{" "}
              <Link 
                href="mailto:support@proshoot.co"
                className="underline hover:text-foreground transition-colors"
              >
                support@proshoot.co
              </Link>
              .
            </p>
          </div>
        </div>
      </footer> */}
    </>
  );
}

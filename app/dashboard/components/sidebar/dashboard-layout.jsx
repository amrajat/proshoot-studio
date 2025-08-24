"use client";

import { Sidebar } from "./sidebar";
import { MobileMenu } from "./mobile-menu";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { AccountProvider } from "@/context/AccountContext";
import { Toaster } from "@/components/ui/sonner";

/**
 * Dashboard Layout Component
 *
 * Provides the main layout structure for dashboard pages including:
 * - Sidebar navigation with responsive behavior
 * - Main content area with proper spacing
 * - Footer with support contact information
 * - Account context provider for user/organization management
 *
 * @param {React.ReactNode} children - Page content to render
 * @param {Object|null} initialProfile - Initial user profile data
 * @param {Array} initialOrganizations - Initial organizations data
 */
export default function DashboardLayout({
  children,
  initialProfile,
  initialOrganizations,
}) {
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
    <AccountProvider
      initialProfile={initialProfile}
      initialOrganizations={initialOrganizations}
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Mobile Menu */}
      <div className="fixed top-4 left-4 z-10 lg:hidden">
        <MobileMenu />
      </div>

      {/* Main Content Area */}
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
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

      {/* Sonner Toast Notifications */}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </AccountProvider>
  );
}

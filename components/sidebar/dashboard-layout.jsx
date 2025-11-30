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
          "min-h-screen bg-zinc-50 transition-[margin-left] ease-in-out duration-300",
          getMainMargin()
        )}
      >
        <div className="pt-16 pb-8 px-4 sm:px-6 sm:pt-8 md:pb-10 lg:px-8 lg:pt-10 lg:pb-12">
          {children}
        </div>
      </main>
    </>
  );
}

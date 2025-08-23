"use client";
import { Menu } from "./menu";
import { SidebarToggle } from "./sidebar-toggle";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountSwitcher } from "./account-switcher";

export function Sidebar() {
  const sidebar = useSidebarContext();
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <SidebarProvider>
      <aside
        className={cn(
          "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
          !getOpenState() ? "w-[90px]" : "w-72",
          settings.disabled && "hidden"
        )}
      >
        <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
        <div
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800"
        >
          <div className="px-2 mb-1">
            <AccountSwitcher />
          </div>
          <Menu isOpen={getOpenState()} />
        </div>
      </aside>
    </SidebarProvider>
  );
}

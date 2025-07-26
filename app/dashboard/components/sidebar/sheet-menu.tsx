import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "./menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AccountSwitcher } from "./account-switcher";
import { SidebarProvider } from "@/components/ui/sidebar";

export function SheetMenu() {
  return (
    <Sheet modal={false}>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="sm:w-80 px-4 h-full flex flex-col bg-background"
        side="left"
      >
        <SidebarProvider>
          <div className="flex-shrink-0 py-6">
            <AccountSwitcher />
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <Menu isOpen />
          </div>
        </SidebarProvider>
      </SheetContent>
    </Sheet>
  );
}

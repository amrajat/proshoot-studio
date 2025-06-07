import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/dashboard/sidebar/menu";
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
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SidebarProvider>
          <div className="flex-shrink-0 mt-2 text-primary underline-offset-4 hover:underline">
            <AccountSwitcher />
          </div>
          <div className="flex-1 overflow-y-auto">
            <Menu isOpen />
          </div>
        </SidebarProvider>
      </SheetContent>
    </Sheet>
  );
}

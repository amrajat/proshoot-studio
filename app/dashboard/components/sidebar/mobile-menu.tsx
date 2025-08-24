"use client";

import { useState } from "react";
import { MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSwitcher } from "./account-switcher";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Menu } from "./menu";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Trigger Button */}
      <Button
        className="lg:hidden h-8"
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon size={20} />
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

          {/* Menu Panel */}
          <div className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg">
            <SidebarProvider>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="[&_.grid]:!translate-x-0 [&_.grid]:!opacity-100">
                  <AccountSwitcher />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Scrollable Menu Content */}
              <div
                className="flex-1 overflow-y-auto p-4"
                style={{
                  height: "calc(100vh - 80px)", // Account for header height
                  touchAction: "pan-y",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <Menu isOpen={true} onItemClick={handleClose} />
              </div>
            </SidebarProvider>
          </div>
        </div>
      )}
    </>
  );
}

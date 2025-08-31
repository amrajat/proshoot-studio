"use client";

import Link from "next/link";
import { Ellipsis, MapPin, MessageSquare, HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/dashboard/sidebar-menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "./collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface MenuProps {
  isOpen: boolean | undefined;
  onItemClick?: () => void;
}

export function Menu({ isOpen, onItemClick }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  !submenus || submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                (active === undefined && pathname === href) ||
                                active
                                  ? "secondary"
                                  : "ghost"
                              }
                              className={cn(
                                "w-full justify-start h-10 mb-1",
                                (label === "Create Headshots" ||
                                  label === "Buy Credits") &&
                                  "bg-gradient-to-r from-blue-600 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500 hover:text-white"
                              )}
                              asChild
                            >
                              <Link href={href} onClick={onItemClick}>
                                <span
                                  className={cn(isOpen === false ? "" : "mr-4")}
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={
                          active === undefined ? pathname === href : active
                        }
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          <li className="w-full grow flex flex-col items-end justify-end space-y-2">
            {/* Product Tour Button */}
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      // Add product tour logic here
                      onItemClick?.();
                    }}
                    variant="outline"
                    className="w-full h-10 flex items-center px-4"
                  >
                    <div className="flex items-center justify-center w-5 flex-shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap ml-4 flex-1 text-left text-primary",
                        isOpen === false
                          ? "opacity-0 hidden w-0 ml-0"
                          : "opacity-100"
                      )}
                    >
                      Product Tour
                    </span>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Product Tour</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Feedback Button */}
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      // Add feedback logic here
                      window.open(
                        "mailto:feedback@proshoot.co?subject=Feedback",
                        "_blank"
                      );
                      onItemClick?.();
                    }}
                    variant="outline"
                    className="w-full h-10 flex items-center px-4"
                  >
                    <div className="flex items-center justify-center w-5 flex-shrink-0">
                      <MessageSquare size={18} className="text-orange-400" />
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap ml-4 flex-1 text-left text-orange-400",
                        isOpen === false
                          ? "opacity-0 hidden w-0 ml-0"
                          : "opacity-100"
                      )}
                    >
                      Feedback
                    </span>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Feedback</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Support Button */}
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      // Add support logic here
                      window.open(
                        "mailto:support@proshoot.co?subject=Support Request",
                        "_blank"
                      );
                      onItemClick?.();
                    }}
                    variant="outline"
                    className="w-full h-10 flex items-center px-4"
                  >
                    <div className="flex items-center justify-center w-5 flex-shrink-0">
                      <HelpCircle size={18} className="text-success" />
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap ml-4 flex-1 text-left text-success",
                        isOpen === false
                          ? "opacity-0 hidden w-0 ml-0"
                          : "opacity-100"
                      )}
                    >
                      Support
                    </span>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Support</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}

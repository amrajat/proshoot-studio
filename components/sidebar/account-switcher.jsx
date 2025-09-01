"use client";

import * as React from "react";
import {
  Building2,
  ChevronsUpDown,
  CircleUserRound as LucideUser,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateOrganizationForm from "@/components/organizations/update-org-form";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/context/AccountContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/context/SidebarContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";

export function AccountSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { availableContexts, selectedContext, setSelectedContext, isLoading } =
    useAccountContext();
  const { getOpenState } = useSidebarContext();
  const isOpen = getOpenState();

  const [isEditOrgDialogOpen, setEditOrgDialogOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleContextSwitch = React.useCallback(
    async (context) => {
      if (
        typeof window !== "undefined" &&
        selectedContext &&
        (selectedContext.type !== context.type ||
          selectedContext.id !== context.id)
      ) {
        localStorage.removeItem("currentFormStep");
        localStorage.removeItem("formValues");
      }
      await setSelectedContext(context);
      // Refresh the current page after context switch
      router.refresh();
    },
    [selectedContext, setSelectedContext, router]
  );

  const handleOpenEditDialog = () => setEditOrgDialogOpen(true);

  const handleSignOut = React.useCallback(async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
      router.push("/auth");
    } catch (error) {
      setIsSigningOut(false);
    }
  }, [isSigningOut, router]);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Button
            variant="ghost"
            className="opacity-50 cursor-not-allowed w-full justify-start h-10 mb-1"
          >
            <span className={cn(isOpen === false ? "" : "mr-4")}>
              <ChevronsUpDown size={18} className="animate-pulse" />
            </span>
            <div
              className={cn(
                "grid text-left text-sm leading-tight min-w-0",
                isOpen === false
                  ? "-translate-x-96 opacity-0"
                  : "translate-x-0 opacity-100"
              )}
            >
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!selectedContext || availableContexts.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Button
            variant="ghost"
            className="opacity-50 cursor-not-allowed w-full justify-start h-10 mb-1"
          >
            <span className={cn(isOpen === false ? "" : "mr-4")}>
              <LucideUser size={18} />
            </span>
            <div
              className={cn(
                "grid text-left text-sm leading-tight min-w-0",
                isOpen === false
                  ? "-translate-x-96 opacity-0"
                  : "translate-x-0 opacity-100"
              )}
            >
              <span className="truncate font-semibold">No Account</span>
            </div>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const ActiveIcon =
    selectedContext.type === "personal" ? LucideUser : Building2;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-primary/10 data-[state=open]:text-primary hover:bg-primary/5 transition-colors w-full justify-start h-12 mb-2"
              >
                <span className={cn(isOpen === false ? "" : "mr-4")}>
                  <ActiveIcon size={18} />
                </span>
                <div
                  className={cn(
                    "grid text-left text-sm leading-tight min-w-0",
                    isOpen === false
                      ? "-translate-x-96 opacity-0"
                      : "translate-x-0 opacity-100"
                  )}
                >
                  <span className="truncate text-foreground font-bold text-base">
                    {selectedContext.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedContext.type === "personal"
                      ? "Personal Account"
                      : "Organization"}
                  </span>
                </div>
                <ChevronsUpDown
                  className={cn(
                    "ml-auto size-4 text-muted-foreground flex-shrink-0",
                    isOpen === false ? "opacity-0 hidden" : "opacity-100"
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg shadow-lg border"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={8}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
                Switch Account
              </DropdownMenuLabel>
              {availableContexts.map((context, index) => {
                const Icon =
                  context.type === "personal" ? LucideUser : Building2;
                return (
                  <DropdownMenuItem
                    key={context.id}
                    onClick={() => handleContextSwitch(context)}
                    className="gap-3 p-3 cursor-pointer"
                    disabled={context.id === selectedContext?.id}
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
                      <Icon className="size-4 shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{context.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {context.type === "personal"
                          ? "Personal"
                          : "Organization"}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-3 p-3 cursor-pointer"
                onClick={handleOpenEditDialog}
              >
                <div className="flex size-8 items-center justify-center rounded-lg border bg-primary/10">
                  <Building2 className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Edit Organization</span>
                  <span className="text-xs text-muted-foreground">
                    Update settings
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 p-3 cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <div className="flex size-8 items-center justify-center rounded-lg border bg-destructive/10">
                  {isSigningOut ? (
                    <Loader2 className="size-4 text-destructive animate-spin" />
                  ) : (
                    <LogOut className="size-4 text-destructive" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    End your session
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isEditOrgDialogOpen} onOpenChange={setEditOrgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update your organization details
            </DialogDescription>
          </DialogHeader>
          <UpdateOrganizationForm
            onSuccess={async () => {
              setEditOrgDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

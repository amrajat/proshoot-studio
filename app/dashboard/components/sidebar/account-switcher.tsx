"use client";

import * as React from "react";
import { Building, ChevronsUpDown, User as LucideUser } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateOrganizationForm from "@/app/dashboard/components/organizations/UpdateOrganizationForm";

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
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAccountContext } from "@/context/AccountContext";
import { useRouter } from "next/navigation";

// Type definition for backward compatibility
type AvailableContext =
  | ({ type: "personal" } & { id: "personal"; name: string })
  | ({ type: "organization" } & {
      id: string;
      name: string;
      owner_user_id: string;
      team_size?: number | null;
      invite_token?: string | null;
    });

export function AccountSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { availableContexts, selectedContext, setSelectedContext, isLoading } =
    useAccountContext();

  const [isEditOrgDialogOpen, setEditOrgDialogOpen] = React.useState(false);

  const handleContextSwitch = React.useCallback(
    async (context: AvailableContext) => {
      if (
        typeof window !== "undefined" &&
        selectedContext &&
        (selectedContext.type !== context.type ||
          selectedContext.id !== context.id)
      ) {
        localStorage.removeItem("currentFormStep");
        localStorage.removeItem("formValues");
        console.log(
          "Cleared form data from localStorage due to context switch in AccountSwitcher"
        );
      }
      await setSelectedContext(context);
      // Refresh the current page after context switch
      router.refresh();
    },
    [selectedContext, setSelectedContext, router]
  );

  const handleOpenEditDialog = () => setEditOrgDialogOpen(true);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="opacity-50 cursor-not-allowed"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground animate-pulse">
              <ChevronsUpDown className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!selectedContext || availableContexts.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="opacity-50 cursor-not-allowed"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <LucideUser className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">No Account</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const ActiveIcon =
    selectedContext.type === "personal" ? LucideUser : Building;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-primary/10 data-[state=open]:text-primary hover:bg-primary/5 transition-colors min-h-[60px] p-3"
              >
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <ActiveIcon className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold text-foreground text-base">
                    {selectedContext.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedContext.type === "personal"
                      ? "Personal Account"
                      : "Organization"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground flex-shrink-0" />
              </SidebarMenuButton>
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
                  context.type === "personal" ? LucideUser : Building;
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
                  <Building className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Edit Organization</span>
                  <span className="text-xs text-muted-foreground">
                    Update settings
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

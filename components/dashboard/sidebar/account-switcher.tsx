"use client";

import * as React from "react";
import {
  Building,
  ChevronsUpDown,
  Plus,
  User as LucideUser,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OrganizationForm from "@/components/dashboard/organizations/OrganizationForm";

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
import {
  useAccountContext,
  OrganizationContext,
  AvailableContext,
} from "@/context/AccountContext";
import { useRouter, usePathname } from "next/navigation";

export function AccountSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const {
    userId,
    availableContexts,
    selectedContext,
    setSelectedContext,
    isLoading,
    refreshContext,
  } = useAccountContext();

  const [isCreateOrgDialogOpen, setCreateOrgDialogOpen] = React.useState(false);
  const [isEditOrgDialogOpen, setEditOrgDialogOpen] = React.useState(false);
  const [switchToOrgId, setSwitchToOrgId] = React.useState<string | null>(null);

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

  const ownedOrg = React.useMemo(() => {
    if (!userId) return null;
    return availableContexts.find(
      (context) =>
        context.type === "organization" && context.owner_user_id === userId
    ) as OrganizationContext | undefined;
  }, [availableContexts, userId]);

  const userOwnsAnOrg = React.useMemo(() => {
    if (!userId) return false;
    return availableContexts.some(
      (context) =>
        context.type === "organization" && context.owner_user_id === userId
    );
  }, [availableContexts, userId]);

  React.useEffect(() => {
    if (switchToOrgId && availableContexts.length > 0) {
      const targetOrg = availableContexts.find(
        (ctx) => ctx.type === "organization" && ctx.id === switchToOrgId
      ) as Extract<AvailableContext, { type: "organization" }> | undefined;

      if (targetOrg) {
        setSelectedContext(targetOrg);
        setSwitchToOrgId(null);
      }
    }
  }, [availableContexts, switchToOrgId, setSelectedContext, userId]);

  const handleOpenCreateDialog = () => setCreateOrgDialogOpen(true);
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
  const activeDescription = selectedContext.name;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ActiveIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {selectedContext.type === "personal"
                      ? "Personal"
                      : "Organization"}
                  </span>
                  <span className="truncate text-xs">{activeDescription}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Switch Account
              </DropdownMenuLabel>
              {availableContexts.map((context, index) => {
                const Icon =
                  context.type === "personal" ? LucideUser : Building;
                return (
                  <DropdownMenuItem
                    key={context.id}
                    onClick={() => handleContextSwitch(context)}
                    className="gap-2 p-2"
                    disabled={context.id === selectedContext?.id}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Icon className="size-4 shrink-0" />
                    </div>
                    {context.name}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              {!ownedOrg ? (
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={handleOpenCreateDialog}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Create Organization
                  </div>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={handleOpenEditDialog}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Building className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Edit Organization
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog
        open={isCreateOrgDialogOpen}
        onOpenChange={setCreateOrgDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Set up a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm
            mode="create"
            onSuccess={async (newOrgId?: string) => {
              setCreateOrgDialogOpen(false);
              if (newOrgId) {
                setSwitchToOrgId(newOrgId);
              }
              await refreshContext();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOrgDialogOpen} onOpenChange={setEditOrgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the details for your organization: {ownedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm
            mode="edit"
            initialData={ownedOrg}
            onSuccess={async () => {
              setEditOrgDialogOpen(false);
              if (ownedOrg?.id) {
                setSwitchToOrgId(ownedOrg.id);
              }
              await refreshContext();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

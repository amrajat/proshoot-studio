"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useEffect, // Added useEffect
  useCallback,
} from "react";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { SendMailClient } from "zeptomail";

export type OrganizationContext = {
  id: string;
  name: string;
  owner_user_id: string;
  team_size?: number | null;
  website?: string | null;
  industry?: string | null;
  department?: string | null;
  position?: string | null;
  invite_token?: string | null;
  invite_token_generated_at?: string | null;
};

export type PersonalContext = {
  id: "personal";
  name: string;
};

export type AvailableContext =
  | ({ type: "personal" } & PersonalContext)
  | ({ type: "organization" } & OrganizationContext);

type FetchedProfile = {
  user_id: string;
  full_name?: string | null;
};

type FetchedOrganizationDetail = {
  id: string;
  name: string;
  owner_user_id: string;
  team_size?: number | null;
  website?: string | null;
  industry?: string | null;
  department?: string | null;
  position?: string | null;
  invite_token?: string | null;
  invite_token_generated_at?: string | null;
};

type FetchedOrgMember = {
  organizations: FetchedOrganizationDetail[] | null;
};

interface AccountContextProps {
  userId: string | null;
  availableContexts: AvailableContext[];
  selectedContext: AvailableContext | null;
  setSelectedContext: (context: AvailableContext | null) => void;
  isLoading: boolean;
  refreshContext: () => Promise<void>;
  isCurrentUserOrgAdmin: boolean;
  switchToOrgAfterRefresh: (orgId: string) => void;
}

const AccountContext = createContext<AccountContextProps | undefined>(
  undefined
);

interface AccountProviderProps {
  children: ReactNode;
  initialProfile: FetchedProfile | null;
  initialOrganizations: OrganizationContext[];
  initialIsLoading?: boolean;
}

const LOCAL_STORAGE_KEY = "selectedAccountContextIdentifier";

type StoredContextIdentifier = {
  id: string;
  type: "personal" | "organization";
};

export const AccountProvider = ({
  children,
  initialProfile: initialProfileData,
  initialOrganizations: initialOrganizationsData,
  initialIsLoading = false,
}: AccountProviderProps) => {
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [isInitializing, setIsInitializing] = useState(true);
  const [profile, setProfile] = useState<FetchedProfile | null>(
    initialProfileData
  );
  const [organizations, setOrganizations] = useState<OrganizationContext[]>(
    initialOrganizationsData
  );

  // Initialize selectedContext state. The actual value will be set by the useEffect below.
  const [selectedContext, setSelectedContextInternal] =
    useState<AvailableContext | null>(null);
  const [switchToOrgId, setSwitchToOrgId] = useState<string | null>(null);

  const userId = useMemo(() => profile?.user_id || null, [profile]);

  const isCurrentUserOrgAdmin = useMemo(() => {
    if (
      !selectedContext ||
      selectedContext.type !== "organization" ||
      !userId
    ) {
      return false;
    }
    const orgContext = selectedContext as Extract<
      AvailableContext,
      { type: "organization" }
    >;
    return orgContext.owner_user_id === userId;
  }, [selectedContext, userId]);

  const availableContexts = useMemo(() => {
    const contexts: AvailableContext[] = [];
    if (profile) {
      contexts.push({
        type: "personal",
        id: "personal",
        name: profile.full_name || `User (${profile.user_id.substring(0, 6)})`,
      });
    }
    organizations.forEach((org) => {
      contexts.push({
        type: "organization",
        ...org,
      });
    });
    return contexts;
  }, [profile, organizations]);

  // >>> refreshContext MUST BE DEFINED BEFORE setSelectedContext <<<
  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Refresh Context: Auth Error", authError);
      setProfile(null);
      setOrganizations([]);
    } else {
      try {
        const [profileRes, orgMembersRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("organization_members")
            .select(
              "organizations (id, name, owner_user_id, team_size, website, industry, department, position, invite_token, invite_token_generated_at)"
            )
            .eq("user_id", user.id),
        ]);

        if (profileRes.error) {
          console.error(
            "Refresh Context: Profile fetch error:",
            profileRes.error
          );
        }
        if (orgMembersRes.error) {
          console.error(
            "Refresh Context: Org members fetch error:",
            orgMembersRes.error
          );
        }

        setProfile(profileRes.data as FetchedProfile | null);

        const fetchedOrgs: OrganizationContext[] =
          orgMembersRes.data
            ?.flatMap((om: FetchedOrgMember) => om.organizations || [])
            .filter((org): org is FetchedOrganizationDetail => !!org)
            .map((org) => ({ ...org }))
            .filter(
              (org, index, self) =>
                index === self.findIndex((o) => o.id === org.id)
            ) || [];
        setOrganizations(fetchedOrgs);
      } catch (error) {
        console.error("Refresh Context: Unexpected error:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Effect to initialize selectedContext from localStorage or defaults
  useEffect(() => {
    let initialSelection: AvailableContext | null = null;
    let foundInStorage = false;

    if (typeof window !== "undefined" && availableContexts.length > 0) {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedValue) {
        try {
          const storedIdentifier: StoredContextIdentifier =
            JSON.parse(storedValue);
          const matchingContext = availableContexts.find(
            (ctx) =>
              ctx.id === storedIdentifier.id &&
              ctx.type === storedIdentifier.type
          );
          if (matchingContext) {
            initialSelection = matchingContext;
            foundInStorage = true;
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean up invalid stored value
          }
        } catch (error) {
          console.error(
            "Error parsing selectedContext from localStorage on init",
            error
          );
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }

      if (foundInStorage && initialSelection) {
        // Only set if different from current to avoid loops if already set by another tab via storage event
        if (
          JSON.stringify(selectedContext) !== JSON.stringify(initialSelection)
        ) {
          setSelectedContextInternal(initialSelection);
        }
      } else if (!selectedContext) {
        // If no context currently selected (e.g. initial load and nothing valid in storage)
        const personal = availableContexts.find((c) => c.type === "personal");
        const firstOrg = availableContexts.find(
          (c) => c.type === "organization"
        );
        setSelectedContextInternal(personal || firstOrg || null);
      }
    } else if (availableContexts.length === 0 && selectedContext !== null) {
      // If contexts become empty, clear selection
      setSelectedContextInternal(null);
    }
  }, [availableContexts]); // Rerun when availableContexts changes. SelectedContext removed from deps.

  const setSelectedContext = useCallback(
    async (context: AvailableContext | null) => {
      setIsLoading(true); // Set loading true immediately

      try {
        // Clear form data from localStorage when switching contexts
        if (typeof window !== "undefined") {
          // Only clear if we're actually switching contexts (not just initializing)
          if (
            selectedContext &&
            context &&
            (selectedContext.type !== context.type ||
              selectedContext.id !== context.id)
          ) {
            localStorage.removeItem("currentFormStep");
            localStorage.removeItem("formValues");
          }
        }

        setSelectedContextInternal(context); // Update internal state
        if (context) {
          const identifierToStore: StoredContextIdentifier = {
            id: context.id,
            type: context.type,
          };
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(identifierToStore)
          );
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        // Refresh context to ensure all data (credits, etc.) aligns with the new selection
        await refreshContext();
      } catch (error) {
        console.error("Error during context switch:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setSelectedContextInternal, refreshContext, selectedContext]
  );

  // Effect for cross-tab synchronization via localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        if (event.newValue) {
          try {
            const newIdentifier: StoredContextIdentifier = JSON.parse(
              event.newValue
            );
            const newSelectedContext = availableContexts.find(
              (ctx) =>
                ctx.id === newIdentifier.id && ctx.type === newIdentifier.type
            );
            if (
              newSelectedContext &&
              JSON.stringify(newSelectedContext) !==
                JSON.stringify(selectedContext)
            ) {
              setSelectedContextInternal(newSelectedContext);
            } else if (!newSelectedContext && selectedContext !== null) {
              setSelectedContextInternal(null); // Item was validly set to something not in availableContexts or cleared
            }
          } catch (error) {
            console.error(
              "Error processing storage event for selectedContext",
              error
            );
          }
        } else {
          // newValue is null, meaning item was removed from localStorage
          if (selectedContext !== null) {
            setSelectedContextInternal(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [availableContexts, selectedContext]); // Re-run if availableContexts changes or selectedContext changes locally

  // Effect to refresh context on initial client-side mount
  useEffect(() => {
    refreshContext();
  }, [refreshContext]); // refreshContext added as dependency

  const switchToOrgAfterRefresh = (orgId: string) => {
    setSwitchToOrgId(orgId);
  };

  // Effect to handle the actual switch AFTER contexts are refreshed
  // This runs when availableContexts changes OR switchToOrgId changes
  useEffect(() => {
    if (switchToOrgId && availableContexts.length > 0) {
      const targetOrg = availableContexts.find(
        (ctx) => ctx.type === "organization" && ctx.id === switchToOrgId
      ) as Extract<AvailableContext, { type: "organization" }> | undefined;

      if (targetOrg) {
        setSelectedContext(targetOrg); // Use the existing setSelectedContext function
        setSwitchToOrgId(null); // Reset the trigger
      }
      // Optional: Handle case where org ID is not found after refresh (e.g., deleted?)
      // else {
      //   setSwitchToOrgId(null);
      // }
    }
  }, [availableContexts, switchToOrgId, setSelectedContext]); // Dependency array includes setSelectedContext

  const value = {
    userId,
    availableContexts,
    selectedContext,
    setSelectedContext,
    isLoading,
    refreshContext,
    isCurrentUserOrgAdmin,
    switchToOrgAfterRefresh,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccountContext must be used within an AccountProvider");
  }
  return context;
};

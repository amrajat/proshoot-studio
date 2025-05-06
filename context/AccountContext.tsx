"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { User as LucideUser, Building } from "lucide-react";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client"; // Import browser client

// Define types for context data
export type OrganizationContext = {
  id: string;
  name: string;
  owner_user_id: string;
  team_size?: number | null; // Add optional team_size
  website?: string | null; // Add optional website
  industry?: string | null; // Add optional industry
  department?: string | null; // Add optional department
  position?: string | null; // Add optional position
};

export type PersonalContext = {
  id: "personal"; // Use a fixed ID for personal context
  name: string; // User's full name
};

export type AvailableContext =
  | ({ type: "personal" } & PersonalContext)
  | ({ type: "organization" } & OrganizationContext);

// Define the shape of the Supabase data we expect from fetching
// (Mirroring the structure fetched in app/dashboard/layout.tsx)
type FetchedProfile = {
  user_id: string;
  full_name?: string | null;
};

// Adjust FetchedOrgMember: organizations is an array of detailed objects, or null/undefined
type FetchedOrganizationDetail = {
  id: string;
  name: string;
  owner_user_id: string;
  team_size?: number | null;
  website?: string | null;
  industry?: string | null;
  department?: string | null;
  position?: string | null;
};

type FetchedOrgMember = {
  organizations: FetchedOrganizationDetail[] | null; // organizations is an array or null
};

interface AccountContextProps {
  userId: string | null;
  availableContexts: AvailableContext[];
  selectedContext: AvailableContext | null;
  setSelectedContext: (context: AvailableContext | null) => void;
  isLoading: boolean;
  refreshContext: () => Promise<void>; // Add refresh function
}

const AccountContext = createContext<AccountContextProps | undefined>(
  undefined
);

interface AccountProviderProps {
  children: ReactNode;
  initialProfile: FetchedProfile | null; // Use FetchedProfile type
  initialOrganizations: OrganizationContext[]; // Type for initial prop is fine
  initialIsLoading?: boolean;
}

export const AccountProvider = ({
  children,
  initialProfile: initialProfileData, // Rename to avoid conflict
  initialOrganizations: initialOrganizationsData, // Rename
  initialIsLoading = false,
}: AccountProviderProps) => {
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  // State to hold the actual profile and orgs data, allowing refresh
  const [profile, setProfile] = useState<FetchedProfile | null>(
    initialProfileData
  );
  const [organizations, setOrganizations] = useState<OrganizationContext[]>(
    initialOrganizationsData
  );

  const userId = useMemo(() => profile?.user_id || null, [profile]);

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
        ...org, // Spread all fields from OrganizationContext type
      });
    });
    return contexts;
  }, [profile, organizations]);

  const [selectedContext, setSelectedContextInternal] =
    useState<AvailableContext | null>(null);

  // Effect to initialize or update selectedContext when availableContexts change
  React.useEffect(() => {
    const personal = availableContexts.find((c) => c.type === "personal");
    const firstOrg = availableContexts.find((c) => c.type === "organization");

    // If current selection is still valid, keep it
    const currentSelectionValid = selectedContext
      ? availableContexts.some((ctx) => ctx.id === selectedContext.id)
      : false;

    if (currentSelectionValid) {
      // Update the selected context object instance if necessary (e.g., name changed)
      const updatedSelected = availableContexts.find(
        (ctx) => ctx.id === selectedContext!.id
      );
      if (
        updatedSelected &&
        JSON.stringify(updatedSelected) !== JSON.stringify(selectedContext)
      ) {
        setSelectedContextInternal(updatedSelected);
      }
    } else {
      // Otherwise, default: personal > first org > null
      setSelectedContextInternal(personal || firstOrg || null);
    }
  }, [availableContexts]); // Rerun when contexts list changes

  // The public setter function remains the same
  const setSelectedContext = (context: AvailableContext | null) => {
    setSelectedContextInternal(context);
  };

  // --- Refresh Function Implementation ---
  const refreshContext = async () => {
    console.log("Starting refreshContext...");
    setIsLoading(true);

    // --- Restore the core logic ---
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Refresh Context: Auth Error", authError);
      setProfile(null);
      setOrganizations([]);
      // No return here, let finally handle setIsLoading
    } else {
      try {
        // Fetch profile and organizations in parallel
        const [profileRes, orgMembersRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("organization_members")
            .select(
              "organizations (id, name, owner_user_id, team_size, website, industry, department, position)"
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
    // --- End of restored logic ---

    // Remove simulated delay unless specifically needed for debugging later
    // await new Promise(resolve => setTimeout(resolve, 50));

    console.log("...Finishing refreshContext");
    setIsLoading(false);
  };
  // --- End Refresh Function ---

  const value = {
    userId,
    availableContexts,
    selectedContext,
    setSelectedContext,
    isLoading,
    refreshContext, // Provide the refresh function
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

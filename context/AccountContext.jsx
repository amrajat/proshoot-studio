"use client";

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const LOCAL_STORAGE_KEY = "selectedAccountContextIdentifier";

// ============================================================================
// CONTEXT SETUP
// ============================================================================

const AccountContext = createContext(undefined);

// ============================================================================
// MAIN PROVIDER COMPONENT
// ============================================================================

export const AccountProvider = ({
  children,
  initialProfile = null,
  initialOrganizations = [],
  initialIsLoading = false,
}) => {
  // Core state
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [profile, setProfile] = useState(initialProfile);
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [selectedContext, setSelectedContextInternal] = useState(null);

  // Derived values
  const userId = useMemo(() => profile?.user_id || null, [profile]);

  const availableContexts = useMemo(() => {
    const contexts = [];

    // Add personal context
    if (profile) {
      contexts.push({
        type: "personal",
        id: "personal",
        name: profile.full_name || `User (${profile.user_id.substring(0, 6)})`,
      });
    }

    // Add organization contexts
    organizations.forEach((org) => {
      contexts.push({
        type: "organization",
        ...org,
      });
    });

    return contexts;
  }, [profile, organizations]);

  const isCurrentUserOrgAdmin = useMemo(() => {
    if (
      !selectedContext ||
      selectedContext.type !== "organization" ||
      !userId
    ) {
      return false;
    }
    return selectedContext.owner_user_id === userId;
  }, [selectedContext, userId]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setProfile(null);
        setOrganizations([]);
        return;
      }

      // Fetch profile and organizations in parallel
      const [profileRes, orgMembersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, email, created_at")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("members")
          .select(
            `
            organizations (
              id,
              name,
              owner_user_id,
              team_size,
              invite_token
            )
          `
          )
          .eq("user_id", user.id),
      ]);

      // Handle profile
      if (profileRes.error) {
        setProfile(null);
      } else {
        setProfile(profileRes.data);
      }

      // Handle organizations
      if (orgMembersRes.error) {
        setOrganizations([]);
      } else {
        const orgs =
          orgMembersRes.data
            ?.map((member) => member.organizations)
            .filter(Boolean) || [];
        setOrganizations(orgs);
      }
    } catch (error) {
      setProfile(null);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // CONTEXT SWITCHING WITH LOCALSTORAGE
  // ============================================================================

  const setSelectedContext = useCallback(
    async (context) => {
      if (!context) {
        setSelectedContextInternal(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }

      setIsLoading(true);

      try {
        // Update internal state
        setSelectedContextInternal(context);

        // Save to localStorage for persistence
        const identifier = {
          id: context.id,
          type: context.type,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(identifier));

        // Refresh context to ensure data alignment
        await refreshContext();
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
    [refreshContext]
  );

  // ============================================================================
  // INITIALIZATION & CROSS-TAB SYNC
  // ============================================================================

  // Initialize context from localStorage or defaults
  useEffect(() => {
    if (typeof window === "undefined" || availableContexts.length === 0) return;

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (stored) {
        const identifier = JSON.parse(stored);
        const matchingContext = availableContexts.find(
          (ctx) => ctx.id === identifier.id && ctx.type === identifier.type
        );

        if (matchingContext) {
          setSelectedContextInternal(matchingContext);
          return;
        }
      }

      // No stored context or invalid - use defaults
      if (!selectedContext) {
        const personal = availableContexts.find((c) => c.type === "personal");
        const firstOrg = availableContexts.find(
          (c) => c.type === "organization"
        );
        setSelectedContextInternal(personal || firstOrg || null);
      }
    } catch (error) {
      // Fallback to default
      const personal = availableContexts.find((c) => c.type === "personal");
      setSelectedContextInternal(personal || availableContexts[0] || null);
    }
  }, [availableContexts]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== LOCAL_STORAGE_KEY) return;

      try {
        if (event.newValue) {
          const identifier = JSON.parse(event.newValue);
          const newContext = availableContexts.find(
            (ctx) => ctx.id === identifier.id && ctx.type === identifier.type
          );

          if (
            newContext &&
            JSON.stringify(newContext) !== JSON.stringify(selectedContext)
          ) {
            setSelectedContextInternal(newContext);
          }
        } else {
          // Context was cleared in another tab
          if (selectedContext !== null) {
            setSelectedContextInternal(null);
          }
        }
      } catch (error) {}
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [availableContexts, selectedContext]);

  // Initial data fetch
  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = {
    userId,
    profile,
    organizations,
    availableContexts,
    selectedContext,
    setSelectedContext,
    isLoading,
    refreshContext,
    isCurrentUserOrgAdmin,
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccountContext must be used within an AccountProvider");
  }
  return context;
};

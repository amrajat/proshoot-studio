// app/dashboard/_components/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client"; // Use Browser client for client-side fetching
import {
  useAccountContext,
  type OrganizationContext as OrgContextTypeFromAccount,
} from "@/context/AccountContext"; // Import the context hook
import { useRouter } from "next/navigation"; // For redirecting
import Link from "next/link"; // For links
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import StudioCreate from "@/app/dashboard/studio/create/page";
import OrganizationAdminDashboardComponent from "@/components/dashboard/organizations/OrganizationAdminDashboard"; // IMPORT THE ACTUAL COMPONENT

// Re-use or import type from context or a central types file
type Credits = {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  balance: number;
  starter: number;
  pro: number;
  elite: number;
  studio: number;
};

// Props now only needs userId if client-side actions need it
interface DashboardClientProps {
  userId: string;
}

// Helper to check for plan credits
const checkPlanCredits = (credits: Credits | null | undefined): boolean => {
  if (!credits) return false;
  return (
    credits.starter > 0 ||
    credits.pro > 0 ||
    credits.elite > 0 ||
    credits.studio > 0
  );
};

export default function DashboardClient({ userId }: DashboardClientProps) {
  const {
    selectedContext,
    isLoading: contextLoading,
    isCurrentUserOrgAdmin,
  } = useAccountContext();
  const router = useRouter();

  // State for personal credits fetched client-side
  const [personalCredits, setPersonalCredits] = useState<
    Credits | null | undefined
  >(
    undefined // Initial state: undefined means not fetched yet
  );
  const [creditsLoading, setCreditsLoading] = useState<boolean>(false);

  // Fetch personal credits when personal context is selected
  useEffect(() => {
    const fetchPersonalCredits = async () => {
      if (selectedContext?.type !== "personal" || !userId) {
        setPersonalCredits(undefined); // Reset if not personal context
        return;
      }

      setCreditsLoading(true);
      const supabase = createSupabaseBrowserClient(); // Create browser client
      const { data, error } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", userId)
        .is("organization_id", null)
        .maybeSingle();

      if (error) {
        console.error("Error fetching personal credits:", error.message);
        setPersonalCredits(null); // Set to null on error
      } else {
        setPersonalCredits(data); // Set fetched data (can be null if no row)
      }
      setCreditsLoading(false);
    };

    fetchPersonalCredits();
  }, [selectedContext, userId]); // Re-run when context or userId changes

  // --- Render Logic ---

  // 1. Handle Loading State (Context loading)
  if (contextLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // 2. Handle No Context Selected (Error or Initial State)
  if (!selectedContext) {
    // This might indicate an error state or that the user has NO profile/orgs.
    // Redirect to a setup page or show an error/prompt?
    // For now, show a simple message.
    // TODO: Handle case where user genuinely has no personal profile or orgs yet.
    // This might involve showing the 'initialChoice' UI again, or guiding to create profile/org.
    return <div>Error loading account context or no contexts available.</div>;
  }

  // 3. Render based on Selected Context Type
  if (selectedContext.type === "personal") {
    return <StudioCreate />;
  }

  if (selectedContext.type === "organization") {
    if (isCurrentUserOrgAdmin) {
      // Ensure selectedContext is correctly typed for OrganizationAdminDashboardComponent
      const orgAdminContext = selectedContext as OrgContextTypeFromAccount & {
        type: "organization";
      };
      return (
        <OrganizationAdminDashboardComponent orgContext={orgAdminContext} />
      );
    } else {
      // User is a member, not an admin
      // TODO: Pass any necessary org-specific props to StudioCreate if needed
      // e.g., for restricted clothing/backgrounds, though the prompt says StudioCreate handles this.
      return <StudioCreate />;
    }
  }

  // Fallback if context type is somehow unexpected
  return <div>Invalid account context selected.</div>;
}

// app/dashboard/_components/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client"; // Use Browser client for client-side fetching
import { useAccountContext } from "@/context/AccountContext"; // Import the context hook
import { useRouter } from "next/navigation"; // For redirecting
import Link from "next/link"; // For links
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

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
  const { selectedContext, isLoading: contextLoading } = useAccountContext();
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
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Personal Dashboard</h2>
        {creditsLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {!creditsLoading && (
          <>
            {checkPlanCredits(personalCredits) ? (
              <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50">
                <p className="mb-2 text-green-800 dark:text-green-300">
                  You have credits available!
                </p>
                <Button asChild>
                  <Link href="/dashboard/studio/create">
                    Create New Headshots
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50">
                <p className="mb-2 text-amber-800 dark:text-amber-300">
                  You need credits to create headshots for your personal
                  account.
                </p>
                <Button asChild>
                  <Link href="/dashboard/billing">Go to Billing</Link>
                </Button>
              </div>
            )}
            {/* Display current credits if needed */}
            {/* <pre>Credits: {JSON.stringify(personalCredits, null, 2)}</pre> */}
          </>
        )}
      </div>
    );
  }

  if (selectedContext.type === "organization") {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Organization Dashboard: {selectedContext.name}
        </h2>
        <p className="text-muted-foreground">
          You are currently viewing the dashboard in the context of the
          organization '{selectedContext.name}'.
        </p>
        {/* Add Organization-specific components/links here */}
        {/* Example: Link to org settings, members, org billing, org studios etc. */}
        <div className="mt-4 space-x-2">
          <Button asChild variant="outline">
            <Link
              href={`/dashboard/organization/${selectedContext.id}/settings`}
            >
              Organization Settings
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              href={`/dashboard/organization/${selectedContext.id}/members`}
            >
              Manage Members
            </Link>
          </Button>
          {/* Add more org-specific actions */}
        </div>
      </div>
    );
  }

  // Fallback if context type is somehow unexpected
  return <div>Invalid account context selected.</div>;
}

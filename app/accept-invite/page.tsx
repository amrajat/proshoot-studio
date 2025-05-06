"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import createClient from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AcceptInvitePage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    "Processing invitation..."
  );
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing from the URL.");
      setMessage(null);
      return;
    }

    const checkSessionAndAccept = async () => {
      setIsLoading(true);
      setMessage("Verifying user...");
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError("Could not verify user session.");
        setMessage(null);
        setIsLoading(false);
        return;
      }

      if (!session?.user) {
        // User not logged in
        setMessage("Please log in or sign up to accept the invitation.");
        setError(null); // Clear previous errors
        setRequiresLogin(true);
        setIsLoading(false);
        return;
      }

      // User is logged in, attempt to accept
      setUser(session.user);
      setMessage("Accepting invitation...");

      try {
        const { data, error: rpcError } = await supabase.rpc(
          "accept_invitation_and_transfer_credits",
          {
            invitation_token: token,
            accepting_user_id: session.user.id,
            accepting_user_email: session.user.email,
          }
        );

        if (rpcError) {
          throw rpcError;
        }

        // RPC call returns an array with one result object
        const result = data?.[0];

        if (result?.success) {
          setMessage(result.message || "Invitation accepted successfully!");
          setError(null);
          // Redirect to the organization's page or dashboard
          setTimeout(() => {
            router.push(
              result.organization_id
                ? `/dashboard/organization/${result.organization_id}`
                : "/dashboard"
            );
            router.refresh();
          }, 2000); // Short delay to show message
        } else {
          setError(result?.message || "Failed to accept invitation.");
          setMessage(null);
        }
      } catch (err: any) {
        console.error("Accept invite RPC error:", err);
        setError(
          err.message ||
            "An unexpected error occurred while accepting the invitation."
        );
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSessionAndAccept();
  }, [token, supabase, router]); // Dependency array

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold">Accept Invitation</h1>
        {isLoading && (
          <p className="text-gray-600">{message || "Loading..."}</p>
          // Optional: Add a spinner here
        )}
        {!isLoading && message && (
          <p className="text-green-600 font-semibold">{message}</p>
        )}
        {!isLoading && error && (
          <p className="text-red-500 font-semibold">Error: {error}</p>
        )}
        {!isLoading && requiresLogin && (
          <div className="space-y-4">
            <p className="text-gray-700">{message}</p>
            <Link
              href={`/auth?redirect=/accept-invite?token=${token}`}
              passHref
              legacyBehavior
            >
              <Button className="w-full">Login or Sign Up</Button>
            </Link>
          </div>
        )}
        {!isLoading && !requiresLogin && (message || error) && (
          <Link href="/dashboard" passHref legacyBehavior>
            <Button variant="outline" className="mt-4">
              Go to Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

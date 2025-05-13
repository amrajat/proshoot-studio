"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { acceptUniversalInviteAction } from "./_actions/acceptInviteActions"; // New action
// import { acceptRegularInviteAction } from './_actions/acceptInviteActions'; // Assuming you might have one for regular token
// import { useAccountContext } from "@/context/AccountContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AcceptInvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { refreshContext } = useAccountContext();

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");
  const universalToken = searchParams.get("universal_token");
  const orgId = searchParams.get("orgId") || searchParams.get("org_id");

  useEffect(() => {
    const processInvite = async () => {
      setIsLoading(true);
      setMessage(null);
      setError(null);

      if (universalToken && orgId) {
        // Handle Universal Invite Link
        const result = await acceptUniversalInviteAction({
          universalToken,
          organizationId: orgId,
        });
        if (result.error) {
          setError(result.error);
          toast({
            title: "Invite Acceptance Failed",
            description: result.error,
            variant: "destructive",
          });
        } else if (result.data) {
          let successMsg = `Successfully joined ${
            result.data.organization_name || "the organization"
          }!`;
          if (result.data.message === "Already a member.") {
            successMsg = `You are already a member of ${
              result.data.organization_name || "this organization"
            }.`;
          }
          setMessage(successMsg);
          toast({ title: "Invite Accepted!", description: successMsg });
          // await refreshContext(); // Refresh context to include new org
          router.push("/dashboard"); // Redirect to dashboard
        }
      } else if (token && orgId) {
        // Handle Shareable Link Token (which uses 'token' and 'orgId')
        console.log(
          `Processing shareable link invite with token: ${token} and orgId: ${orgId}`
        );
        const result = await acceptUniversalInviteAction({
          universalToken: token, // Pass the 'token' as the universalToken
          organizationId: orgId,
        });
        if (result.error) {
          setError(result.error);
          toast({
            title: "Invite Acceptance Failed",
            description: result.error,
            variant: "destructive",
          });
        } else if (result.data) {
          let successMsg = `Successfully joined ${
            result.data.organization_name || "the organization"
          }!`;
          if (result.data.message === "Already a member.") {
            successMsg = `You are already a member of ${
              result.data.organization_name || "this organization"
            }.`;
          }
          setMessage(successMsg);
          toast({ title: "Invite Accepted!", description: successMsg });
          // await refreshContext();
          router.push("/dashboard");
        }
      } else {
        setError("No valid invitation token and organization ID provided.");
        toast({
          title: "Error",
          description: "Invitation link is incomplete or invalid.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    processInvite();
  }, [token, universalToken, orgId, router]); // removed refreshContext from this array temporarily

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Processing your invitation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
          <h2 className="text-xl font-semibold mb-2">
            Error Accepting Invitation
          </h2>
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Invitation Processed</h2>
          <p>{message}</p>
        </div>
      )}
      <Link href="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading invite...</p>
        </div>
      }
    >
      <AcceptInvitePageContent />
    </Suspense>
  );
}

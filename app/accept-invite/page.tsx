"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { acceptInvitationAction } from "./_actions/acceptInviteActions"; // Use the new unified action
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function AcceptInvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to prevent useEffect from running twice in dev strict mode
  const hasProcessed = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    // Guard to ensure the effect runs only once
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processInvite = async () => {
      setIsLoading(true);
      setMessage(null);
      setError(null);

      if (!token) {
        setError("The invitation link is missing a token.");
        setIsLoading(false);
        return;
      }

      const result = await acceptInvitationAction({ token });

      if (result.error) {
        setError(result.error);
        toast({
          title: "Error Accepting Invitation",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.data) {
        const successMsg =
          result.data.message || `Successfully joined the organization!`;
        setMessage(successMsg);
        toast({ title: "Invite Accepted!", description: successMsg });
        // Redirect to the dashboard after a short delay to allow user to read the message
        setTimeout(() => router.push("/dashboard"), 2000);
      }
      setIsLoading(false);
    };

    processInvite();
  }, [token, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Processing your invitation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
      {error && (
        <div className="mb-4 max-w-md p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
          <h2 className="text-xl font-semibold mb-2">
            Error Accepting Invitation
          </h2>
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 max-w-md p-4 bg-green-100 text-green-700 border border-green-300 rounded-md">
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

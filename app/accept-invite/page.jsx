"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { acceptInvitationAction } from "./actions/acceptInviteActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";

function AcceptInvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState({
    status: "loading",
    message: null,
    isRedirecting: false,
  });

  // Use a ref to prevent useEffect from running twice in dev strict mode
  const hasProcessed = useRef(false);
  const token = searchParams.get("token");

  const handleRedirectToDashboard = useCallback(() => {
    setState((prev) => ({ ...prev, isRedirecting: true }));
    router.push("/");
  }, [router]);

  const processInvitation = useCallback(
    async (inviteToken) => {
      try {
        const result = await acceptInvitationAction({ token: inviteToken });

        if (result.error) {
          // Check if it's an "already member" success case disguised as error
          if (result.error.toLowerCase().includes("already a member")) {
            setState({
              status: "success",
              message: "You are already a member of this organization!",
              isRedirecting: false,
            });

            toast.success("You are already a member of this organization!");

            // Auto-redirect after 2 seconds for already member case
            setTimeout(() => {
              handleRedirectToDashboard();
            }, 2000);
          } else {
            // Actual error case
            setState({
              status: "error",
              message: result.error,
              isRedirecting: false,
            });

            toast.error(result.error);
          }
        } else if (result.data?.success) {
          const successMessage =
            result.data.message || "Successfully joined the organization!";

          setState({
            status: "success",
            message: successMessage,
            isRedirecting: false,
          });

          toast.success(successMessage);

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            handleRedirectToDashboard();
          }, 3000);
        } else {
          setState({
            status: "error",
            message: "Received unexpected response. Please try again.",
            isRedirecting: false,
          });
        }
      } catch (error) {
        setState({
          status: "error",
          message: "An unexpected error occurred. Please try again later.",
          isRedirecting: false,
        });
      }
    },
    [handleRedirectToDashboard]
  );

  useEffect(() => {
    // Guard to ensure the effect runs only once
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    if (!token || token.trim() === "") {
      setState({
        status: "invalid-token",
        message:
          "The invitation link is missing a valid token. Please check the link and try again.",
        isRedirecting: false,
      });
      return;
    }

    processInvitation(token);
  }, [token, processInvitation]);

  const renderContent = () => {
    switch (state.status) {
      case "loading":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
              <CardTitle className="text-xl">Processing Invitation</CardTitle>
              <CardDescription>
                Please wait while we process your organization invitation...
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case "success":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-700">Welcome!</CardTitle>
              <CardDescription className="text-green-600">
                {state.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-700">
                    You have been successfully added to the organization and
                    received 1 team credit.
                    {state.isRedirecting
                      ? " Redirecting..."
                      : " Redirecting in a few seconds..."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleRedirectToDashboard}
                  disabled={state.isRedirecting}
                  className="w-full"
                >
                  {state.isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "error":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-700">
                Invitation Failed
              </CardTitle>
              <CardDescription className="text-red-600">
                We encountered an issue processing your invitation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700">{state.message}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Link href="/" className="w-full">
                  <Button variant="secondary" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );

      case "invalid-token":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-amber-600" />
              </div>
              <CardTitle className="text-xl text-amber-700">
                Invalid Invitation
              </CardTitle>
              <CardDescription className="text-amber-600">
                The invitation link appears to be invalid or incomplete.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-700">{state.message}</p>
                </div>
              </div>
              <Link href="/" className="w-full">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{renderContent()}</div>
    </div>
  );
}

function AcceptInvitePageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <CardTitle className="text-xl">Loading Invitation</CardTitle>
          <CardDescription>
            Please wait while we load your invitation details...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInvitePageFallback />}>
      <AcceptInvitePageContent />
    </Suspense>
  );
}

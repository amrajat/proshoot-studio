"use client";

import { useState } from "react";
import { signInWithOAuth } from "@/lib/supabase/actions/server";
import { Button } from "@/components/ui/button";
import { GoogleIcon, LinkedInIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function OAuth({ provider, lastSignedInMethod }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const providerConfig = {
    google: {
      icon: <GoogleIcon className="w-5 h-5 mr-2" />,
      text: "Continue with Google",
    },
    linkedin_oidc: {
      icon: <LinkedInIcon className="w-5 h-5 mr-2" />,
      text: "Continue with LinkedIn",
    },
  };

  // Validate that the provider is supported
  if (!providerConfig[provider]) {
    console.error(`Unsupported OAuth provider: ${provider}`);
    return null;
  }

  const { icon, text } = providerConfig[provider];

  const handleOAuthSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use a timeout to allow the loading state to render before redirect
      // This prevents the error from showing up briefly
      setTimeout(async () => {
        try {
          await signInWithOAuth(provider);
          // We should never reach this point due to the redirect
          // But if we do, we'll wait a bit before showing an error
          // to avoid flashing messages during normal operation
          setTimeout(() => {
            setError("Authentication failed. Please try again.");
            setIsLoading(false);
          }, 5000);
        } catch (error) {
          // Only handle non-redirect errors
          if (error.message !== "NEXT_REDIRECT") {
            console.error(`OAuth sign-in error with ${provider}:`, error);
            setError(`Authentication error: ${error.message}`);
            setIsLoading(false);
          }
          // For NEXT_REDIRECT errors, we don't need to do anything
          // as the page will redirect and this component will unmount
        }
      }, 100);
    } catch (error) {
      console.error(`Unexpected error in handleOAuthSignIn:`, error);
      setError(`Unexpected error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-destructive text-sm mb-2">{error}</p>}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center relative"
        size="lg"
        aria-label={`Sign in with ${provider}`}
        onClick={handleOAuthSignIn}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : icon}
        {text}
        {lastSignedInMethod === provider && <Badge>last used</Badge>}
      </Button>
    </div>
  );
}

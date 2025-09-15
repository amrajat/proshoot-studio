"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { useRouter, usePathname } from "next/navigation";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { useAccountContext } from "@/context/AccountContext";
import { toast } from "sonner";

// Enhanced security configuration
const MAX_ONE_TAP_ATTEMPTS = 3;
const ONE_TAP_LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Secure storage utility (same as login form)
const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify({ value, timestamp: Date.now() }));
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error("Secure storage set error:", error);
    }
  },
  getItem: (key, maxAge = SESSION_TIMEOUT) => {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      const { value, timestamp } = JSON.parse(atob(encrypted));
      if (Date.now() - timestamp > maxAge) {
        sessionStorage.removeItem(key);
        return null;
      }
      return value;
    } catch (error) {
      console.error("Secure storage get error:", error);
      return null;
    }
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Secure storage remove error:", error);
    }
  },
};

// Rate limiting for One Tap attempts
const rateLimiter = {
  attempts: new Map(),

  canAttempt: (clientId) => {
    const attempts = rateLimiter.attempts.get(clientId) || {
      count: 0,
      lastAttempt: 0,
    };
    const now = Date.now();

    if (now - attempts.lastAttempt > ONE_TAP_LOCKOUT_DURATION) {
      attempts.count = 0;
    }

    return attempts.count < MAX_ONE_TAP_ATTEMPTS;
  },

  recordAttempt: (clientId) => {
    const attempts = rateLimiter.attempts.get(clientId) || {
      count: 0,
      lastAttempt: 0,
    };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    rateLimiter.attempts.set(clientId, attempts);
  },

  isLocked: (clientId) => {
    const attempts = rateLimiter.attempts.get(clientId) || {
      count: 0,
      lastAttempt: 0,
    };
    const now = Date.now();

    if (now - attempts.lastAttempt > ONE_TAP_LOCKOUT_DURATION) {
      return false;
    }

    return attempts.count >= MAX_ONE_TAP_ATTEMPTS;
  },
};

// Input validation and sanitization
const validateRedirectUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  // Only allow internal redirects
  if (!url.startsWith("/")) return null;

  // Prevent protocol-relative URLs
  if (url.startsWith("//")) return null;

  // Sanitize and validate path
  try {
    const sanitized = url.replace(/[<>"']/g, "").trim();
    return sanitized.length > 0 && sanitized.length < 200 ? sanitized : null;
  } catch {
    return null;
  }
};

// Environment variable validation
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (
  !GOOGLE_CLIENT_ID ||
  GOOGLE_CLIENT_ID === "your_google_client_id_here" ||
  GOOGLE_CLIENT_ID.length < 10
) {
  console.error(
    "[GoogleOneTap] Google Client ID not properly configured. Component will not render."
  );
}

const GoogleOneTapComponent = () => {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const { refreshContext } = useAccountContext();
  const gsiScriptLoaded = useRef(false);
  const gsiLibraryInitialized = useRef(false);
  const rawNonceRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const generateAndStoreNonceForGSI = async () => {
    const rawNonce = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
    );
    rawNonceRef.current = rawNonce;

    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(rawNonce);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedForGoogle = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashedForGoogle;
  };

  const handleSignInWithGoogle = useCallback(async (response) => {
    const clientId = `${navigator.userAgent}_${window.location.hostname}`;

    // Check rate limiting
    if (!rateLimiter.canAttempt(clientId)) {
      toast.error(
        "Too many sign-in attempts. Please try again in a few minutes."
      );
      return;
    }

    const searchParamsFromUrl = new URLSearchParams(window.location.search);
    const nextUrlFromQuery = validateRedirectUrl(
      searchParamsFromUrl.get("next")
    );

    if (!response || !response.credential) {
      console.error("[GoogleOneTap] Invalid credentials received");
      toast.error("Authentication failed. Please try again.");
      rateLimiter.recordAttempt(clientId);
      return;
    }

    const nonceForSupabase = rawNonceRef.current;

    if (!nonceForSupabase) {
      console.error("[GoogleOneTap] Missing nonce for authentication");
      toast.error("Security validation failed. Please refresh and try again.");
      rateLimiter.recordAttempt(clientId);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: nonceForSupabase,
      });

      if (error) {
        console.error("[GoogleOneTap] Supabase auth error:", {
          code: error.status,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        toast.error("Authentication failed. Please try again.");
        rateLimiter.recordAttempt(clientId);
        return;
      }

      if (data.session) {
        // Use secure storage instead of localStorage
        secureStorage.setItem("lastLoginMethod", "Google (One-Tap)");

        // Validate and sanitize redirect URLs
        const sessionRedirect = validateRedirectUrl(
          secureStorage.getItem("redirectToAfterLogin")
        );
        const finalRedirectPath = nextUrlFromQuery || sessionRedirect || "/";

        if (sessionRedirect) {
          secureStorage.removeItem("redirectToAfterLogin");
        }

        rawNonceRef.current = null;

        console.info("[GoogleOneTap] Authentication successful", {
          userId: data.user?.id,
          timestamp: new Date().toISOString(),
        });

        toast.success("Welcome back!");
        
        // Refresh account context to load user profile and organizations
        try {
          await refreshContext();
          console.info("[GoogleOneTap] Account context refreshed successfully");
        } catch (contextError) {
          console.error("[GoogleOneTap] Failed to refresh account context:", contextError);
          // Still proceed with navigation as auth was successful
        }
        
        router.push(finalRedirectPath);
        router.refresh();
      } else {
        console.error(
          "[GoogleOneTap] No session established after successful auth"
        );
        toast.error("Authentication incomplete. Please try again.");
        rateLimiter.recordAttempt(clientId);
      }
    } catch (error) {
      console.error("[GoogleOneTap] Unexpected error during authentication:", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      toast.error("Sign-in unavailable. Please try again later.");
      rateLimiter.recordAttempt(clientId);
    }
  }, [router, supabase.auth, refreshContext]);

  useEffect(() => {
    const clientId = `${navigator.userAgent}_${window.location.hostname}`;
    setIsLocked(rateLimiter.isLocked(clientId));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !gsiScriptLoaded.current || isLocked) {
      return;
    }

    let isMounted = true;

    const performGsiActions = async () => {
      if (
        !isMounted ||
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        return;
      }

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          console.error("[GoogleOneTap] Session check error:", sessionError);
          return;
        }

        if (sessionData && sessionData.session) {
          return; // User already authenticated
        }

        if (!gsiLibraryInitialized.current) {
          const hashedForGoogle = await generateAndStoreNonceForGSI();
          if (!isMounted || !hashedForGoogle || !rawNonceRef.current) {
            console.error("[GoogleOneTap] Failed to generate nonce");
            return;
          }

          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleSignInWithGoogle,
            nonce: hashedForGoogle,
            auto_select: true,
            itp_support: true,
            use_fedcm_for_prompt: true,
            prompt_parent_id: "google-one-tap-container",
          });
          if (isMounted) gsiLibraryInitialized.current = true;
        }

        if (gsiLibraryInitialized.current) {
          window.google.accounts.id.prompt((notification) => {
            if (!isMounted) return;

            // Log prompt status for debugging (non-verbose)
            if (notification.isNotDisplayed()) {
              console.info(
                "[GoogleOneTap] Prompt not displayed:",
                notification.getNotDisplayedReason()
              );
            } else if (notification.isSkippedMoment()) {
              console.info(
                "[GoogleOneTap] Prompt skipped:",
                notification.getSkippedReason()
              );
            }
          });
        }
      } catch (error) {
        console.error("[GoogleOneTap] Error in performGsiActions:", {
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    };

    performGsiActions();

    return () => {
      isMounted = false;
    };
  }, [
    pathname,
    forceUpdate,
    supabase,
    router,
    isLocked,
    handleSignInWithGoogle,
  ]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        id="google-gsi-client-script"
        onLoad={() => {
          if (!gsiScriptLoaded.current) {
            gsiScriptLoaded.current = true;
            setForceUpdate((c) => c + 1);
          }
        }}
        onError={(error) => {
          console.error(
            "[GoogleOneTap] Failed to load Google GSI script:",
            error
          );
        }}
      />
      <div
        id="google-one-tap-container"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10000 }}
      />
    </>
  );
};

export default GoogleOneTapComponent;

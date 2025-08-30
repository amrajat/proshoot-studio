"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter, usePathname } from "next/navigation";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";

const GoogleOneTapComponent = () => {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const gsiScriptLoaded = useRef(false);
  const gsiLibraryInitialized = useRef(false);
  const rawNonceRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(0);

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

  const handleSignInWithGoogle = async (response) => {
    const searchParamsFromUrl = new URLSearchParams(window.location.search);
    const nextUrlFromQuery = searchParamsFromUrl.get("next");

    if (!response || !response.credential) {
      alert(
        "Google One Tap did not return valid credentials. Please try again."
      );
      return;
    }

    const nonceForSupabase = rawNonceRef.current;

    if (!nonceForSupabase) {
      alert(
        "A critical security value (nonce) was missing. Please try refreshing the page or contact support if this persists."
      );
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: nonceForSupabase,
      });

      if (error) {
        alert(`Login Error: ${error.message}`);
        return;
      }

      if (data.session) {
        localStorage.setItem("lastLoginMethod", "Google (One-Tap)");

        const explicitNextRedirect =
          nextUrlFromQuery && nextUrlFromQuery.startsWith("/")
            ? nextUrlFromQuery
            : null;
        const sessionRedirect = sessionStorage.getItem("redirectToAfterLogin");
        const finalRedirectPath =
          explicitNextRedirect ||
          (sessionRedirect && sessionRedirect.startsWith("/")
            ? sessionRedirect
            : "/dashboard");

        if (sessionRedirect) {
          sessionStorage.removeItem("redirectToAfterLogin");
        }
        rawNonceRef.current = null;
        router.push(finalRedirectPath);
        router.refresh();
      } else {
        alert(
          "Login seemed successful with Google, but no session was established with our server. Please try again."
        );
      }
    } catch (error) {
      alert(
        "An unexpected error occurred during login. Please check the console for details."
      );
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !gsiScriptLoaded.current) {
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
        }

        if (sessionData && sessionData.session) {
          return;
        }

        if (!gsiLibraryInitialized.current) {
          const hashedForGoogle = await generateAndStoreNonceForGSI();
          if (!isMounted || !hashedForGoogle || !rawNonceRef.current) {
            return;
          }

          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
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
            // Optional: Could log minimalist prompt status here if needed for future, non-verbose debugging
            // e.g., if (notification.isNotDisplayed()) { console.info("[OneTap] Prompt not displayed:", notification.getNotDisplayedReason()); }
          });
        }
      } catch (e) {}
    };

    performGsiActions();

    return () => {
      isMounted = false;
    };
  }, [pathname, gsiScriptLoaded.current, forceUpdate, supabase, router]);

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
        onError={(e) => {}}
      />
      <div
        id="google-one-tap-container"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10000 }}
      />
    </>
  );
};

export default GoogleOneTapComponent;

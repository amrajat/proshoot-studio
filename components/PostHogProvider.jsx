/**
 * PostHog Provider
 * Production-ready setup for studio.proshoot.co
 * Features: Web Analytics, Session Replays, User Identification
 */

"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useIsClient } from "@/hooks/useIsClient";

export const PostHogProvider = ({ children }) => {
  const isClient = useIsClient();

  // Check if we're in development mode
  const isDevelopment =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"));

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    // Only initialize if we have the key
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/ps-data",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,

        // ============ PRODUCTION OPTIMIZATIONS ============
        person_profiles: "identified_only", // Only create profiles for identified users

        // ============ WEB ANALYTICS ============
        capture_pageview: false, // Manual pageview tracking for better control
        capture_pageleave: true, // Track when users leave pages
        capture_performance: true, // Web vitals & performance metrics

        // ============ SESSION REPLAYS ============
        session_recording: {
          maskAllInputs: true, // Privacy: mask all inputs by default
          maskAllImages: false, // Add this line to show images
          maskTextSelector: "[data-sensitive]", // Custom masking for sensitive elements
          maskInputOptions: {
            password: true,
            email: true,
            tel: true,
          },
          recordCrossOriginIframes: false, // Don't record iframes for privacy
          // Record canvas elements (for cropping previews)
          recordCanvas: true,
          // Inline stylesheets for proper rendering
          inlineStylesheet: true,
          // Collect fonts for proper text rendering
          collectFonts: true,
          // Sample canvas at lower rate to reduce data
          sampling: {
            canvas: 2, // fps for canvas recording
          },
        },

        // ============ PRODUCT ANALYTICS ============
        autocapture: {
          dom_event_allowlist: ["click", "submit", "change"],
          url_allowlist: ["studio.proshoot.co", "proshoot.co"], // Track both domains
          element_allowlist: ["button", "a"],
        },

        // ============ CROSS-DOMAIN TRACKING ============
        cross_subdomain_cookie: true, // Track users across proshoot.co and studio.proshoot.co
        persistence: "localStorage+cookie", // Persist data across sessions

        // ============ SECURITY & PRIVACY ============
        secure_cookie: true, // Use secure cookies in production
        respect_dnt: true, // Respect Do Not Track browser setting
        opt_out_capturing_by_default: false, // Users are opted in by default

        // ============ DISABLE IN DEVELOPMENT ============
        // Use loaded callback to opt out after initialization
        loaded: (posthogInstance) => {
          if (isDevelopment) {
            posthogInstance.opt_out_capturing();
            posthogInstance.set_config({ disable_session_recording: true });
          }
        },
      });

      // Add app site context to all events (only in production)
      if (!isDevelopment) {
        posthog.register({
          site_type: "app",
        });
      }
    }
  }, [isClient, isDevelopment]);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
};

const PostHogPageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }

      // Enhanced pageview tracking for app site
      posthog.capture("$pageview", {
        $current_url: url,
        $pathname: pathname,
        $search_params: search,
        page_type: getPageType(pathname),
        timestamp: new Date().toISOString(),
        // Device & Browser Context
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        device_type: getDeviceType(),
        // Performance Context
        connection_type: navigator?.connection?.effectiveType || "unknown",
        connection_downlink: navigator?.connection?.downlink || null,
      });
    }
  }, [pathname, searchParams, posthog, isClient]);

  return null;
};

// Helper function to determine page type for app site
const getPageType = (pathname) => {
  if (pathname === "/" || pathname === "/dashboard") return "dashboard_page";
  if (pathname === "/studio") return "studio_list_page";
  if (pathname === "/studio/create") return "studio_create_page";
  if (pathname.startsWith("/studio/")) return "studio_detail_page";
  if (pathname === "/billing" || pathname === "/buy") return "billing_page";
  if (pathname === "/backgrounds") return "backgrounds_page";
  if (pathname === "/clothing") return "clothing_page";
  if (pathname.startsWith("/settings")) return "settings_page";
  if (pathname.startsWith("/auth")) return "auth_page";
  if (pathname.startsWith("/accept-invite")) return "invite_page";
  return "app_page";
};

// Helper function to determine device type
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const SuspendedPostHogPageView = () => {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
};

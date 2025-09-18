// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: env.NODE_ENV === "production",
  tunnel: "/monitoring/api/envelope",

  // Reduce sampling rates to avoid rate limiting
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.5,
  replaysSessionSampleRate: 0.01,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Add error filtering to reduce noise
  beforeSend(event, hint) {
    // Don't send events in development
    if (env.NODE_ENV === "development") {
      return null;
    }

    const error = hint?.originalException;
    // Filter out known non-critical errors
    if (event.exception && event.exception.values) {
      const exceptionValue = event.exception.values[0]?.value || "";
      const exceptionType = event.exception.values[0]?.type || "";

      // Ignore Next.js redirect "errors" - these are not actual errors but part of Next.js routing
      if (exceptionType === "Error" && exceptionValue === "NEXT_REDIRECT") {
        return null;
      }

      // Rate limit related errors
      if (
        exceptionValue.includes("429") ||
        exceptionValue.includes("Too Many Requests")
      ) {
        console.warn("Sentry rate limit reached");
        return null;
      }

      // Ignore common network errors that are typically transient
      if (
        exceptionValue.includes("Failed to fetch") ||
        exceptionValue.includes("NetworkError") ||
        exceptionValue.includes("Network request failed") ||
        exceptionValue.includes("ChunkLoadError") ||
        exceptionValue.includes("Loading chunk") ||
        exceptionValue.includes("Loading CSS chunk") ||
        exceptionValue.includes("ResizeObserver loop") ||
        exceptionValue.includes("ResizeObserver loop limit exceeded") ||
        exceptionValue.includes("Script error") ||
        exceptionValue.includes("connection aborted")
      ) {
        return null;
      }
    }

    // Add user interaction data if available
    if (typeof window !== "undefined") {
      event.contexts = {
        ...event.contexts,
        browser: {
          ...event.contexts?.browser,
          userAgent: window.navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer,
        },
      };
    }

    return event;
  },

  // Configure integrations with optimized settings
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

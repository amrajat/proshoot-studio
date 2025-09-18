// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: env.NODE_ENV === "production",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.2,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Add error filtering to reduce noise
  beforeSend(event) {
    // Don't send events in development
    if (env.NODE_ENV === "development") {
      return null;
    }

    // Filter out known non-critical errors
    if (event.exception && event.exception.values) {
      const exceptionValue = event.exception.values[0]?.value || "";
      const exceptionType = event.exception.values[0]?.type || "";

      // Ignore Next.js redirect "errors" - these are not actual errors but part of Next.js routing
      if (exceptionType === "Error" && exceptionValue === "NEXT_REDIRECT") {
        return null;
      }

      // Ignore common network errors that are typically transient
      if (
        exceptionValue.includes("Failed to fetch") ||
        exceptionValue.includes("NetworkError") ||
        exceptionValue.includes("Network request failed")
      ) {
        return null;
      }
    }

    return event;
  },
});

// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: env.NODE_ENV === "production",

  // Adjust sampling rate to reduce noise while still capturing important errors
  tracesSampleRate: 0.2,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Add performance monitoring for server-side operations
  // This helps identify slow API routes and database queries
  enableTracing: true,

  // Add error filtering to reduce noise
  beforeSend(event, hint) {
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
        exceptionValue.includes("ECONNRESET") ||
        exceptionValue.includes("ETIMEDOUT") ||
        exceptionValue.includes("ENOTFOUND") ||
        exceptionValue.includes("socket hang up") ||
        exceptionValue.includes("getaddrinfo ENOTFOUND") ||
        exceptionValue.includes("connect ETIMEDOUT") ||
        exceptionValue.includes("ECONNREFUSED") ||
        exceptionValue.includes("EPIPE") ||
        exceptionValue.includes("EHOSTUNREACH") ||
        exceptionValue.includes(
          "Client network socket disconnected before secure TLS connection was established"
        )
      ) {
        return null;
      }
    }

    // Add request data if available from hint context
    // const req = hint?.extra?.request;
    // hint.
    // if (req) {
    //   event.contexts = {
    //     ...event.contexts,
    //     request: {
    //       url: req.url,
    //       method: req.method,
    //       headers: req.headers,
    //     },
    //   };
    // }

    return event;
  },

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});

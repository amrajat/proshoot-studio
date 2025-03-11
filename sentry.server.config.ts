// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://458f233d8eae5d8abea19d7344652a76@o4507332139089920.ingest.us.sentry.io/4507332141645824",
  enabled: process.env.NODE_ENV === "production",

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
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Filter out known non-critical errors
    if (event.exception && event.exception.values) {
      const exceptionValue = event.exception.values[0]?.value || "";

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

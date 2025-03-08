// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://458f233d8eae5d8abea19d7344652a76@o4507332139089920.ingest.us.sentry.io/4507332141645824",
  enabled: process.env.NODE_ENV === "production",

  // Adjust sampling rate to reduce noise while still capturing important errors
  tracesSampleRate: 0.2,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Increase replay capture rate for errors to help with debugging
  replaysOnErrorSampleRate: 1.0,

  // Reduce session replay sample rate to save resources
  replaysSessionSampleRate: 0.05,

  // Add error filtering to reduce noise
  beforeSend(event) {
    // Filter out known non-critical errors
    if (event.exception && event.exception.values) {
      const exceptionValue = event.exception.values[0]?.value || "";

      // Ignore common network errors that are typically transient
      if (
        exceptionValue.includes("Failed to fetch") ||
        exceptionValue.includes("NetworkError") ||
        exceptionValue.includes("Network request failed") ||
        exceptionValue.includes("ChunkLoadError")
      ) {
        return null;
      }
    }
    return event;
  },

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

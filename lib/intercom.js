"use client";

/**
 * Opens the Intercom messenger with optional pre-filled content
 * @param {Object} options - Options for opening Intercom
 * @param {string} options.message - Pre-filled message for the user
 * @param {Object} options.metadata - Additional metadata to include with the conversation
 * @returns {boolean} - Whether Intercom was successfully opened
 */
export function openIntercomMessenger(options = {}) {
  const { message, metadata = {} } = options;

  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (window.Intercom) {
      // If there's a message, use the 'showNewMessage' method
      if (message) {
        window.Intercom("showNewMessage", message);
      } else {
        // Otherwise just show the messenger
        window.Intercom("show");
      }

      // Add metadata if provided
      if (Object.keys(metadata).length > 0) {
        window.Intercom("update", {
          ...metadata,
        });
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error("Error opening Intercom messenger:", error);
    return false;
  }
}

/**
 * Tracks an error in Intercom
 * @param {Error} error - The error object
 * @param {string} errorId - The Sentry error ID if available
 * @param {string} context - Additional context about where the error occurred
 */
export function trackErrorInIntercom(error, errorId, context = "") {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.Intercom) {
      window.Intercom("trackEvent", "error_occurred", {
        error_message: error?.message || "Unknown error",
        error_name: error?.name,
        error_id: errorId,
        error_context: context,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error("Failed to track error in Intercom:", e);
  }
}

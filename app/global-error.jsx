"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { GeistSans } from "geist/font/sans";
import Error from "@/components/Error";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, MessageCircle } from "lucide-react";
import { openIntercomMessenger, trackErrorInIntercom } from "@/lib/intercom";

export default function GlobalError({ error }) {
  const [errorInfo, setErrorInfo] = useState({
    message: "An unexpected error occurred",
    details: null,
    errorId: null,
  });

  useEffect(() => {
    // Log the error to Sentry and get the event ID
    const eventId = Sentry.captureException(error);

    // Extract useful information from the error
    let errorMessage = "An unexpected error occurred";
    let errorDetails = null;

    if (error) {
      // Get the error message
      errorMessage = error.message || errorMessage;

      // For network errors, provide more helpful information
      if (error.name === "TypeError" && errorMessage.includes("fetch")) {
        errorDetails =
          "There seems to be a network issue. Please check your internet connection and try again.";
      } else if (error.name === "ChunkLoadError") {
        errorDetails =
          "Failed to load a part of the application. This might be due to a new deployment or network issues.";
      } else if (error.status === 404) {
        errorDetails = "The requested resource could not be found.";
      } else if (error.status === 403) {
        errorDetails = "You don't have permission to access this resource.";
      } else if (error.status === 401) {
        errorDetails = "You need to be logged in to access this resource.";
      } else if (error.status === 429) {
        errorDetails = "Too many requests. Please try again later.";
      } else if (error.status >= 500) {
        errorDetails = "There was a server error. Our team has been notified.";
      }
    }

    setErrorInfo({
      message: errorMessage,
      details: errorDetails,
      errorId: eventId,
    });

    // Track the error in Intercom
    trackErrorInIntercom(error, eventId, "Next.js global-error.jsx");
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    // Use the Intercom utility to open the messenger with error details
    openIntercomMessenger({
      message: `I encountered an error (ID: ${
        errorInfo.errorId || "unknown"
      }): ${errorInfo.message}`,
      metadata: {
        error_id: errorInfo.errorId,
        error_message: errorInfo.message,
        error_details: errorInfo.details,
        page_url: window.location.href,
      },
    });
  };

  return (
    <html lang="en">
      <body className={GeistSans.className + " antialiased"}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                We've been notified and are working to fix the issue.
                {errorInfo.errorId && (
                  <span className="block mt-1 text-xs text-gray-500">
                    Reference ID: {errorInfo.errorId}
                  </span>
                )}
              </p>
            </div>

            <Error message={errorInfo.message} details={errorInfo.details} />

            <div className="flex justify-center flex-wrap gap-3 mt-6">
              <Button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center px-4 py-2"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh page
              </Button>

              <Button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center px-4 py-2"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to homepage
              </Button>

              <Button
                onClick={handleContactSupport}
                className="inline-flex items-center justify-center px-4 py-2"
                variant="outline"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact support
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

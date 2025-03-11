"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import Error from "@/components/Error";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, MessageCircle } from "lucide-react";
import { openIntercomMessenger, trackErrorInIntercom } from "@/lib/intercom";

export default function ErrorBoundary({ error, reset }) {
  const [errorInfo, setErrorInfo] = useState({
    message: "Something went wrong",
    details: null,
    errorId: null,
  });

  useEffect(() => {
    // Log the error to Sentry and get the event ID
    const eventId = Sentry.captureException(error);

    // Extract useful information from the error
    let errorMessage = "Something went wrong";
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
    trackErrorInIntercom(error, eventId, "Next.js error.js");
  }, [error]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Error
          message={errorInfo.message}
          details={errorInfo.details}
          onRetry={reset}
          retryLabel="Try again"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={reset}
            className="flex items-center"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Button
            onClick={() => window.location.reload()}
            className="flex items-center"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh page
          </Button>

          <Button
            onClick={handleContactSupport}
            className="flex items-center"
            variant="default"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact support
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            className="flex items-center"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to dashboard
          </Button>
        </div>

        {errorInfo.errorId && (
          <p className="mt-4 text-xs text-gray-500">
            Error reference: {errorInfo.errorId}
          </p>
        )}
      </div>
    </div>
  );
}

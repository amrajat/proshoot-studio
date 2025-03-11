"use client";

import { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Error from "@/components/Error";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageCircle, Home } from "lucide-react";
import { openIntercomMessenger, trackErrorInIntercom } from "@/lib/intercom";

export default function ErrorBoundary({
  children,
  fallback,
  onReset,
  showReset = true,
  showContact = true,
  showHome = false,
}) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState({
    message: "Something went wrong",
    details: null,
    errorId: null,
  });

  useEffect(() => {
    if (error) {
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
          errorDetails =
            "There was a server error. Our team has been notified.";
        }
      }

      setErrorInfo({
        message: errorMessage,
        details: errorDetails,
        errorId: eventId,
      });

      // Track the error in Intercom
      trackErrorInIntercom(error, eventId, "ErrorBoundary component");
    }
  }, [error]);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    if (onReset) {
      onReset();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
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

  const handleGoHome = () => {
    window.location.href = "/";
  };

  // This will catch errors in the component tree
  const componentDidCatch = (error, errorInfo) => {
    setHasError(true);
    setError(error);

    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack:
            errorInfo?.componentStack || "No component stack available",
        },
      },
    });
  };

  if (hasError) {
    // You can render any custom fallback UI
    return (
      fallback || (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Error
              message={errorInfo.message}
              details={errorInfo.details}
              onRetry={handleReset}
              retryLabel="Try again"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              {showReset && (
                <Button
                  onClick={handleReset}
                  className="flex items-center"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              )}

              <Button
                onClick={handleRefresh}
                className="flex items-center"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh page
              </Button>

              {showContact && (
                <Button
                  onClick={handleContactSupport}
                  className="flex items-center"
                  variant="outline"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact support
                </Button>
              )}

              {showHome && (
                <Button
                  onClick={handleGoHome}
                  className="flex items-center"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to homepage
                </Button>
              )}
            </div>

            {errorInfo.errorId && (
              <p className="mt-4 text-xs text-gray-500">
                Error reference: {errorInfo.errorId}
              </p>
            )}
          </div>
        </div>
      )
    );
  }

  try {
    return children;
  } catch (error) {
    componentDidCatch(error, { componentStack: error.stack });
    return null;
  }
}

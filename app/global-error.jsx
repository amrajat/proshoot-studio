"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { GeistSans } from "geist/font/sans";
import Error from "@/components/Error";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

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
      }
    }

    setErrorInfo({
      message: errorMessage,
      details: errorDetails,
      errorId: eventId,
    });
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
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

            <div className="flex justify-center space-x-4 mt-6">
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
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

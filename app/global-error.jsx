"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { GeistSans } from "geist/font/sans";
import Error from "@/components/Error";

export default function GlobalError({ error }) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

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
              </p>
            </div>
            <Error message={"An unexpected error occurred"} />
            <div className="text-center">
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to homepage
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

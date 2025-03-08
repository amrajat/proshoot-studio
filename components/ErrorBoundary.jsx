"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";
import Error from "@/components/Error";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to Sentry
    const errorId = Sentry.captureException(error);

    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({
      errorInfo,
      errorId,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorId } = this.state;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return React.cloneElement(fallback, {
          error,
          reset: this.resetError,
          errorId,
        });
      }

      // Default fallback UI
      return (
        <div className="p-4">
          <Error
            message={error?.message || "Something went wrong"}
            details="The application encountered an unexpected error. We've been notified and are working to fix the issue."
            onRetry={this.resetError}
          />
          {errorId && (
            <p className="mt-2 text-xs text-gray-500">
              Error reference: {errorId}
            </p>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

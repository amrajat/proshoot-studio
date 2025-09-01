/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 * Includes production-ready error monitoring with Sentry integration
 */

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Production-ready error monitoring and reporting
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    try {
      // 1. Sentry Error Reporting
      Sentry.withScope((scope) => {
        // Add contextual information
        scope.setTag("errorBoundary", true);
        scope.setTag("component", this.props.componentName || "Unknown");
        scope.setLevel("error");
        
        // Add error boundary specific context
        scope.setContext("errorBoundary", {
          componentStack: errorInfo.componentStack,
          errorBoundaryProps: {
            ...this.props,
            children: undefined, // Don't serialize children
          },
        });

        // Add user context if available
        if (this.props.userId) {
          scope.setUser({ id: this.props.userId });
        }

        // Add breadcrumbs for better debugging
        Sentry.addBreadcrumb({
          message: "Error Boundary Triggered",
          category: "error-boundary",
          level: "error",
          data: {
            errorMessage: error.message,
            componentName: this.props.componentName,
          },
        });

        // Capture the exception
        Sentry.captureException(error);
      });

      // 2. Custom Analytics (if you have analytics service)
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "exception", {
          description: error.message,
          fatal: false,
          custom_map: {
            component: this.props.componentName || "ErrorBoundary",
            stack: error.stack?.substring(0, 500), // Truncate for analytics
          },
        });
      }

      // 3. Console logging for development
      if (process.env.NODE_ENV === "development") {
        console.group("🚨 Error Boundary Details");
        console.error("Error:", error);
        console.error("Error Info:", errorInfo);
        console.error("Component Stack:", errorInfo.componentStack);
        console.error("Props:", this.props);
        console.groupEnd();
      }

    } catch (reportingError) {
      // Don't let error reporting break the error boundary
      console.error("Error reporting failed:", reportingError);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showDetails = false } = this.props;

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred while loading this page. Please
                  try again or contact support if the problem persists.
                </AlertDescription>
              </Alert>

              {/* Show error details in development */}
              {showDetails &&
                process.env.NODE_ENV === "development" &&
                this.state.error && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium text-destructive mb-2">
                      Error Details (Development Only):
                    </p>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="default"
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Studio Create Page
 * Production-ready studio creation with modular architecture
 */

"use client";

import React from "react";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import StudioCreateWizard from "../../components/studio/create/StudioCreateWizard";
import StudioFormProvider from "../../components/studio/create/forms/StudioFormProvider";

/**
 * Studio Create Page Component
 * Provides the layout and error boundary for studio creation
 */
export default function StudioCreatePage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create Studio</h1>
          <p className="text-muted-foreground">
            Set up your studio by selecting a plan, entering details, choosing
            styles, and uploading photos.
          </p>
        </div>

        {/* Wizard */}
        <StudioFormProvider>
          <StudioCreateWizard />
        </StudioFormProvider>
      </div>
    </ErrorBoundary>
  );
}

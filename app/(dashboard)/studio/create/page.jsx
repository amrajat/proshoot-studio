/**
 * Studio Create Page
 * Production-ready studio creation with modular architecture
 */

"use client";

import React from "react";
import ErrorBoundary from "@/components/shared/error-boundary";
import StudioCreateWizard from "@/components/studio/create/studio-create-wizard";
import StudioFormProvider from "@/components/studio/create/studio-form-provider";

/**
 * Studio Create Page Component
 * Provides the layout and error boundary for studio creation
 */
export default function StudioCreatePage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <StudioFormProvider>
          <StudioCreateWizard />
        </StudioFormProvider>
      </div>
    </ErrorBoundary>
  );
}

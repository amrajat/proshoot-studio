/**
 * Studio Create Page
 * Production-ready studio creation with modular architecture
 */

"use client";

import React from "react";
import { ContentLayout } from "../../components/sidebar/content-layout";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import StudioCreateWizard from "../../components/studio/create/StudioCreateWizard";
import StudioFormProvider from "../../components/studio/create/forms/StudioFormProvider";

/**
 * Studio Create Page Component
 * Provides the layout and error boundary for studio creation
 */
export default function StudioCreatePage() {
  return (
    <ContentLayout title="Create AI Studio">
      <ErrorBoundary>
        <StudioFormProvider>
          <StudioCreateWizard />
        </StudioFormProvider>
      </ErrorBoundary>
    </ContentLayout>
  );
}

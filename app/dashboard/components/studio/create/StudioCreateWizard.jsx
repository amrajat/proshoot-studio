/**
 * Studio Create Wizard
 * Main orchestrator component for the studio creation process
 */

"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountContext } from "@/context/AccountContext";
import useStudioCreateStore from "@/stores/studioCreateStore";

// Components
import ErrorBoundary from "../../ui/ErrorBoundary";
import { PageLoading } from "../../ui/LoadingStates";
import HeaderStepNavigation from "./HeaderStepNavigation";
import { useStudioForm } from "./forms/StudioFormProvider";

// Step Components
import PlanSelectionStep from "./steps/PlanSelectionStep";
import ImageUploadStep from "./steps/ImageUploadStep";
import StylePairingStep from "./steps/StylePairingStep";
import AttributesStep from "./steps/AttributesStep";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Constants
import {
  GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS as GLOBAL_ALL_BACKGROUND_OPTIONS,
} from "@/app/utils/styleOptions";

const StudioCreateWizard = () => {
  const router = useRouter();
  const { userId, selectedContext, userEmail } = useAccountContext();

  // Store state
  const {
    // Form data
    formData,

    // UI state
    currentStep,
    isSubmitting,
    errors,
    studioMessage,

    // Credits state
    credits,
    creditsLoading,
    creditsError,

    // Organization state
    orgApprovedClothing,
    orgApprovedBackgrounds,
    isOrgSettingsLoading,
    orgSettingsError,

    // Actions
    fetchCredits,
    fetchOrgSettings,
    setCurrentStep,
    setErrors,
    resetStore,
    resetFormCompletely,
    checkAndHandleContextChange,
    updateFormField,
  } = useStudioCreateStore();
  const { isStepValid } = useStudioForm();

  // Determine if we're in organization context with team credits
  const isOrgWithTeamCredits = useMemo(() => {
    return selectedContext?.type === "organization" && (credits?.team || 0) > 0;
  }, [selectedContext, credits]);

  // Get clothing and background options based on context
  const clothingOptions = useMemo(() => {
    const isOrgContext = selectedContext?.type === "organization";
    if (
      isOrgContext &&
      Array.isArray(orgApprovedClothing) &&
      orgApprovedClothing.length > 0
    ) {
      return orgApprovedClothing;
    }
    return GLOBAL_ALL_CLOTHING_OPTIONS || [];
  }, [selectedContext, orgApprovedClothing]);

  const backgroundOptions = useMemo(() => {
    const isOrgContext = selectedContext?.type === "organization";
    if (
      isOrgContext &&
      Array.isArray(orgApprovedBackgrounds) &&
      orgApprovedBackgrounds.length > 0
    ) {
      return orgApprovedBackgrounds;
    }
    return GLOBAL_ALL_BACKGROUND_OPTIONS || [];
  }, [selectedContext, orgApprovedBackgrounds]);

  // Define wizard steps
  const steps = useMemo(() => {
    const allSteps = [
      {
        id: "plan-selection",
        component: "PlanSelectionStep",
        title: "Plan",
        showInOrg: false, // Hidden for orgs with team credits
      },
      {
        id: "attributes",
        component: "AttributesStep",
        title: "Attributes",
        showInOrg: true,
      },
      {
        id: "style-pairing",
        component: "StylePairingStep",
        title: "Styles",
        showInOrg: true,
      },
      {
        id: "image-upload",
        component: "ImageUploadStep",
        title: "Create",
        showInOrg: true,
      },
    ];

    // Filter steps based on context
    const filteredSteps = allSteps.filter((step) => {
      // For organizations with team credits, skip plan selection
      if (isOrgWithTeamCredits && step.component === "PlanSelectionStep") {
        return false;
      }
      return step.showInOrg || selectedContext?.type === "personal";
    });

    return filteredSteps.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
      isActive: index === currentStep,
      isCompleted: index < currentStep,
    }));
  }, [selectedContext, isOrgWithTeamCredits, currentStep]);

  // Initialize data on mount
  useEffect(() => {
    if (userId) {
      fetchCredits(userId);
    }
  }, [userId, fetchCredits]);

  useEffect(() => {
    if (selectedContext?.type === "organization" && selectedContext.id) {
      fetchOrgSettings(selectedContext.id);
    }
  }, [selectedContext, fetchOrgSettings]);

  // Handle context changes - reset form and step when context changes
  useEffect(() => {
    if (selectedContext) {
      const contextId = selectedContext.id;
      const contextType = selectedContext.type;

      // Check if context changed and handle reset if needed
      const wasReset = checkAndHandleContextChange(contextId, contextType);

      if (wasReset) {
        // Optionally show a message to user about the reset
        // setStudioMessage("Form reset due to account context change");
      }
    }
  }, [selectedContext, checkAndHandleContextChange]);

  // Handle organization account logic
  useEffect(() => {
    // Only run when we have both organization context AND credits are loaded
    if (
      selectedContext?.type === "organization" &&
      credits !== null &&
      !creditsLoading
    ) {
      // Check if user has team credits
      const hasTeamCredits = credits?.team > 0;

      if (hasTeamCredits) {
        // Auto-select team plan and skip to next step
        if (!formData.plan || formData.plan !== "team") {
          updateFormField("plan", "team");
        }
        // Since PlanSelectionStep is filtered out for orgs, we don't need to change step
        // The user will automatically be on AttributesStep (which becomes step 0)
      } else {
        // Redirect to buy page if no team credits
        router.push("/dashboard/buy");
        return;
      }
    } else if (selectedContext?.type === "organization") {
    }
  }, [
    selectedContext,
    credits,
    creditsLoading,
    formData.plan,
    currentStep,
    updateFormField,
    setCurrentStep,
    router,
  ]);

  // Reset store when component unmounts or context changes significantly
  useEffect(() => {
    return () => {
      // Only reset if we're navigating away from the create flow
      if (!window.location.pathname.includes("/studio/create")) {
        resetStore();
      }
    };
  }, [resetStore]);

  // Render current step component
  const renderCurrentStep = useCallback(() => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    const commonProps = {
      formData,
      errors,
      isSubmitting,
      clothingOptions,
      backgroundOptions,
      credits,
      isOrgWithTeamCredits,
      selectedContext,
      accountContext: selectedContext,
    };

    switch (currentStepData.component) {
      case "PlanSelectionStep":
        return <PlanSelectionStep {...commonProps} />;
      case "AttributesStep":
        return <AttributesStep {...commonProps} />;
      case "StylePairingStep":
        return <StylePairingStep {...commonProps} />;
      case "ImageUploadStep":
        return <ImageUploadStep {...commonProps} />;
      default:
        return null;
    }
  }, [
    currentStep,
    steps,
    formData,
    errors,
    isSubmitting,
    clothingOptions,
    backgroundOptions,
    credits,
    isOrgWithTeamCredits,
    selectedContext,
  ]);

  // Loading state
  if (creditsLoading || isOrgSettingsLoading) {
    return <PageLoading message="Initializing studio creation..." />;
  }

  // Error states
  if (creditsError || orgSettingsError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {creditsError || orgSettingsError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Step Progress */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <HeaderStepNavigation
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              disabled={isSubmitting}
              isStepValid={isStepValid}
            />
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            {studioMessage && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{studioMessage}</AlertDescription>
              </Alert>
            )}

            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default StudioCreateWizard;

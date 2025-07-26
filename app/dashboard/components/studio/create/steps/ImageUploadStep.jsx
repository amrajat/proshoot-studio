/**
 * Image Upload Step Component
 * Handles image upload and studio naming
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  Image as ImageIcon,
  ChevronLeft,
  Rocket,
  Info,
  Loader2,
} from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import { useStudioForm } from "../forms/StudioFormProvider";
import { createStudio } from "../../../actions/studio/createStudio";
import { createCheckoutUrl } from "@/app/dashboard/actions/checkout";
import { hasSufficientCredits } from "@/services/creditService";

const ImageUploadStep = ({
  formData,
  errors,
  credits,
  isOrgWithTeamCredits,
  selectedContext,
}) => {
  const router = useRouter();
  const {
    updateFormField,
    prevStep,
    setErrors,
    setIsSubmitting,
    setStudioMessage,
    resetStore,
  } = useStudioCreateStore();
  const { validateCurrentStep } = useStudioForm();
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setLocalSubmitting] = useState(false);

  const handleCreateStudio = async () => {
    // First, validate all previous steps
    const isFormValid = await validateAllSteps();
    if (!isFormValid) {
      setErrors({
        general: "Please complete all required fields in previous steps",
      });
      return;
    }

    // Validate current step (images)
    const isCurrentStepValid = await validateCurrentStep();
    if (!isCurrentStepValid) {
      return;
    }

    const newErrors = {};

    if (!formData.images || formData.images.length < 10) {
      newErrors.images = "Please upload at least 10 images";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLocalSubmitting(true);
    setIsSubmitting(true);

    try {
      const contextType = selectedContext?.type || "personal";
      const selectedPlan = formData.plan;

      // Check if user has credits for the selected plan
      const hasCredits = hasSufficientCredits(credits, selectedPlan, 1);

      // For personal accounts without credits, redirect to payment
      if (contextType === "personal" && !hasCredits) {
        await handlePaymentFlow(selectedPlan);
        return;
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        contextType: selectedContext?.type || "personal",
        contextId:
          selectedContext?.type === "organization" ? selectedContext.id : null,
        useTeamCredits: isOrgWithTeamCredits,
      };

      const result = await createStudio(submissionData);

      if (result.success) {
        setStudioMessage("Studio created successfully! Redirecting...");
        resetStore();
        router.push(`/dashboard/studio/${result.studioId}`);
      } else {
        throw new Error(result.error || "Failed to create studio");
      }
    } catch (error) {
      setStudioMessage(`Error: ${error.message}`);
    } finally {
      setLocalSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Validate all previous steps
  const validateAllSteps = async () => {
    const stepValidations = [
      // Plan Selection
      formData.plan && formData.plan.length > 0,
      // Attributes
      formData.studioName &&
        formData.studioName.length > 0 &&
        formData.gender &&
        formData.gender.length > 0 &&
        formData.age &&
        formData.age.length > 0 &&
        formData.ethnicity &&
        formData.ethnicity.length > 0 &&
        formData.hairLength &&
        formData.hairLength.length > 0 &&
        formData.hairColor &&
        formData.hairColor.length > 0 &&
        formData.hairType &&
        formData.hairType.length > 0 &&
        formData.eyeColor &&
        formData.eyeColor.length > 0 &&
        formData.glasses &&
        formData.glasses.length > 0 &&
        formData.bodyType &&
        formData.bodyType.length > 0 &&
        formData.height &&
        formData.height.length > 0 &&
        formData.weight &&
        formData.weight.length > 0,
      // Style Pairing
      formData.style_pairs && formData.style_pairs.length > 0,
    ];

    const invalidSteps = [];
    if (!stepValidations[0]) invalidSteps.push("Plan Selection");
    if (!stepValidations[1]) invalidSteps.push("Personal Attributes");
    if (!stepValidations[2]) invalidSteps.push("Style Combinations");

    if (invalidSteps.length > 0) {
      setErrors({
        general: `Please complete the following steps: ${invalidSteps.join(
          ", "
        )}`,
      });
      return false;
    }

    return true;
  };

  const handlePaymentFlow = async (selectedPlan) => {
    try {
      // Get user info for checkout
      const userEmail = selectedContext?.email || "";
      const userId = selectedContext?.id || "";

      // Create checkout URL with form data as custom data
      const checkoutUrl = await createCheckoutUrl(
        selectedPlan,
        userId,
        userEmail,
        {
          studioFormData: formData,
          returnUrl: window.location.href,
        }
      );

      if (checkoutUrl) {
        // Redirect to checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout URL");
      }
    } catch (error) {
      setStudioMessage(`Payment error: ${error.message}`);
      setLocalSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Check if user has credits for the selected plan
  const hasCreditsForPlan = () => {
    const contextType = selectedContext?.type || "personal";
    const selectedPlan = formData.plan;

    if (contextType === "organization" && isOrgWithTeamCredits) {
      return true; // Organization with team credits
    }

    return hasSufficientCredits(credits, selectedPlan, 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          Upload Photos & Create Studio
        </h2>
        <p className="text-muted-foreground">
          Upload 10-25 high-quality photos and create your AI headshot studio
        </p>
      </div>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              For best results, upload clear photos with good lighting. Include
              variety in poses, expressions, and angles.
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : errors.images
                  ? "border-destructive"
                  : "border-muted-foreground/25"
              }
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              // Handle file drop logic here
            }}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              Drop your photos here or click to browse
            </h3>
            <p className="text-muted-foreground mb-4">
              Upload 10-25 photos (JPG, PNG up to 10MB each)
            </p>
            <Button variant="outline">Choose Files</Button>
          </div>

          {/* Current Images Count */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Images uploaded: {formData.images?.length || 0}/25
            </span>
            <span
              className={`font-medium ${
                (formData.images?.length || 0) >= 10
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {(formData.images?.length || 0) >= 10
                ? "✓ Minimum reached"
                : "Need at least 10"}
            </span>
          </div>

          {errors.images && (
            <Alert variant="destructive" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>{errors.images}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleCreateStudio}
          disabled={isSubmitting}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {hasCreditsForPlan() ? "Creating..." : "Processing Payment..."}
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              {hasCreditsForPlan() ? "Create Studio" : "Pay and Create"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadStep;

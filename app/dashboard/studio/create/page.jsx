"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { ContentLayout } from "../../components/sidebar/content-layout";
import { useAccountContext } from "@/context/AccountContext";
import { useCredits } from "@/hooks/useCredits";
import useDashboardStore from "@/stores/dashboardStore";
import useFormPersistence from "@/hooks/useFormPersistence";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { lemonsqueezy } from "@/config/lemonsqueezy";
import { generatePrompts } from "@/utils/prompts";
import {
  GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS as GLOBAL_ALL_BACKGROUND_OPTIONS,
} from "@/app/utils/styleOptions";
import {
  formSchema as baseFormSchema,
  GENDERS,
} from "../../components/studio/create/Variables";
import VariableSelector from "../../components/studio/create/VariableSelector";
import PlanSelector from "../../components/studio/create/PlanSelector";
import ImageUploader from "../../components/studio/create/ImageUploader";

import StylePairing from "../../components/studio/create/StylePairing";
import AttributeSelector from "../../components/studio/create/AttributeSelector";
import { createCheckoutUrl } from "../../actions/checkout";

export default function StudioCreate() {
  const router = useRouter();
  const { userId, selectedContext, userEmail } = useAccountContext();

  // ONLY fetch personal credits. This is the single source of truth for the user.
  const {
    credits: userCredits,
    isLoading: isCreditsLoading,
    error: creditsError,
  } = useCredits(userId);

  console.log("userCredits", userCredits);

  // Determine if we're in organization context AND the user has team credits on their personal account.
  const isOrgWithTeamCredits = useMemo(() => {
    return selectedContext?.type === "organization" && userCredits?.team > 0;
  }, [selectedContext, userCredits]);

  // Better naming convention for localStorage keys
  const getStepStorageKey = () => {
    const contextType = selectedContext?.type || "personal";
    const hasTeamCredits = isOrgWithTeamCredits ? "team" : "individual";
    return `headsshot_studio_step_${contextType}_${hasTeamCredits}`;
  };

  const getFormStorageKey = () => {
    const contextType = selectedContext?.type || "personal";
    const hasTeamCredits = isOrgWithTeamCredits ? "team" : "individual";
    return `headsshot_studio_form_${contextType}_${hasTeamCredits}`;
  };

  const {
    currentStep,
    setCurrentStep,
    initializeStep,
    previousStep,
    setPreviousStep,
    shouldValidate,
    setShouldValidate,
    isSubmitting,
    setIsSubmitting,
    studioMessage,
    setStudioMessage,
    errorDetails,
    setErrorDetails,

    isBuyingPlan,
    setIsBuyingPlan,
    orgApprovedClothing,
    setOrgApprovedClothing,
    orgApprovedBackgrounds,
    setOrgApprovedBackgrounds,
    isOrgSettingsLoading,
    setIsOrgSettingsLoading,
    resetStudioForm,
  } = useDashboardStore();

  const clothingOptions = useMemo(() => {
    const isOrgContext = selectedContext?.type === "organization";
    // Only use org-approved clothes if they exist, otherwise use global
    if (
      isOrgContext &&
      Array.isArray(orgApprovedClothing) &&
      orgApprovedClothing.length > 0
    ) {
      return orgApprovedClothing;
    }
    // Fallback to global options, ensuring it's an array
    return GLOBAL_ALL_CLOTHING_OPTIONS || [];
  }, [selectedContext, orgApprovedClothing]);

  const backgroundOptions = useMemo(() => {
    const isOrgContext = selectedContext?.type === "organization";
    // Only use org-approved backgrounds if they exist, otherwise use global
    if (
      isOrgContext &&
      Array.isArray(orgApprovedBackgrounds) &&
      orgApprovedBackgrounds.length > 0
    ) {
      return orgApprovedBackgrounds;
    }
    // Fallback to global options, ensuring it's an array
    return Array.isArray(GLOBAL_ALL_BACKGROUND_OPTIONS)
      ? GLOBAL_ALL_BACKGROUND_OPTIONS
      : [];
  }, [selectedContext, orgApprovedBackgrounds]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState,
    clearErrors,
    setError,
    trigger,
    reset,
    getValues,
  } = useForm({
    mode: "onSubmit", // Only validate on form submission
    // Remove zodResolver to prevent premature validation of all fields
    // We'll handle validation manually per step
    defaultValues: {
      style_pairs: [],
      gender: "",
      age: "",
      ethnicity: "",
      hairLength: "",
      hairColor: "",
      hairType: "",
      eyeColor: "",
      glasses: "No",
      bodyType: "",
      height: "",
      weight: "",
      howDidYouHearAboutUs: "",
      images: "",
      studioName: "",
      plan: "",
    },
  });

  const { errors } = formState;

  // Watch all form values for the persistence hook.
  const watchedFormValues = watch();

  // Use form persistence hook for auto-saving with context-aware key.
  const { loadFormValues, clearFormValues } = useFormPersistence(
    getFormStorageKey(),
    watchedFormValues, // Pass all watched values to be saved.
    [JSON.stringify(watchedFormValues), selectedContext] // Use a stringified dependency for deep comparison.
  );

  // Load saved values on initial render and when context changes.
  useEffect(() => {
    const savedValues = loadFormValues();
    if (savedValues && Object.keys(savedValues).length > 0) {
      reset(savedValues, { keepDefaultValues: true });
    }
  }, [loadFormValues, reset, selectedContext]);

  const planConfig = lemonsqueezy.plans[watch("plan")];
  const stylesLimit = planConfig?.styles || 0;

  // Define all possible steps with metadata
  const allSteps = useMemo(
    () => [
      {
        id: "plan-selector",
        component: "PlanSelector",
        title: "Select Plan",
        data: [
          {
            title: "Please select your plan.",
            subtitle:
              "You can see available plan credits below the name of plan name.",
            fieldName: "plan",
          },
          null,
        ],
        showInOrg: true, // Show in org context for auto-selection
      },
      {
        id: "gender-selector",
        component: "VariableSelector",
        title: "Select Gender",
        data: GENDERS,
        showInOrg: true,
      },

      {
        id: "style-pairing",
        component: "StylePairing",
        title: "Style Pairing",
        showInOrg: true,
      },
      {
        id: "file-uploader",
        component: "ImageUploader",
        title: "Upload Images",
        showInOrg: true,
      },
      {
        id: "attributes-selector",
        component: "AttributeSelector",
        title: "Your Attributes",
        showInOrg: true,
      },
    ],
    []
  );

  // Filter and prepare steps based on context - simplified approach
  const steps = useMemo(() => {
    const filteredSteps = allSteps.filter((step) => {
      // For organizations with team credits, skip PlanSelector
      if (isOrgWithTeamCredits && step.component === "PlanSelector") {
        return false;
      }

      // Show all other steps for both personal and organization contexts
      return step.showInOrg || selectedContext?.type === "personal";
    });

    // Add step numbers for display
    const stepsWithNumbers = filteredSteps.map((step, index) => ({
      ...step,
      stepNumber: index,
      totalSteps: filteredSteps.length,
    }));

    return stepsWithNumbers;
  }, [allSteps, selectedContext?.type, isOrgWithTeamCredits]);

  const isInitialized = useRef(false);

  // Initialize step from localStorage on component mount, only once.
  useEffect(() => {
    // Ensure this runs only once and that context is available.
    if (isInitialized.current || !selectedContext) {
      return;
    }

    initializeStep(getStepStorageKey());
    isInitialized.current = true;
  }, [selectedContext, initializeStep]); // Stable dependencies

  // Auto-set plan to "Team" when in organization context with team credits
  useEffect(() => {
    if (isOrgWithTeamCredits) {
      setValue("plan", "Team", { shouldValidate: true });
    }
  }, [isOrgWithTeamCredits, setValue]);

  const supabase = createSupabaseBrowserClient();

  // Define the function to fetch organization-specific settings
  const fetchOrgStudioSettings = async () => {
    if (selectedContext?.type !== "organization" || !selectedContext.id) {
      setOrgApprovedClothing([]);
      setOrgApprovedBackgrounds([]);
      return;
    }

    setIsOrgSettingsLoading(true);
    try {
      const { data: orgSettings, error: orgError } = await supabase
        .from("organizations")
        .select(
          "restrict_clothing_options, approved_clothing, restrict_background_options, approved_backgrounds"
        )
        .eq("id", selectedContext.id)
        .single();

      if (orgError) {
        throw new Error(
          `Error fetching organization settings: ${orgError.message}`
        );
      }

      if (orgSettings) {
        // Handle clothing restrictions
        if (
          orgSettings.restrict_clothing_options &&
          orgSettings.approved_clothing?.length > 0
        ) {
          const approvedClothingIds = new Set(orgSettings.approved_clothing);
          const filteredClothing = GLOBAL_ALL_CLOTHING_OPTIONS.filter((item) =>
            approvedClothingIds.has(item.id)
          );
          setOrgApprovedClothing(filteredClothing);
        } else {
          setOrgApprovedClothing([]); // Clear if restrictions are off or no items are approved
        }

        // Handle background restrictions
        if (
          orgSettings.restrict_background_options &&
          orgSettings.approved_backgrounds?.length > 0
        ) {
          const approvedBackgroundIds = new Set(
            orgSettings.approved_backgrounds
          );
          const filteredBackgrounds = GLOBAL_ALL_BACKGROUND_OPTIONS.filter(
            (item) => approvedBackgroundIds.has(item.id)
          );
          setOrgApprovedBackgrounds(filteredBackgrounds);
        } else {
          setOrgApprovedBackgrounds([]); // Clear if restrictions are off or no items are approved
        }
      }
    } catch (error) {
      console.error(error.message);
      setErrorDetails(
        "Failed to load organization settings. Please refresh the page."
      );
      setOrgApprovedClothing([]);
      setOrgApprovedBackgrounds([]);
    } finally {
      setIsOrgSettingsLoading(false);
    }
  };

  // Effect to fetch organization settings when the context changes
  useEffect(() => {
    fetchOrgStudioSettings();
  }, [selectedContext?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && isSubmitting) {
        const contextType = selectedContext?.type;
        const hasTeamCredits = isOrgWithTeamCredits;

        // Use store method to clean up
        resetStudioForm(contextType, hasTeamCredits);

        // Also clear form storage
        const formStorageKey = getFormStorageKey();
        localStorage.removeItem(formStorageKey);
        localStorage.removeItem("formValues"); // Legacy cleanup
      }
    };
  }, [
    isSubmitting,
    selectedContext?.type,
    selectedContext?.id,
    isOrgWithTeamCredits,
    resetStudioForm,
  ]);

  // Get current step data safely
  const getCurrentStepData = () => {
    if (currentStep >= 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return null;
  };

  const currentStepData = getCurrentStepData();

  // Safely get current step values for display
  const getCurrentStepInfo = () => {
    if (!currentStepData || steps.length === 0) {
      return {
        isValid: false,
        stepNumber: 0,
        totalSteps: 0,
        title: "Loading...",
      };
    }

    return {
      isValid: true,
      stepNumber: currentStep + 1,
      totalSteps: steps.length,
      title: currentStepData.title || `Step ${currentStep + 1}`,
    };
  };

  const stepInfo = getCurrentStepInfo();

  // Main button disabled logic
  const getMainButtonDisabled = () => {
    if (isSubmitting || !stepInfo.isValid) return true;

    if (currentStep === steps.length - 1) {
      const imagesValue = getValues("images");
      return typeof imagesValue !== "string" || imagesValue.trim() === "";
    }

    return false;
  };

  const mainButtonDisabled = getMainButtonDisabled();

  // Credit check for buy plan flow
  const selectedPlanName = getValues("plan");
  const selectedPlanCredits = selectedPlanName
    ? userCredits?.[selectedPlanName.toLowerCase()]
    : 0;

  const shouldShowBuyPlan =
    selectedContext?.type === "personal" &&
    currentStep === steps.length - 3 &&
    selectedPlanName &&
    (!selectedPlanCredits || selectedPlanCredits < 1);

  // Render current step safely
  const renderCurrentStep = () => {
    if (!stepInfo.isValid || !currentStepData) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading step...</p>
        </div>
      );
    }

    return renderStep(currentStepData);
  };

  // Validation function for current step
  const validateCurrentStep = () => {
    if (!shouldValidate) return true;

    const currentStepData = getCurrentStepData();

    switch (currentStepData?.component) {
      case "VariableSelector":
        if (currentStepData.id === "gender-selector") {
          if (!watchedFormValues.gender) {
            setError("gender", {
              type: "manual",
              message: "Please select a gender.",
            });
            return false;
          }
          clearErrors("gender");
        }
        return true;

      case "StylePairing":
        if (
          !watchedFormValues.style_pairs ||
          watchedFormValues.style_pairs.length < 1
        ) {
          setError("style_pairs", {
            type: "manual",
            message: "Please create at least 1 style pair.",
          });
          return false;
        }
        if (watchedFormValues.style_pairs.length > stylesLimit) {
          setError("style_pairs", {
            type: "manual",
            message: `You can create up to ${stylesLimit} style pairs.`,
          });
          return false;
        }
        clearErrors("style_pairs");
        return true;

      case "ImageUploader":
        if (
          !watchedFormValues.images ||
          watchedFormValues.images.trim() === ""
        ) {
          setError("images", {
            type: "manual",
            message: "Please upload at least one image.",
          });
          return false;
        }
        clearErrors("images");
        return true;

      case "AttributeSelector":
        // Validate required fields for AttributeSelector
        let hasErrors = false;

        // Hair length is required
        if (!watchedFormValues.hairLength) {
          setError("hairLength", {
            type: "manual",
            message: "Please select your hair length.",
          });
          hasErrors = true;
        } else {
          clearErrors("hairLength");
        }

        // Glasses preference is required
        if (!watchedFormValues.glasses) {
          setError("glasses", {
            type: "manual",
            message: "Please choose your glass preference.",
          });
          hasErrors = true;
        } else {
          clearErrors("glasses");
        }

        // Studio name is required
        if (
          !watchedFormValues.studioName ||
          watchedFormValues.studioName.trim() === ""
        ) {
          setError("studioName", {
            type: "manual",
            message: "Please enter your studio name.",
          });
          hasErrors = true;
        } else {
          clearErrors("studioName");
        }

        // Hair color and type are required unless hair length is "Bald" or "Hisab"
        if (
          watchedFormValues.hairLength &&
          watchedFormValues.hairLength !== "Bald" &&
          watchedFormValues.hairLength !== "Hisab"
        ) {
          if (!watchedFormValues.hairColor) {
            setError("hairColor", {
              type: "manual",
              message: "Please select your hair color.",
            });
            hasErrors = true;
          } else {
            clearErrors("hairColor");
          }

          if (!watchedFormValues.hairType) {
            setError("hairType", {
              type: "manual",
              message: "Please select your hair type.",
            });
            hasErrors = true;
          } else {
            clearErrors("hairType");
          }
        } else {
          // Clear hair color and type errors if hair length is Bald or Hisab
          clearErrors("hairColor");
          clearErrors("hairType");
        }

        return !hasErrors;

      case "PlanSelector":
        if (isOrgWithTeamCredits) {
          return true; // No validation needed if using team credits
        }
        if (!watchedFormValues.plan) {
          setError("plan", {
            type: "manual",
            message: "Please select a plan to continue.",
          });
          return false;
        } else {
          clearErrors("plan");
        }
        break;

      default:
        return true;
    }
    return true;
  };

  const next = () => {
    setShouldValidate(true); // Enable validation for current step
    const isValid = validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep, selectedContext?.type, isOrgWithTeamCredits);
      setShouldValidate(false); // Disable validation for next step until user tries to proceed
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep, selectedContext?.type, isOrgWithTeamCredits);
      setShouldValidate(false);
    }
  };

  const handleReset = () => {
    try {
      const contextType = selectedContext?.type;
      const hasTeamCredits = isOrgWithTeamCredits;

      if (contextType === "organization") {
        const currentValues = getValues(); // Get all current form values
        const newValues = {
          ...currentValues, // Spread current values
        };

        // Reset all fields except for 'plan'
        Object.keys(newValues).forEach((key) => {
          if (key !== "plan") {
            newValues[key] = null; // Or set to a default value
          }
        });

        //  Reset the form with the updated values
        reset(newValues);

        // Also reset the current step to the beginning
        setCurrentStep(0);
        if (typeof window !== "undefined") {
          localStorage.setItem(getStepStorageKey(), "0");
        }
      } else {
        // Use store method to reset with storage cleanup for non-organization contexts
        resetStudioForm(contextType, hasTeamCredits);

        // Clear form values
        clearFormValues();
        reset();
      }
    } catch (error) {
      console.error("Reset error:", error);
      setStudioMessage("Error resetting form. Please refresh the page.");
    }
  };

  const onSubmit = async (data) => {
    console.log("onSubmit", data);
    const studio_id = uuidv4();
    try {
      setIsSubmitting(true);
      let sanitizedData;
      try {
        sanitizedData = baseFormSchema.parse(data);
        sanitizedData.glasses = sanitizedData.glasses === "Yes";
      } catch (error) {
        console.error("Form validation error:", error);
        setStudioMessage("Please check all required fields");
        setIsSubmitting(false);
        return;
      }

      // Form validation is handled by baseFormSchema.parse(data) above

      const characterDetails = {
        gender: sanitizedData.gender,
        age: sanitizedData.age,
        ethnicity: sanitizedData.ethnicity,
        hairStyle: sanitizedData.hairStyle,
        eyeColor: sanitizedData.eyeColor,
        glasses: sanitizedData.glasses,
      };

      const finalPrompts = generatePrompts(
        characterDetails,
        sanitizedData.style_pairs,
        stylesLimit
      );
      console.log("Final Prompts:", finalPrompts);

      if (!finalPrompts || finalPrompts.length === 0) {
        console.error("No prompts generated. Aborting submission.");
        setStudioMessage(
          "Could not generate image prompts based on selections. Please try different options or contact support."
        );
        setIsSubmitting(false);
        return;
      }
      sanitizedData.prompts = finalPrompts;

      sanitizedData.organization_id =
        selectedContext?.type === "organization" ? selectedContext.id : null;
      console.log("sanitizedData", sanitizedData);
      try {
        // const response = await fetch("/api/lora-training", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(sanitizedData),
        // });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 402) {
            setStudioMessage(
              "You don't have enough credits. Please purchase more credits to continue."
            );
          } else if (response.status === 401) {
            setStudioMessage("Your session has expired. Please log in again.");
          } else {
            throw new Error(
              errorData.message || `Server error: ${response.status}`
            );
          }
          setIsSubmitting(false);
          return;
        }

        const result = await response.json();

        const contextType = selectedContext?.type;
        const hasTeamCredits = isOrgWithTeamCredits;

        resetStudioForm(contextType, hasTeamCredits);

        const formStorageKey = getFormStorageKey();
        localStorage.removeItem(formStorageKey);
        localStorage.removeItem("formValues");

        setStudioMessage(result.message || "Studio created successfully!");
        router.push("/dashboard/studio/" + result.studioId);
      } catch (error) {
        setErrorDetails(error.message || "API request failed");
        setStudioMessage(
          "We couldn't create your studio. Please try again or contact our support team."
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorDetails(error.message || "Form submission failed");
      setStudioMessage(
        error instanceof z.ZodError
          ? "Please check all form fields"
          : "We could not create studio. Please contact our support team."
      );
      setIsSubmitting(false);
    }
  };

  const renderStep = (step) => {
    switch (step.component) {
      case "PlanSelector":
        return (
          <PlanSelector
            data={step.data}
            isPending={isCreditsLoading}
            credits={userCredits}
            isOrgContext={selectedContext?.type === "organization"}
            register={register}
            setValue={setValue}
            errors={errors}
            watch={watch}
            clearErrors={clearErrors}
            trigger={trigger}
            shouldValidate={shouldValidate}
          />
        );
      case "VariableSelector":
        return (
          <VariableSelector
            data={step.data}
            isSubmitting={isSubmitting}
            register={register}
            setValue={setValue}
            errors={errors}
            watch={watch}
            clearErrors={clearErrors}
            trigger={trigger}
            shouldValidate={shouldValidate}
          />
        );
      case "AttributeSelector":
        return (
          <AttributeSelector
            control={control}
            register={register}
            formState={formState}
            setValue={setValue}
            watch={watch}
            isSubmitting={isSubmitting}
          />
        );
      case "ImageUploader":
        return (
          <ImageUploader
            errors={errors}
            setValue={setValue}
            isSubmitting={isSubmitting}
            studioMessage={studioMessage}
            watch={watch}
          />
        );
      case "StylePairing":
        return (
          <Controller
            name="style_pairs"
            control={control}
            render={({ field }) => (
              <StylePairing
                {...field}
                max={stylesLimit}
                isSubmitting={isSubmitting}
                selectedGender={watchedFormValues.gender}
                clothingOptions={clothingOptions}
                backgroundOptions={backgroundOptions}
              />
            )}
          />
        );
      default:
        return null;
    }
  };

  const isPlanSelectorStep = currentStepData?.component === "PlanSelector";

  const handleBuyPlan = async () => {
    setIsBuyingPlan(true);
    try {
      const plan = getValues("plan");
      const checkoutUrl = await createCheckoutUrl(plan, userId, userEmail);
      router.push(checkoutUrl);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout. Please try again.");
      setIsBuyingPlan(false);
    }
  };

  useEffect(() => {
    console.log("Redirect effect triggered. Loading:", isCreditsLoading);
    if (isCreditsLoading) {
      return;
    }

    console.log(
      "Credits loaded. Context:",
      selectedContext,
      "Credits:",
      userCredits
    );

    const inOrgContext = selectedContext?.type === "organization";
    console.log("Is Org Context?", inOrgContext);

    // Per user request, redirection is only for organization account context
    if (inOrgContext) {
      if (!userCredits || userCredits.team === 0) {
        console.log("Redirecting: No team credits in organization context.");
        router.push("/dashboard/buy");
      } else {
        console.log(
          "Not redirecting: User has team credits in organization context."
        );
      }
    } else {
      console.log("Not redirecting: User is in personal context.");
    }
  }, [isCreditsLoading, userCredits, selectedContext, router]);

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      console.log("Form validation errors from React Hook Form:", errors);
    }
  }, [errors]);

  // Note: Removed automatic error clearing to prevent ImageUploader issues

  return (
    <ContentLayout navbar={false} title="Create Studio">
      {isCreditsLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading credits...</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            // Only submit if we're on the final step and user clicks submit
            if (currentStep === steps.length - 1) {
              handleSubmit(onSubmit)(e);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="max-w-7xl mx-auto mt-8"
          role="form"
          aria-label="Create AI Headshot Studio Form"
        >
          <>
            <div className="mb-6" role="main" aria-live="polite">
              {currentStepData ? (
                renderStep(currentStepData)
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading step...</p>
                </div>
              )}
            </div>

            <div
              className="flex justify-between items-center flex-wrap gap-2"
              role="navigation"
              aria-label="Form navigation"
            >
              <Button
                className="disabled:opacity-50"
                type="button"
                onClick={prev}
                disabled={currentStep === 0 || isSubmitting}
                aria-label={`Go to previous step. Currently on step ${
                  currentStep + 1
                } of ${steps.length}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (currentStep > 0 && !isSubmitting) {
                      prev();
                    }
                  }
                }}
              >
                <ChevronLeft strokeWidth={2} aria-hidden="true" />
                Previous
              </Button>

              {shouldShowBuyPlan ? (
                <Button
                  className="disabled:opacity-50"
                  type="button"
                  onClick={handleBuyPlan}
                  disabled={isBuyingPlan || !selectedPlanName}
                  aria-label={`Proceed to payment for ${selectedPlanName} plan`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!isBuyingPlan && selectedPlanName) {
                        handleBuyPlan();
                      }
                    }
                  }}
                >
                  {isBuyingPlan ? "Redirecting..." : `Proceed to Payment`}
                  <ChevronRight strokeWidth={2} aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  className="disabled:opacity-50"
                  type="button" // Always button to prevent form submission
                  onClick={
                    currentStep === steps.length - 1
                      ? handleSubmit(onSubmit) // This will handle validation and submission
                      : next
                  }
                  disabled={mainButtonDisabled}
                  aria-label={
                    currentStep === steps.length - 1
                      ? "Create your AI headshot studio"
                      : `Go to next step. Currently on step ${
                          currentStep + 1
                        } of ${steps.length}`
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!mainButtonDisabled) {
                        if (currentStep === steps.length - 1) {
                          handleSubmit(onSubmit)();
                        } else {
                          next();
                        }
                      }
                    }
                  }}
                >
                  {currentStep === steps.length - 1 ? "Create Studio" : "Next"}
                  <ChevronRight strokeWidth={2} aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                aria-label="Reset form and start over"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isSubmitting) {
                      handleReset();
                    }
                  }
                }}
              >
                <RotateCcw className="text-destructive" aria-hidden="true" />
                Start Over
              </Button>
            </div>
          </>
        </form>
      )}
    </ContentLayout>
  );
}

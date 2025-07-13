"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import { useAccountContext } from "@/context/AccountContext";
import { useCredits, hasPlanCredits } from "@/hooks/useCredits";
import useDashboardStore from "@/stores/dashboardStore";
import useFormPersistence from "@/hooks/useFormPersistence";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { lemonsqueezy } from "@/config/lemonsqueezy";
import { generatePrompts } from "@/utils/prompts";
import {
  ALL_CLOTHING_OPTIONS as GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS as GLOBAL_ALL_BACKGROUND_OPTIONS,
} from "@/app/utils/studioOptions";
import {
  formSchema as baseFormSchema,
  GENDERS,
} from "./components/Forms/Variables";
import VariableSelector from "./components/Forms/VariableSelector";
import PlanSelector from "./components/Forms/PlanSelector";
import ImageUploader from "./components/Forms/ImageUploader";
import ClothingSelector from "./components/Forms/ClothingSelector";
import BackgroundSelector from "./components/Forms/BackgroundSelector";
import AttributeSelector from "./components/Forms/AttributeSelector";
import { createCheckoutUrl } from "../_actions/checkout";

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
  }, [selectedContext?.type, userCredits?.team]);

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
    clothingError,
    setClothingError,
    backgroundsError,
    setBackgroundsError,
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

  // Load saved form values with context-aware key
  const savedFormValues = useFormPersistence(
    getFormStorageKey(),
    {},
    []
  ).loadFormValues();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState,
    clearErrors,
    trigger,
    reset,
    getValues,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(baseFormSchema),
    defaultValues: {
      clothing: savedFormValues.clothing || [],
      backgrounds: savedFormValues.backgrounds || [],
      gender: savedFormValues.gender || "",
      age: savedFormValues.age || "",
      ethnicity: savedFormValues.ethnicity || "",
      hairLength: savedFormValues.hairLength || "",
      hairColor: savedFormValues.hairColor || "",
      hairType: savedFormValues.hairType || "",
      eyeColor: savedFormValues.eyeColor || "",
      glasses: savedFormValues.glasses || "No",
      bodyType: savedFormValues.bodyType || "",
      height: savedFormValues.height || "",
      weight: savedFormValues.weight || "",
      howDidYouHearAboutUs: savedFormValues.howDidYouHearAboutUs || "",
      images: savedFormValues.images || "",
      studioName: savedFormValues.studioName || "",
      plan: savedFormValues.plan || "",
    },
  });

  const { errors } = formState;

  const formValuesFromWatch = watch();
  const selectedPlan = watch("plan");

  const watchedClothing = watch("clothing");
  const watchedBackgrounds = watch("backgrounds");
  const watchedGender = watch("gender");
  const watchedAge = watch("age");
  const watchedEthnicity = watch("ethnicity");
  const watchedHairLength = watch("hairLength");
  const watchedHairColor = watch("hairColor");
  const watchedHairType = watch("hairType");
  const watchedEyeColor = watch("eyeColor");
  const watchedGlasses = watch("glasses");
  const watchedBodyType = watch("bodyType");
  const watchedHeight = watch("height");
  const watchedWeight = watch("weight");
  const watchedHowDidYouHearAboutUs = watch("howDidYouHearAboutUs");
  const watchedImages = watch("images");
  const watchedStudioName = watch("studioName");

  // Use form persistence hook for auto-saving with context-aware key
  const formValues = getValues();
  const { saveFormValues, clearFormValues } = useFormPersistence(
    getFormStorageKey(),
    formValues,
    [
      selectedPlan,
      watchedClothing,
      watchedBackgrounds,
      watchedGender,
      watchedAge,
      watchedEthnicity,
      watchedHairLength,
      watchedHairColor,
      watchedHairType,
      watchedEyeColor,
      watchedGlasses,
      watchedBodyType,
      watchedHeight,
      watchedWeight,
      watchedHowDidYouHearAboutUs,
      watchedImages,
      watchedStudioName,
    ]
  );

  const planConfig = lemonsqueezy.plans[selectedPlan];
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
        id: "clothing-selector",
        component: "ClothingSelector",
        title: "Select Clothing",
        showInOrg: true,
      },
      {
        id: "background-selector",
        component: "BackgroundSelector",
        title: "Select Backgrounds",
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
    if (isOrgWithTeamCredits && selectedContext) {
      // Set the plan value since PlanSelector step is skipped
      setValue("plan", "Team", { shouldValidate: true });
    }
  }, [
    isOrgWithTeamCredits,
    setValue,
    selectedContext?.type,
    selectedContext?.id,
  ]);

  // Fetch organization settings
  useEffect(() => {
    if (selectedContext?.type === "organization" && selectedContext.id) {
      const supabase = createSupabaseBrowserClient();
      const fetchOrgStudioSettings = async () => {
        setIsOrgSettingsLoading(true);
        try {
          const { data: orgSettings, error: orgErr } = await supabase
            .from("organizations")
            .select("restrict_clothing_options, restrict_background_options")
            .eq("id", selectedContext.id)
            .single();

          if (orgErr) throw orgErr;

          if (orgSettings.restrict_clothing_options) {
            const { data: approvedClothing, error: clothingErr } =
              await supabase
                .from("organization_approved_clothing")
                .select("clothing_name, clothing_theme")
                .eq("organization_id", selectedContext.id);
            if (clothingErr) throw clothingErr;
            const clothingWithCorrectKeys = approvedClothing.map((item) => {
              const globalItem = GLOBAL_ALL_CLOTHING_OPTIONS.find(
                (gi) =>
                  gi.name === item.clothing_name &&
                  gi.theme === item.clothing_theme
              );
              return {
                name: item.clothing_name,
                theme: item.clothing_theme,
                image: globalItem?.image || "/placeholder.svg",
              };
            });
            setOrgApprovedClothing(clothingWithCorrectKeys);
          } else {
            setOrgApprovedClothing(null);
          }

          if (orgSettings.restrict_background_options) {
            const { data: approvedBackgrounds, error: backgroundsErr } =
              await supabase
                .from("organization_approved_backgrounds")
                .select("background_name, background_theme")
                .eq("organization_id", selectedContext.id);
            if (backgroundsErr) throw backgroundsErr;
            const backgroundsWithCorrectKeys = approvedBackgrounds.map(
              (item) => {
                const globalItem = GLOBAL_ALL_BACKGROUND_OPTIONS.find(
                  (gi) =>
                    gi.name === item.background_name &&
                    gi.theme === item.background_theme
                );
                return {
                  name: item.background_name,
                  theme: item.background_theme,
                  image: globalItem?.image || "/placeholder.svg",
                };
              }
            );
            setOrgApprovedBackgrounds(backgroundsWithCorrectKeys);
          } else {
            setOrgApprovedBackgrounds(null);
          }
        } catch (error) {
          console.error("Error fetching org studio settings:", error);
          setStudioMessage(
            "Error loading organization settings. Please try again."
          );
        } finally {
          setIsOrgSettingsLoading(false);
        }
      };
      fetchOrgStudioSettings();
    } else {
      // Clear if not in org context or no org id
      setOrgApprovedClothing(null);
      setOrgApprovedBackgrounds(null);
      setIsOrgSettingsLoading(false);
    }
  }, [
    selectedContext,
    setIsOrgSettingsLoading,
    setOrgApprovedClothing,
    setOrgApprovedBackgrounds,
    setStudioMessage,
  ]);

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
  const validateCurrentStep = async () => {
    if (!currentStepData) {
      console.error("No current step data available");
      return false;
    }

    try {
      switch (currentStepData.component) {
        case "ClothingSelector":
          if (!watchedClothing || watchedClothing.length < 1) {
            setClothingError("Please select at least 1 clothing option.");
            return false;
          }
          if (watchedClothing.length > stylesLimit) {
            setClothingError(
              `You can select up to ${stylesLimit} clothing options.`
            );
            return false;
          }
          setClothingError("");
          return true;

        case "BackgroundSelector":
          if (!watchedBackgrounds || watchedBackgrounds.length < 1) {
            setBackgroundsError("Please select at least 1 background.");
            return false;
          }
          if (watchedBackgrounds.length > stylesLimit) {
            setBackgroundsError(
              `You can select up to ${stylesLimit} backgrounds.`
            );
            return false;
          }
          setBackgroundsError("");
          return true;

        case "PlanSelector":
          if (isOrgWithTeamCredits) {
            setValue("plan", "Team", { shouldValidate: true });
            return true;
          }
          return await trigger(currentStepData.data[0].fieldName);

        case "VariableSelector":
          return await trigger(currentStepData.data[0].fieldName);

        case "ImageUploader":
          return await trigger("images");

        case "AttributeSelector":
          return await trigger([
            "age",
            "ethnicity",
            "hairLength",
            "hairColor",
            "hairType",
            "eyeColor",
            "glasses",
            "studioName",
          ]);

        default:
          return await trigger();
      }
    } catch (error) {
      console.error("Validation error:", error);
      setStudioMessage("Validation error occurred. Please try again.");
      return false;
    }
  };

  const next = async () => {
    if (!currentStepData) {
      console.error("Cannot navigate: no current step data");
      setStudioMessage("Navigation error. Please refresh the page.");
      return;
    }

    setShouldValidate(true);

    try {
      const isValid = await validateCurrentStep();

      if (!isValid) {
        return;
      }

      // Check credits before final step
      if (currentStep === steps.length - 2) {
        const plan = getValues("plan");
        const planCredits =
          selectedContext?.type === "organization"
            ? userCredits?.team // For org member, check team credits
            : userCredits?.[plan?.toLowerCase()]; // For personal, check plan credits

        if (plan && (!planCredits || planCredits < 1)) {
          setStudioMessage("You don't have enough credits for this plan.");
          return;
        }
      }

      if (currentStep < steps.length - 1) {
        setPreviousStep(currentStep);
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep, selectedContext?.type, isOrgWithTeamCredits);
        setShouldValidate(false);
      }
    } catch (error) {
      console.error("Navigation error in next():", error);
      setStudioMessage(
        "An error occurred during navigation. Please try again."
      );
      setShouldValidate(false);
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

      const isValid = await trigger();
      if (!isValid) {
        setStudioMessage("Please check all required fields");
        setIsSubmitting(false);
        return;
      }

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
        watchedClothing,
        watchedBackgrounds,
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
        const response = await fetch("/api/lora-training", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData),
        });

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
      case "ClothingSelector":
        return (
          <ClothingSelector
            value={watchedClothing || []}
            onChange={(newVal) => {
              setValue("clothing", newVal, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            max={stylesLimit}
            min={1}
            isSubmitting={isSubmitting || isOrgSettingsLoading}
            errors={clothingError}
            shouldValidate={shouldValidate}
            selectedGender={getValues("gender")}
            availableItems={
              selectedContext?.type === "organization"
                ? orgApprovedClothing
                : null
            }
          />
        );
      case "BackgroundSelector":
        return (
          <BackgroundSelector
            value={watchedBackgrounds || []}
            onChange={(newVal) => {
              setValue("backgrounds", newVal, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            max={stylesLimit}
            min={1}
            isSubmitting={isSubmitting || isOrgSettingsLoading}
            errors={backgroundsError}
            shouldValidate={shouldValidate}
            selectedGender={getValues("gender")}
            availableItems={
              selectedContext?.type === "organization"
                ? orgApprovedBackgrounds
                : null
            }
          />
        );
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

  return (
    <ContentLayout navbar={false} title="Create Studio">
      {isCreditsLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading credits...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
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
                  type={currentStep === steps.length - 1 ? "submit" : "button"}
                  onClick={currentStep === steps.length - 1 ? undefined : next}
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

"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import VariableSelector from "./components/Forms/VariableSelector";
import PlanSelector from "./components/Forms/PlanSelector";
import ImageUploader from "./components/Forms/ImageUploader";
import ClothingSelector from "./components/Forms/ClothingSelector";
import BackgroundSelector from "./components/Forms/BackgroundSelector";
import {
  formSchema,
  GENDERS,
  AGES,
  ETHNICITIES,
  HAIR_STYLES,
  EYE_COLORS,
  GLASSES,
  STUDIO_NAME_SELECTOR,
} from "./components/Forms/Variables";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import config from "@/config";
import { generatePrompts } from "@/utils/prompts"; // Adjust path if your utils folder is elsewhere
import {
  ALL_CLOTHING_OPTIONS as GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS as GLOBAL_ALL_BACKGROUND_OPTIONS,
} from "@/app/utils/studioOptions"; // Import global options

const FileUploader = ({
  register,
  errors,
  setValue,
  isSubmitting,
  studioMessage,
  watch,
}) => (
  <div>
    <input
      type="text"
      className="hidden"
      {...register("images", { required: "Please upload a file" })}
    />
    {errors.file && <p className="text-red-500 mt-2">{errors.file.message}</p>}
    <ImageUploader
      setValue={setValue}
      errors={errors}
      isSubmitting={isSubmitting}
      studioMessage={studioMessage}
      watch={watch}
    />
  </div>
);

export default function StudioCreate() {
  const router = useRouter();
  const { selectedContext, userId, isCurrentUserOrgAdmin } =
    useAccountContext();
  const [personalCredits, setPersonalCredits] = useState(null);
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const [organizationCredits, setOrganizationCredits] = useState(null);
  const [isOrgCreditsLoading, setIsOrgCreditsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("currentFormStep");
      return savedStep ? parseInt(savedStep, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentFormStep", currentStep.toString());
    }
  }, [currentStep]);

  const [previousStep, setPreviousStep] = useState(0);
  const [shouldValidate, setShouldValidate] = useState(false);
  const [studioMessage, setStudioMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isBuyingPlan, setIsBuyingPlan] = useState(false);

  const [orgApprovedClothing, setOrgApprovedClothing] = useState(null);
  const [orgApprovedBackgrounds, setOrgApprovedBackgrounds] = useState(null);
  const [isOrgSettingsLoading, setIsOrgSettingsLoading] = useState(false);

  const savedFormValuesString =
    typeof window !== "undefined" ? localStorage.getItem("formValues") : null;

  let parsedLocalStorageValues = {};
  if (savedFormValuesString) {
    try {
      parsedLocalStorageValues = JSON.parse(savedFormValuesString);
    } catch (e) {
      console.error("Error parsing formValues from localStorage:", e);
      parsedLocalStorageValues = {}; // Reset to empty if parsing fails
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
    trigger,
    reset,
    getValues,
    control,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      clothing:
        Array.isArray(parsedLocalStorageValues.clothing) &&
        parsedLocalStorageValues.clothing.every(
          (item) =>
            typeof item === "object" && "name" in item && "theme" in item
        )
          ? [...parsedLocalStorageValues.clothing]
          : [], // Default to empty array if localStorage data is invalid
      backgrounds:
        Array.isArray(parsedLocalStorageValues.backgrounds) &&
        parsedLocalStorageValues.backgrounds.every(
          (item) =>
            typeof item === "object" && "name" in item && "theme" in item
        )
          ? [...parsedLocalStorageValues.backgrounds]
          : [], // Default to empty array if localStorage data is invalid
      gender: parsedLocalStorageValues.gender || "",
      age: parsedLocalStorageValues.age || "",
      ethnicity: parsedLocalStorageValues.ethnicity || "",
      hairStyle: parsedLocalStorageValues.hairStyle || "",
      eyeColor: parsedLocalStorageValues.eyeColor || "",
      glasses: parsedLocalStorageValues.glasses || "No",
      images: parsedLocalStorageValues.images || "",
      studioName: parsedLocalStorageValues.studioName || "",
      plan: parsedLocalStorageValues.plan || "",
    },
  });

  const formValuesFromWatch = watch();
  const selectedPlan = watch("plan");

  const watchedClothing = watch("clothing");
  const watchedBackgrounds = watch("backgrounds");
  const watchedGender = watch("gender");
  const watchedAge = watch("age");
  const watchedEthnicity = watch("ethnicity");
  const watchedHairStyle = watch("hairStyle");
  const watchedEyeColor = watch("eyeColor");
  const watchedGlasses = watch("glasses");
  const watchedImages = watch("images");
  const watchedStudioName = watch("studioName");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentFormValues = getValues();

      // Ensure clothing and backgrounds are valid arrays of objects before saving
      const clothingToSave =
        Array.isArray(currentFormValues.clothing) &&
        currentFormValues.clothing.every(
          (item) =>
            typeof item === "object" && "name" in item && "theme" in item
        )
          ? currentFormValues.clothing
          : [];
      const backgroundsToSave =
        Array.isArray(currentFormValues.backgrounds) &&
        currentFormValues.backgrounds.every(
          (item) =>
            typeof item === "object" && "name" in item && "theme" in item
        )
          ? currentFormValues.backgrounds
          : [];

      const valuesToSave = {
        plan: currentFormValues.plan || "",
        clothing: clothingToSave,
        backgrounds: backgroundsToSave,
        gender: currentFormValues.gender || "",
        age: currentFormValues.age || "",
        ethnicity: currentFormValues.ethnicity || "",
        hairStyle: currentFormValues.hairStyle || "",
        eyeColor: currentFormValues.eyeColor || "",
        glasses: currentFormValues.glasses || "No",
        images: currentFormValues.images || "",
        studioName: currentFormValues.studioName || "",
      };
      localStorage.setItem("formValues", JSON.stringify(valuesToSave));
    }
  }, [
    selectedPlan,
    watchedClothing,
    watchedBackgrounds,
    watchedGender,
    watchedAge,
    watchedEthnicity,
    watchedHairStyle,
    watchedEyeColor,
    watchedGlasses,
    watchedImages,
    watchedStudioName,
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        if (isSubmitting) {
          localStorage.removeItem("formValues");
          localStorage.removeItem("currentFormStep");
        }
      }
    };
  }, [isSubmitting]);

  useEffect(() => {
    const fetchCredits = async () => {
      if (selectedContext?.type !== "personal" || !userId) {
        if (selectedContext?.type !== "organization") {
          setPersonalCredits(null);
        }
        setIsCreditsLoading(false);
        return;
      }
      setIsCreditsLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", userId)
        .is("organization_id", null)
        .maybeSingle();
      if (!error) setPersonalCredits(data);
      else console.error("Error fetching personal credits:", error);
      setIsCreditsLoading(false);
    };

    const fetchOrganizationCredits = async () => {
      if (selectedContext?.type !== "organization" || !selectedContext.id) {
        setOrganizationCredits(null);
        setIsOrgCreditsLoading(false);
        return;
      }
      setIsOrgCreditsLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("credits")
        .select("*")
        .eq("organization_id", selectedContext.id)
        .is("user_id", null)
        .maybeSingle();
      if (!error) setOrganizationCredits(data);
      else console.error("Error fetching organization credits:", error);
      setIsOrgCreditsLoading(false);
    };

    if (selectedContext?.type === "personal") {
      fetchCredits();
      setOrganizationCredits(null);
      setIsOrgCreditsLoading(false);
    } else if (selectedContext?.type === "organization") {
      fetchOrganizationCredits();
      setPersonalCredits(null);
      setIsCreditsLoading(false);
    } else {
      setPersonalCredits(null);
      setOrganizationCredits(null);
      setIsCreditsLoading(false);
      setIsOrgCreditsLoading(false);
    }
  }, [selectedContext, userId]);

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
          // Handle error (e.g., show a toast)
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
  }, [selectedContext]);

  const stylesLimit = selectedPlan
    ? config.PLANS[selectedPlan]?.styles || 0
    : 0;

  const steps = [
    {
      id: "Step 0",
      component: "PlanSelector",
      data: [
        {
          title: "Please select your plan.",
          subtitle:
            "You can see available plan credits below the name of plan name.",
          fieldName: "plan",
        },
        null,
      ],
    },
    {
      id: "Step 1",
      component: "ClothingSelector",
      // data: null,
    },
    {
      id: "Step 2",
      component: "BackgroundSelector",
      // data: null,
    },
    { id: "Step 3", component: "VariableSelector", data: GENDERS },
    { id: "Step 4", component: "VariableSelector", data: AGES },
    { id: "Step 5", component: "VariableSelector", data: ETHNICITIES },
    { id: "Step 6", component: "VariableSelector", data: HAIR_STYLES },
    { id: "Step 7", component: "VariableSelector", data: EYE_COLORS },
    { id: "Step 8", component: "VariableSelector", data: GLASSES },
    {
      id: "Step 9",
      component: "VariableSelector",
      data: STUDIO_NAME_SELECTOR,
    },
    { id: "Step 10", component: "FileUploader" },
  ];

  const [clothingError, setClothingError] = useState("");
  const [backgroundsError, setBackgroundsError] = useState("");

  const next = async () => {
    setShouldValidate(true);
    const currentStepData = steps[currentStep];
    let isValid = false;
    try {
      if (currentStepData.component === "ClothingSelector") {
        if (!watchedClothing || watchedClothing.length < 1) {
          setClothingError("Please select at least 1 clothing option.");
          return;
        }
        if (watchedClothing.length > stylesLimit) {
          setClothingError(
            `You can select up to ${stylesLimit} clothing options.`
          );
          return;
        }
        setClothingError("");
        isValid = true;
      } else if (currentStepData.component === "BackgroundSelector") {
        if (!watchedBackgrounds || watchedBackgrounds.length < 1) {
          setBackgroundsError("Please select at least 1 background.");
          return;
        }
        if (watchedBackgrounds.length > stylesLimit) {
          setBackgroundsError(
            `You can select up to ${stylesLimit} backgrounds.`
          );
          return;
        }
        setBackgroundsError("");
        isValid = true;
      } else if (currentStepData.component === "PlanSelector") {
        isValid = await trigger(currentStepData.data[0].fieldName);
      } else if (currentStepData.component === "VariableSelector") {
        isValid = await trigger(currentStepData.data[0].fieldName);
      } else if (currentStepData.component === "FileUploader") {
        const imagesValue = getValues("images");
        isValid = Boolean(imagesValue);
      } else {
        isValid = await trigger();
      }
      if (isValid && currentStep < steps.length - 1) {
        if (currentStep === steps.length - 2) {
          const plan = getValues("plan");
          const planCredits =
            selectedContext?.type === "organization"
              ? organizationCredits
              : personalCredits?.[plan?.toLowerCase()];
          if (plan && (!planCredits || planCredits < 1)) {
            return;
          }
        }
        setPreviousStep(currentStep);
        setCurrentStep((step) => step + 1);
        setShouldValidate(false);
      }
    } catch (error) {
      console.error("Validation error in next():", error);
      setShouldValidate(false);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
      setShouldValidate(false);
    }
  };

  const onSubmit = async (data) => {
    console.log("onSubmit", data);
    try {
      setIsSubmitting(true);
      let sanitizedData;
      try {
        sanitizedData = formSchema.parse(data);
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
        glasses: sanitizedData.glasses, // Ensure prompts.js handles boolean 'glasses'
      };

      // Ensure watchedClothing and watchedBackgrounds are the current, correct arrays of {name, theme}
      // stylesLimit should also be correctly derived from the selected plan at this point.
      const finalPrompts = generatePrompts(
        characterDetails,
        watchedClothing, // This is an array of {name, theme}
        watchedBackgrounds, // This is an array of {name, theme}
        stylesLimit // Ensure stylesLimit is correctly determined from the selected plan
      );
      console.log("Final Prompts:", finalPrompts);

      if (!finalPrompts || finalPrompts.length === 0) {
        console.error("No prompts generated. Aborting submission.");
        setStudioMessage(
          "Could not generate image prompts based on selections. Please try different options or contact support."
        );
        setIsSubmitting(false);
        return; // Prevent submission if no prompts
      }

      // Add the generated prompts to the data to be sent to the backend
      // Your backend will expect an array of prompt strings.
      sanitizedData.prompts = finalPrompts;
      // console.log("Generated Prompts for API:", finalPrompts); // For debugging
      try {
        const response = await fetch("/dashboard/studio/create/upload/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData), // sanitizedData now includes .prompts
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
        localStorage.removeItem("currentFormStep");
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

  const handleReset = () => {
    localStorage.removeItem("currentFormStep");
    localStorage.removeItem("formValues");
    reset();
    setCurrentStep(0);
    setStudioMessage(false);
    setIsSubmitting(false);
    setClothingError("");
    setBackgroundsError("");
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
            isPending={
              selectedContext?.type === "organization"
                ? isOrgCreditsLoading
                : isCreditsLoading
            }
            credits={
              selectedContext?.type === "organization"
                ? organizationCredits
                : personalCredits
            }
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
      case "FileUploader":
        return (
          <FileUploader
            register={register}
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

  const isPlanSelectorStep = steps[currentStep].component === "PlanSelector";
  const selectedPlanName = getValues("plan");

  const currentContextCredits =
    selectedContext?.type === "organization"
      ? organizationCredits
      : personalCredits;

  const selectedPlanCredits = selectedPlanName
    ? currentContextCredits?.[selectedPlanName.toLowerCase()]
    : 0;

  const shouldShowBuyPlan =
    selectedContext?.type === "personal" &&
    currentStep === steps.length - 2 &&
    selectedPlanName &&
    (!selectedPlanCredits || selectedPlanCredits < 1);

  const handleBuyPlan = async () => {
    setIsBuyingPlan(true);
    try {
      const plan = getValues("plan");
      const planConfig = config.PLANS[plan];
      if (!planConfig || !planConfig.variantId || !userId)
        throw new Error("Invalid plan or user for checkout");
      const { createCheckout } = await import("@lemonsqueezy/lemonsqueezy.js");
      const checkout = await createCheckout({
        variantId: planConfig.variantId,
        checkoutOptions: {
          successUrl: `${window.location.origin}/dashboard/studio/create`,
        },
        checkoutData: {
          custom: {
            user_id: userId,
          },
        },
      });
      window.location.href = checkout.data.data.attributes.url;
    } catch (err) {
      console.error("LemonSqueezy checkout error:", err);
      alert("Failed to start checkout. Please try again.");
      setIsBuyingPlan(false);
    }
  };

  let mainButtonDisabled = isSubmitting;
  if (
    currentStep === 0 &&
    !selectedPlan &&
    steps[currentStep].component !== "PlanSelector"
  ) {
  }
  if (currentStep === steps.length - 1) {
    const imagesValue = getValues("images");
    if (!imagesValue || imagesValue.length < 3) {
      mainButtonDisabled = true;
    }
  }

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      console.log("Form validation errors from React Hook Form:", errors);
    }
  }, [errors]);

  return (
    <ContentLayout navbar={false} title="Create Studio">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="max-w-7xl mx-auto mt-8"
      >
        <>
          <div className="mb-6">{renderStep(steps[currentStep])}</div>

          <div className="flex justify-between items-center flex-wrap gap-2">
            <Button
              className="disabled:opacity-50"
              type="button"
              onClick={prev}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft strokeWidth={2} />
              Previous
            </Button>

            {shouldShowBuyPlan ? (
              <Button
                className="disabled:opacity-50"
                type="button"
                onClick={handleBuyPlan}
                disabled={isBuyingPlan || !selectedPlanName}
              >
                {isBuyingPlan ? "Redirecting..." : `Proceed to Payment`}
                <ChevronRight strokeWidth={2} />
              </Button>
            ) : (
              <Button
                className="disabled:opacity-50"
                type={currentStep === steps.length - 1 ? "submit" : "button"}
                onClick={currentStep === steps.length - 1 ? undefined : next}
                disabled={mainButtonDisabled}
              >
                {currentStep === steps.length - 1 ? "Create Studio" : "Next"}
                <ChevronRight strokeWidth={2} />
              </Button>
            )}
          </div>
          <div className="flex justify-between items-center flex-wrap gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="text-destructive" />
              Start Over
            </Button>
          </div>
        </>
      </form>
    </ContentLayout>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import VariableSelector from "@/components/dashboard/studio/Forms/VariableSelector";
import PlanSelector from "@/components/dashboard/studio/Forms/PlanSelector";
import ImageUploader from "@/components/dashboard/studio/Forms/ImageUploader";
import {
  formSchema,
  GENDERS,
  AGES,
  ETHNICITIES,
  HAIR_STYLES,
  EYE_COLORS,
  GLASSES,
  STUDIO_NAME_SELECTOR,
} from "@/components/dashboard/studio/Forms/Variables";
import { getCredits } from "@/lib/supabase/actions/client";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import BuyStudio from "../buy/page";
import Link from "next/link";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import * as Sentry from "@sentry/nextjs";

const FileUploader = ({
  register,
  errors,
  setValue,
  isSubmitting,
  studioMessage,
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
    />
  </div>
);

export default function StudioCreate() {
  const router = useRouter();
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

  const savedFormValues =
    typeof window !== "undefined" ? localStorage.getItem("formValues") : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
    trigger,
    reset,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "",
      age: "",
      ethnicity: "",
      hairStyle: "",
      eyeColor: "",
      glasses: "No",
      images: "",
      studioName: "",
      plan: "",
      ...(savedFormValues ? JSON.parse(savedFormValues) : {}),
    },
  });

  const formValues = watch();
  const selectedPlan = watch("plan");

  const {
    data: credits,
    error: creditsError,
    isLoading,
  } = useSWR("credits", async () => {
    try {
      const [{ credits }] = await getCredits();
      return credits;
    } catch (error) {
      throw new Error(error.message || "Unable to fetch credits");
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("formValues", JSON.stringify(formValues));
    }
  }, [formValues]);

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

  if (isLoading) return <Loader />;
  if (creditsError) return <Error message={creditsError.message} />;
  if (!credits || Object.values(credits).every((count) => count <= 0)) {
    return <BuyStudio />;
  }

  const order = ["Basic", "Standard", "Premium", "Pro"];
  const sortedCredits = Object.entries(credits).sort(
    ([aKey], [bKey]) => order.indexOf(aKey) - order.indexOf(bKey)
  );

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
        sortedCredits,
      ],
    },
    { id: "Step 1", component: "VariableSelector", data: GENDERS },
    { id: "Step 1", component: "VariableSelector", data: AGES },
    { id: "Step 2", component: "VariableSelector", data: ETHNICITIES },
    { id: "Step 3", component: "VariableSelector", data: HAIR_STYLES },
    { id: "Step 4", component: "VariableSelector", data: EYE_COLORS },
    { id: "Step 5", component: "VariableSelector", data: GLASSES },
    {
      id: "Step 6",
      component: "VariableSelector",
      data: STUDIO_NAME_SELECTOR,
    },
    { id: "Step 7", component: "FileUploader" },
  ];

  const next = async () => {
    setShouldValidate(true);
    const currentStepData = steps[currentStep];
    let isValid = false;

    try {
      if (
        currentStepData.component === "VariableSelector" ||
        currentStepData.component === "PlanSelector"
      ) {
        isValid = await trigger(currentStepData.data[0].fieldName);
      } else if (currentStepData.component === "FileUploader") {
        const values = formValues;
        isValid = Boolean(values.images);
      } else {
        isValid = await trigger();
      }

      if (isValid && currentStep < steps.length - 1) {
        setPreviousStep(currentStep);
        setCurrentStep((step) => step + 1);
        setShouldValidate(false);
      }
    } catch (error) {
      console.error("Validation error:", error);
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
    try {
      setIsSubmitting(true);

      // Validate the form data
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

      // Submit the form with error handling
      try {
        const response = await fetch("/dashboard/studio/create/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData),
        });

        if (!response.ok) {
          // Try to parse the error message from the response
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 402) {
            setStudioMessage(
              "You don't have enough credits. Please purchase more credits to continue."
            );
            setIsSubmitting(false);
            return;
          } else if (response.status === 401) {
            setStudioMessage("Your session has expired. Please log in again.");
            setIsSubmitting(false);
            return;
          }

          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        }

        const result = await response.json();

        // Clear form data from local storage
        localStorage.removeItem("currentFormStep");
        localStorage.removeItem("formValues");

        setStudioMessage(result.message || "Studio created successfully!");
        router.push("/dashboard/studio/" + result.studioId);
      } catch (error) {
        console.error("API request error:", error);
        Sentry.captureException(error);
        setStudioMessage(
          "We couldn't create your studio. Please try again or contact our support team."
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      Sentry.captureException(error);
      setStudioMessage(
        error instanceof z.ZodError
          ? "Please check all form fields"
          : "We could not create studio. Please contact our support team."
      );
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("formValues");
    localStorage.removeItem("currentFormStep");
    reset(); // Reset form values
    setCurrentStep(0); // Reset to first step
    setStudioMessage(false);
    setIsSubmitting(false);
  };

  const renderStep = (step) => {
    switch (step.component) {
      case "PlanSelector":
        return (
          <PlanSelector
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
          />
        );

      default:
        return null;
    }
  };

  const isNextDisabled = currentStep === 0 && !selectedPlan;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      className="max-w-7xl mx-auto mt-8"
    >
      <ReactErrorBoundary
        fallback={<Error message="Something went wrong. Please try again." />}
      >
        <div className="mb-6">{renderStep(steps[currentStep])}</div>

        <div className="flex justify-between items-center">
          <Button
            className="disabled:opacity-50"
            type="button"
            onClick={prev}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft strokeWidth={2} />
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw />
            Reset
          </Button>

          <Button
            className="disabled:opacity-50"
            type={currentStep === steps.length - 1 ? "submit" : "button"}
            onClick={currentStep === steps.length - 1 ? undefined : next}
            disabled={isNextDisabled || isSubmitting}
          >
            {currentStep === steps.length - 1 ? "Create Studio" : "Next"}
            <ChevronRight strokeWidth={2} />
          </Button>
        </div>
        <p className="text-base mt-2 ">
          If you're having issues uploading the images please{" "}
          <Link
            className="text-destructive underline"
            href={"/dashboard/studio/create2"}
          >
            click here.
          </Link>
        </p>
      </ReactErrorBoundary>
    </form>
  );
}

class CustomErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Form error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import VariableSelector from "@/components/dashboard/studio/Forms/VariableSelector";
import ProgressBar from "@/components/dashboard/studio/Forms/ProgressBar";
import PlanSelector from "@/components/dashboard/studio/Forms/PlanSelector";
import ImageUploader from "@/components/dashboard/studio/Forms/ImageUploader";
import {
  formSchema,
  GENDERS,
  AGES,
  ETHNICITIES,
  HAIR_STYLES,
  EYE_COLORS,
  GROOMING,
  STUDIO_NAME_SELECTOR,
} from "@/components/dashboard/studio/Forms/Variables";
import { getCredits } from "@/lib/supabase/actions/client";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import useSWR from "swr";
import Button from "@/components/ui/Button";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import BuyStudio from "../buy/page";

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

export default function Replicate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [shouldValidate, setShouldValidate] = useState(false);
  const [studioMessage, setStudioMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
    trigger,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "",
      age: "",
      ethnicity: "",
      hairStyle: "",
      eyeColor: "",
      grooming: "",
      images: "",
      studioName: "",
    },
  });

  const selectedPlan = watch("plan");
  const router = useRouter();

  async function fetcher() {
    try {
      const [{ credits }] = await getCredits();
      return credits;
    } catch (error) {
      throw new Error(error.message || "Unable to fetch credits");
    }
  }

  const {
    data: credits,
    error: creditsError,
    isLoading,
  } = useSWR("credits", fetcher);

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
    { id: "Step 5", component: "VariableSelector", data: GROOMING },
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

    if (
      currentStepData.component === "VariableSelector" ||
      currentStepData.component === "PlanSelector"
    ) {
      isValid = await trigger(currentStepData.data[0].fieldName);
    } else {
      isValid = await trigger();
    }

    if (isValid && currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
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
      const sanitizedData = formSchema.parse(data);

      const isValid = await trigger();
      if (!isValid) {
        console.error("Form validation failed");
        return;
      }

      const response = await fetch("/dashboard/studio/create/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        setStudioMessage(
          "We could not create studio. Please contact our support team."
        );
        throw new Error("Submission failed!");
      }
      const result = await response.json();
      console.log(result);
      setStudioMessage(result.message);
      router.push("/dashboard/studio/" + result.studioId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);

        // Display Zod errors to the user (e.g., using formState.errors)
        error.issues.forEach((issue) => {
          setError(issue.path[0], { type: "manual", message: issue.message });
        });
        setStudioMessage(
          "We could not create studio. Please contact our support team."
        );
      } else {
        // Handle other errors
        setStudioMessage(
          "We could not create studio. Please contact our support team."
        );
        // Display a generic error message to the user
      }
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="mb-6">
        <div className="mb-4">
          <ProgressBar
            stepCompleted={currentStep + 1}
            totalSteps={steps.length}
          />
        </div>
        {renderStep(steps[currentStep])}
      </div>

      <div className="flex justify-between">
        <Button
          cls="disabled:opacity-50"
          type="button"
          onClick={prev}
          disabled={currentStep === 0 || isSubmitting}
        >
          <HiChevronLeft strokeWidth={2} />
          Previous
        </Button>
        <Button
          cls="disabled:opacity-50"
          type={currentStep === steps.length - 1 ? "submit" : "button"}
          onClick={currentStep === steps.length - 1 ? undefined : next}
          disabled={isNextDisabled || isSubmitting}
        >
          {currentStep === steps.length - 1 ? "Create Studio" : "Next"}
          <HiChevronRight strokeWidth={2} />
        </Button>
      </div>
    </form>
  );
}

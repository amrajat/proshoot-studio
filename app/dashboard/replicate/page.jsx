"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import VariableSelector from "@/components/dashboard/studio/Forms/VariableSelector";
import ProgressBar from "@/components/dashboard/studio/Forms/ProgressBar";
import PlanSelector from "@/components/dashboard/studio/Forms/PlanSelector";
import ImageUploader from "@/components/dashboard/studio/Forms/ImageUploader";
import Toast from "@/components/ui/Toast";
import {
  formSchema,
  GENDERS,
  AGES,
  ETHNICITIES,
  HAIR_COLORS,
  HAIR_STYLES,
  EYE_COLORS,
  PROFESSIONS,
  CLOTHING_TYPE,
  CLOTHING_COLORS,
  GROOMING,
  BACKGROUND_TYPE,
  LIGHTINGS,
  EXPRESSIONS,
  CAMERA_TYPE,
  LENSE_DESCRIPTION,
  APERTURE,
} from "@/components/dashboard/studio/Forms/Variables";
import { getCredits } from "@/lib/supabase/actions/client";
import CoverPage from "@/components/dashboard/CoverPage";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import useSWR from "swr";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import Button from "@/components/ui/Button";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import Heading, { SubHeading } from "@/components/ui/Heading";

const FileUploader = ({
  register,
  errors,
  setValue,
  setCurrentStep = { setCurrentStep },
  shouldValidate,
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
      setCurrentStep={setCurrentStep}
      errors={errors}
    />
  </div>
);

const CustomInputField = ({ register, errors, currentStep, previousStep }) => (
  <div>
    <motion.div
      initial={{
        x: currentStep - previousStep >= 0 ? "50%" : "-50%",
        opacity: 0,
      }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Heading type="h3">Name your studio anything.</Heading>
      <SubHeading align="left">Usually it's your name.</SubHeading>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <input
              type="text"
              placeholder="use custom value instead, a-z lowercase only, use space as separator, no special characters."
              className="col-span-2 sm:col-span-3 md:col-span-4 row-span-2 py-3 px-4 block w-full border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none outline-blue-600 placeholder:text-sm"
              {...register("customField", {
                required: "This field is required",
              })}
            />
          </div>

          <div className="mt-2">
            {errors && errors?.customField?.message && (
              <p className="mt-2 text-red-500">
                {errors?.customField?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

export default function Replicate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [shouldValidate, setShouldValidate] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
    getValues,
    trigger,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(formSchema), // Use zodResolver here
  });

  const selectedPlan = watch("plan");

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
    return (
      <CoverPage
        title="Zero Studio Credits"
        buttonLink="/dashboard/studio/buy"
        buttonText="Buy Studio"
      >
        You don't have any credits to create a studio. Please purchase a plan
        first.
      </CoverPage>
    );
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
    { id: "Step 3", component: "VariableSelector", data: HAIR_COLORS },
    { id: "Step 4", component: "VariableSelector", data: HAIR_STYLES },
    { id: "Step 5", component: "VariableSelector", data: EYE_COLORS },
    { id: "Step 6", component: "VariableSelector", data: PROFESSIONS },
    { id: "Step 7", component: "VariableSelector", data: CLOTHING_TYPE },
    { id: "Step 8", component: "VariableSelector", data: CLOTHING_COLORS },
    { id: "Step 11", component: "VariableSelector", data: GROOMING },
    { id: "Step 12", component: "VariableSelector", data: BACKGROUND_TYPE },
    { id: "Step 13", component: "VariableSelector", data: LIGHTINGS },
    { id: "Step 15", component: "VariableSelector", data: EXPRESSIONS },
    { id: "Step 17", component: "VariableSelector", data: CAMERA_TYPE },
    { id: "Step 18", component: "VariableSelector", data: LENSE_DESCRIPTION },
    { id: "Step 18", component: "VariableSelector", data: APERTURE },
    { id: "Step 19", component: "FileUploader" },
    { id: "Step 20", component: "CustomInputField" },
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
    console.log("Form data:", data);
    try {
      // Zod validation happens automatically thanks to zodResolver
      const sanitizedData = formSchema.parse(data); // Parse with Zod

      console.log("Submitting data:", sanitizedData);

      // Here you would typically send the sanitizedData to your backend
      // ... your API call logic ...
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod errors (display them to the user)
        console.error("Zod validation errors:", error.errors);

        // Optionally, set errors back to useForm for display
        error.issues.forEach((issue) => {
          // Assuming your field names in Zod schema match your form field names
          setError(issue.path[0], { type: "manual", message: issue.message });
        });
      } else {
        // Handle other errors
        console.error("Submission error:", error);
      }
    }

    // Perform final validation
    const isValid = await trigger();
    if (!isValid) {
      console.error("Form validation failed");
      return;
    }

    // Sanitize and validate the data before submission
    const sanitizedData = {
      plan: data.plan,
      gender: data.gender,
      profession: data.profession,
      images: data.images,
      customField: data.customField,
      age: data.age,
      ethnicity: data.ethnicity,
      "eye-color": data["eye-color"],
      "hair-color": data["hair-color"],
      "hair-style": data["hair-style"],
      "cloth-type": data["cloth-type"],
      "cloth-color": data["cloth-color"],
      grooming: data.grooming,
      background: data.background,
      lighting: data.lighting,
      expression: data.expression,
      "gaze-direction": data["gaze-direction"],
      "camera-type": data["camera-type"],
      "lens-type": data["lens-type"],
      aperture: data.aperture,
    };

    // Here you would typically send the data to your backend
    console.log("Submitting data:", sanitizedData);
    // await axios.post("/dashboard/studio/create/upload", sanitizedData);
    await fetch("/dashboard/replicate/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedData),
    });
    // Implement your API call here
    // try {
    //   const response = await fetch('/api/submit-form', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(sanitizedData),
    //   });
    //   if (!response.ok) throw new Error('Submission failed');
    //   const result = await response.json();
    //   console.log('Submission successful:', result);
    // } catch (error) {
    //   console.error('Submission error:', error);
    // }
  };

  const renderStep = (step) => {
    switch (step.component) {
      case "PlanSelector":
        return (
          <PlanSelector
            data={step.data}
            isPending={false}
            register={register}
            setValue={setValue}
            delta={currentStep - previousStep}
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
            isPending={false}
            register={register}
            setValue={setValue}
            delta={currentStep - previousStep}
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
            setCurrentStep={setCurrentStep}
          />
        );
      case "CustomInputField":
        return <CustomInputField register={register} errors={errors} />;
      default:
        return null;
    }
  };

  const isNextDisabled = currentStep === 0 && !selectedPlan;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto mt-8">
      <div className="mb-6">
        {/* <div className="mb-4">
          <ProgressBar
            stepCompleted={currentStep + 1}
            totalSteps={steps.length}
          />
        </div> */}
        {renderStep(steps[currentStep])}
      </div>

      <div className="flex justify-between">
        <Button
          cls="disabled:opacity-50"
          type="button"
          onClick={prev}
          disabled={currentStep === 0}
        >
          <HiChevronLeft strokeWidth={2} />
          Previous
        </Button>
        <Button
          cls="disabled:opacity-50"
          type={currentStep === steps.length - 1 ? "submit" : "button"}
          onClick={currentStep === steps.length - 1 ? undefined : next}
          disabled={isNextDisabled}
        >
          {currentStep === steps.length - 1 ? "Create Studio" : "Next"}
          <HiChevronRight strokeWidth={2} />
        </Button>
      </div>
    </form>
  );
}

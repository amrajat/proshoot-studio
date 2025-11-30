/**
 * Studio Form Provider
 * Provides form context and validation for studio creation
 */

import React, { createContext, useContext, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useStudioCreateStore from "@/stores/studioCreateStore";

// Validation schemas for each step
const planSelectionSchema = z.object({
  plan: z.string().min(1, "Please select a plan"),
});

const imageUploadSchema = z.object({
  images: z.string().min(10, "Please upload images"),
});

const stylePairingSchema = z.object({
  style_pairs: z
    .array(
      z.object({
        clothing: z.object({
          name: z.string().min(1, "Clothing name is required"),
          theme: z.string().min(1, "Clothing theme is required"),
        }),
        background: z.object({
          name: z.string().min(1, "Background name is required"),
          theme: z.string().min(1, "Background theme is required"),
        }),
      })
    )
    .min(1, "At least one style combination is required")
    .max(10, "Maximum 10 style combinations allowed"),
});

const attributesSchema = z.object({
  studioName: z
    .string()
    .min(1, "Studio name is required")
    .max(50, "Studio name must be less than 50 characters"),
  gender: z.string().min(1, "Gender is required"),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  bodyType: z.string().min(1, "Body type is required"),
  hairLength: z.string().min(1, "Hair length is required"),
  hairColor: z.string().optional(), // Optional when hair is bald/hijab
  hairType: z.string().optional(), // Optional when hair is bald/hijab
  glasses: z.boolean({ required_error: "Glasses preference is required" }).nullable().refine((val) => val !== null, { message: "Glasses preference is required" }),
});

// Combined schema for final validation
const completeFormSchema = planSelectionSchema
  .merge(imageUploadSchema)
  .merge(stylePairingSchema)
  .merge(attributesSchema);

// Step schemas mapping by step ID (not index) to handle dynamic step ordering
const stepSchemasById = {
  'plan-selection': planSelectionSchema,
  'attributes': attributesSchema,
  'style-pairing': stylePairingSchema,
  'image-upload': imageUploadSchema,
};

const FormContext = createContext(null);

export const useStudioForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useStudioForm must be used within StudioFormProvider");
  }
  return context;
};

// Step ID mapping by index (for when we only have the step index)
const stepIdsByIndex = ['plan-selection', 'attributes', 'style-pairing', 'image-upload'];

const StudioFormProvider = ({ children }) => {
  const { formData, setFormData, setErrors, currentStep } =
    useStudioCreateStore();
  
  // Get current step ID from index
  const currentStepId = stepIdsByIndex[currentStep] || null;

  // Initialize form with current data
  const form = useForm({
    resolver: zodResolver(completeFormSchema),
    defaultValues: formData,
    mode: "onChange",
  });

  // Get schema for current step by ID
  const getSchemaForStep = useCallback((stepId) => {
    return stepSchemasById[stepId] || null;
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback(async (stepId = currentStepId) => {
    const schema = getSchemaForStep(stepId);
    if (!schema) return true;

    try {
      // Get current form values
      const values = form.getValues();

      // Validate against step schema
      await schema.parseAsync(values);

      // Clear any previous errors
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        const fieldErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });

        setErrors(fieldErrors);
        return false;
      }

      console.error("Validation error:", error);
      setErrors({ general: "Validation failed. Please check your inputs." });
      return false;
    }
  }, [currentStepId, form, setErrors, getSchemaForStep]);

  // Validate specific field
  const validateField = useCallback(
    async (fieldName, value, stepId = currentStepId) => {
      try {
        const schema = getSchemaForStep(stepId);
        if (!schema) return true;

        // Create a partial object with just this field
        const fieldData = { [fieldName]: value };

        // Get the field schema
        const fieldSchema = schema.pick({ [fieldName]: true });

        // Validate the field
        await fieldSchema.parseAsync(fieldData);

        // Clear error for this field - get current state first (Zustand doesn't support callback pattern)
        const currentErrors = useStudioCreateStore.getState().errors;
        const newErrors = { ...currentErrors };
        delete newErrors[fieldName];
        setErrors(newErrors);

        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors[0]?.message || "Invalid value";
          // Get current state first (Zustand doesn't support callback pattern)
          const currentErrors = useStudioCreateStore.getState().errors;
          setErrors({
            ...currentErrors,
            [fieldName]: fieldError,
          });
          return false;
        }
        return true;
      }
    },
    [currentStepId, setErrors, getSchemaForStep]
  );

  // Update form data and validate
  const updateFormData = useCallback(
    (data) => {
      // Update form values
      Object.keys(data).forEach((key) => {
        form.setValue(key, data[key]);
      });

      // Update store
      setFormData(data);

      // Validate changed fields
      Object.keys(data).forEach((key) => {
        validateField(key, data[key]);
      });
    },
    [form, setFormData, validateField]
  );

  // Get validation errors for a field
  const getFieldError = useCallback(
    (fieldName) => {
      return form.formState.errors[fieldName]?.message;
    },
    [form.formState.errors]
  );

  // Check if form is valid for current step
  const isStepValid = useCallback((stepId = currentStepId) => {
    const schema = getSchemaForStep(stepId);
    if (!schema) return true;

    try {
      const values = form.getValues();
      schema.parse(values);
      return true;
    } catch {
      return false;
    }
  }, [currentStepId, form, getSchemaForStep]);

  const contextValue = {
    form,
    formData,
    updateFormData,
    validateCurrentStep,
    validateField,
    getFieldError,
    isStepValid,
    currentStepId,
  };

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
};

export default StudioFormProvider;

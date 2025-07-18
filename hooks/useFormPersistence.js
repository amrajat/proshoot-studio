import { useEffect, useCallback } from "react";

const useFormPersistence = (formKey, formValues, dependencies = []) => {
  // Save form values to localStorage
  const saveFormValues = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const valuesToSave = {
          studioName: formValues.studioName || "",
          gender: formValues.gender || "",
          age: formValues.age || "",
          ethnicity: formValues.ethnicity || "",
          hairLength: formValues.hairLength || "",
          hairColor: formValues.hairColor || "",
          hairType: formValues.hairType || "",
          eyeColor: formValues.eyeColor || "",
          glasses: formValues.glasses || "No",
          bodyType: formValues.bodyType || "",
          height: formValues.height || "",
          weight: formValues.weight || "",
          howDidYouHearAboutUs: formValues.howDidYouHearAboutUs || "",
          plan: formValues.plan || "",
          images: formValues.images || "",
          // Ensure arrays are properly structured
          style_pairs: Array.isArray(formValues.style_pairs)
            ? formValues.style_pairs.filter(
                (pair) =>
                  typeof pair === "object" &&
                  pair.clothing &&
                  pair.background
              )
            : [],
        };

        localStorage.setItem(formKey, JSON.stringify(valuesToSave));
      } catch (error) {
        console.error("Error saving form values to localStorage:", error);
      }
    }
  }, [formKey, formValues]);

  // Load form values from localStorage
  const loadFormValues = useCallback(() => {
    if (typeof window === "undefined") return {};

    try {
      const savedValues = localStorage.getItem(formKey);
      if (savedValues) {
        const parsed = JSON.parse(savedValues);
        return {
          ...parsed,
          // Validate array structures
          style_pairs: Array.isArray(parsed.style_pairs)
            ? parsed.style_pairs.filter(
                (pair) =>
                  typeof pair === "object" &&
                  pair.clothing &&
                  pair.background
              )
            : [],
        };
      }
    } catch (error) {
      console.error("Error loading form values from localStorage:", error);
    }

    return {};
  }, [formKey]);

  // Clear form values from localStorage
  const clearFormValues = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(formKey);
      } catch (error) {
        console.error("Error clearing form values from localStorage:", error);
      }
    }
  }, [formKey]);

  // Auto-save form values when dependencies change
  useEffect(() => {
    saveFormValues();
  }, dependencies);

  return {
    loadFormValues,
    saveFormValues,
    clearFormValues,
  };
};

export default useFormPersistence;

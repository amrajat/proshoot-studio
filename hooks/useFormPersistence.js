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
          clothing: Array.isArray(formValues.clothing)
            ? formValues.clothing.filter(
                (item) =>
                  typeof item === "object" && "name" in item && "theme" in item
              )
            : [],
          backgrounds: Array.isArray(formValues.backgrounds)
            ? formValues.backgrounds.filter(
                (item) =>
                  typeof item === "object" && "name" in item && "theme" in item
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
          clothing: Array.isArray(parsed.clothing)
            ? parsed.clothing.filter(
                (item) =>
                  typeof item === "object" && "name" in item && "theme" in item
              )
            : [],
          backgrounds: Array.isArray(parsed.backgrounds)
            ? parsed.backgrounds.filter(
                (item) =>
                  typeof item === "object" && "name" in item && "theme" in item
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

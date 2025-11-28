/**
 * Studio Create Store
 * Centralized state management for studio creation process
 * NO PERSISTENCE - Fresh state on every page load for simplicity and reliability
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchUserCredits } from "@/services/creditService";

// Initial form data structure
const initialFormData = {
  plan: "",
  studioName: "",
  images: "",
  style_pairs: [],
  context: "personal", // 'personal' | 'organization'
  gender: "",
  ethnicity: "",
  hairLength: "",
  hairColor: "",
  hairType: "",
  glasses: null, // boolean - null means not selected yet
  // Track what plan/gender was used when style_pairs were created
  // This persists across component mounts unlike useRef
  stylePairsCreatedWithPlan: null,
  stylePairsCreatedWithGender: null,
};

// Initial UI state
const initialUIState = {
  currentStep: 0,
  isSubmitting: false,
  errors: {},
  studioMessage: "",
};

// Initial credits state
const initialCreditsState = {
  credits: null,
  creditsLoading: false,
  creditsError: null,
};

// Initial organization state
const initialOrgState = {
  orgApprovedClothing: null,
  orgApprovedBackgrounds: null,
  orgRestrictClothing: false,
  orgRestrictBackgrounds: false,
  isOrgSettingsLoading: false,
  orgSettingsError: null,
};

const useStudioCreateStore = create(
  devtools(
    (set, get) => ({
      // Form data
      formData: { ...initialFormData },

      // UI state
      ...initialUIState,

      // Credits state
      ...initialCreditsState,

      // Organization state
      ...initialOrgState,

      // Form data actions
      setFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      updateFormField: (field, value) => {
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        }));
      },

      resetFormData: () => {
        set({ formData: { ...initialFormData } });
      },

      // UI state actions
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      nextStep: () => {
        set((state) => ({ currentStep: state.currentStep + 1 }));
      },

      prevStep: () => {
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        }));
      },

      setIsSubmitting: (submitting) => {
        set({ isSubmitting: submitting });
      },

      setErrors: (errors) => {
        set({ errors });
      },

      clearErrors: () => {
        set({ errors: {} });
      },

      setStudioMessage: (message) => {
        set({ studioMessage: message });
      },

      // Credits actions
      fetchCredits: async (userId) => {
        if (!userId) {
          set({
            credits: null,
            creditsLoading: false,
            creditsError: "User ID is required",
          });
          return;
        }

        set({ creditsLoading: true, creditsError: null });

        try {
          const credits = await fetchUserCredits(userId);
          set({
            credits,
            creditsLoading: false,
            creditsError: null,
          });
        } catch (error) {
          console.error("Failed to fetch credits:", error);
          set({
            credits: null,
            creditsLoading: false,
            creditsError: error.message,
          });
        }
      },

      // Organization settings action (fetches and sets all org settings at once)
      fetchOrgSettings: async (organizationId) => {
        if (!organizationId) {
          set({
            orgApprovedClothing: null,
            orgApprovedBackgrounds: null,
            orgRestrictClothing: false,
            orgRestrictBackgrounds: false,
            isOrgSettingsLoading: false,
            orgSettingsError: null,
          });
          return;
        }

        set({ isOrgSettingsLoading: true, orgSettingsError: null });

        try {
          const createSupabaseBrowserClient = (
            await import("@/lib/supabase/browser-client")
          ).default;
          const supabase = createSupabaseBrowserClient();

          const { data, error } = await supabase
            .from("organizations")
            .select("approved_clothing, approved_backgrounds, restrict_clothing_options, restrict_background_options")
            .eq("id", organizationId)
            .single();

          if (error) throw error;

          set({
            orgApprovedClothing: data?.approved_clothing || null,
            orgApprovedBackgrounds: data?.approved_backgrounds || null,
            orgRestrictClothing: data?.restrict_clothing_options || false,
            orgRestrictBackgrounds: data?.restrict_background_options || false,
            isOrgSettingsLoading: false,
            orgSettingsError: null,
          });
        } catch (error) {
          console.error("Failed to fetch org settings:", error);
          set({
            orgApprovedClothing: null,
            orgApprovedBackgrounds: null,
            orgRestrictClothing: false,
            orgRestrictBackgrounds: false,
            isOrgSettingsLoading: false,
            orgSettingsError: error.message,
          });
        }
      },

      // Complete reset - resets all state to initial values
      resetStore: () => {
        set({
          formData: { ...initialFormData },
          ...initialUIState,
          ...initialCreditsState,
          ...initialOrgState,
        });
      },
    }),
    {
      name: "studio-create-store",
    }
  )
);

export default useStudioCreateStore;

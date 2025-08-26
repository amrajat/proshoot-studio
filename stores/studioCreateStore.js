/**
 * Studio Create Store
 * Centralized state management for studio creation process
 * Uses Zustand with persistence for form data
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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
  glasses: "",
  uploadState: null, // Store image upload state for persistence
};

// Initial UI state
const initialUIState = {
  currentStep: 0,
  isSubmitting: false,
  errors: {},
  studioMessage: "",
  shouldValidate: false,
  // Context tracking for reset detection
  lastContextId: null,
  lastContextType: null,
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
    persist(
      (set, get) => ({
        // Form data (persisted)
        formData: { ...initialFormData },

        // UI state (not persisted)
        ...initialUIState,

        // Credits state (not persisted)
        ...initialCreditsState,

        // Organization state (not persisted)
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

        // Context tracking and auto-reset
        checkAndHandleContextChange: (contextId, contextType) => {
          const state = get();
          const currentContextId = state.lastContextId;
          const currentContextType = state.lastContextType;

          // Check if context has changed
          if (
            currentContextId !== null &&
            (currentContextId !== contextId ||
              currentContextType !== contextType)
          ) {
            console.log(
              "[StudioCreateStore] Context changed, resetting form and step"
            );
            // Reset everything when context changes
            set({
              formData: { ...initialFormData },
              currentStep: 0,
              errors: {},
              studioMessage: "",
              shouldValidate: false,
              lastContextId: contextId,
              lastContextType: contextType,
            });
            return true; // Indicates reset occurred
          } else {
            // Update context tracking
            set({
              lastContextId: contextId,
              lastContextType: contextType,
            });
            return false; // No reset needed
          }
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

        setShouldValidate: (validate) => {
          set({ shouldValidate: validate });
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

        // Organization settings actions
        setOrgApprovedClothing: (clothing) => {
          set({ orgApprovedClothing: clothing });
        },

        setOrgApprovedBackgrounds: (backgrounds) => {
          set({ orgApprovedBackgrounds: backgrounds });
        },

        setOrgRestrictClothing: (restrict) => {
          set({ orgRestrictClothing: restrict });
        },

        setOrgRestrictBackgrounds: (restrict) => {
          set({ orgRestrictBackgrounds: restrict });
        },

        setIsOrgSettingsLoading: (loading) => {
          set({ isOrgSettingsLoading: loading });
        },

        setOrgSettingsError: (error) => {
          set({ orgSettingsError: error });
        },

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

        // Complete reset
        resetStore: () => {
          set({
            formData: { ...initialFormData },
            ...initialUIState,
            ...initialCreditsState,
            ...initialOrgState,
          });
        },

        // Complete form reset including persistent storage
        resetFormCompletely: () => {
          // Clear localStorage/persistent storage
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("studio-create-store");
              console.log("[StudioCreateStore] Cleared persistent storage");
            } catch (error) {
              console.error(
                "[StudioCreateStore] Error clearing storage:",
                error
              );
            }
          }

          // Reset all state to initial values
          set({
            formData: { ...initialFormData },
            ...initialUIState,
            ...initialCreditsState,
            ...initialOrgState,
          });
          // Revalidate or refresh the page to ensure the UI is updated
          if (typeof window !== "undefined") {
            window.location.reload();
          }

          console.log("[StudioCreateStore] Complete form reset performed");
        },
      }),
      {
        name: "studio-create-store",
        // Persist form data, current step, and context tracking
        partialize: (state) => ({
          formData: state.formData,
          currentStep: state.currentStep,
          lastContextId: state.lastContextId,
          lastContextType: state.lastContextType,
        }),
      }
    ),
    {
      name: "studio-create-store",
    }
  )
);

export default useStudioCreateStore;

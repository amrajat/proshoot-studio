import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Helper function to get storage key
const getStepStorageKey = (contextType, hasTeamCredits) => {
  const context = contextType || "personal";
  const teamStatus = hasTeamCredits ? "team" : "individual";
  return `headsshot_studio_step_${context}_${teamStatus}`;
};

// Helper function to get initial step from localStorage
const getInitialStep = (contextType, hasTeamCredits) => {
  if (typeof window === "undefined") return 0;

  const storageKey = getStepStorageKey(contextType, hasTeamCredits);
  const savedStep = localStorage.getItem(storageKey);

  if (savedStep && savedStep !== "null") {
    const parsedStep = parseInt(savedStep, 10);
    if (!isNaN(parsedStep) && parsedStep >= 0) {
      console.log(`[Store] Restored step ${parsedStep} from ${storageKey}`);
      return parsedStep;
    }
  }

  console.log(`[Store] No valid saved step, starting from 0`);
  return 0;
};

const useDashboardStore = create(
  devtools(
    (set, get) => ({
      // Studio Create Form State
      currentStep: 0,
      previousStep: 0,
      shouldValidate: false,
      studioMessage: false,
      isSubmitting: false,
      errorDetails: null,
      isBuyingPlan: false,
      clothingError: "",
      backgroundsError: "",

      // Context tracking for step persistence
      currentContext: null,
      hasTeamCredits: false,

      // Organization Settings State
      orgApprovedClothing: null,
      orgApprovedBackgrounds: null,
      isOrgSettingsLoading: false,

      // Organization Admin State
      inviteEmail: "",
      isInviting: false,
      sentInvitations: [],
      invitationsLoading: true,
      isBuyingCredits: null,
      organizationCredits: null,
      organizationCreditsLoading: true,
      organizationCreditsError: null,

      // Enhanced step management with persistence
      setCurrentStep: (step, contextType, hasTeamCredits) => {
        const state = get();

        // Save to localStorage
        if (typeof window !== "undefined") {
          const storageKey = getStepStorageKey(contextType, hasTeamCredits);
          localStorage.setItem(storageKey, step.toString());
          console.log(`[Store] Saved step ${step} to ${storageKey}`);
        }

        set({
          currentStep: step,
          currentContext: contextType,
          hasTeamCredits: hasTeamCredits,
        });
      },

      // Initialize step from localStorage
      initializeStep: (contextType, hasTeamCredits, maxSteps = 999) => {
        const savedStep = getInitialStep(contextType, hasTeamCredits);
        const validStep = Math.min(savedStep, maxSteps - 1);

        console.log(
          `[Store] Initializing step: saved=${savedStep}, valid=${validStep}, max=${maxSteps}`
        );

        set({
          currentStep: validStep,
          currentContext: contextType,
          hasTeamCredits: hasTeamCredits,
        });

        return validStep;
      },

      // Actions for Studio Create
      setPreviousStep: (step) => set({ previousStep: step }),
      setShouldValidate: (validate) => set({ shouldValidate: validate }),
      setStudioMessage: (message) => set({ studioMessage: message }),
      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setErrorDetails: (details) => set({ errorDetails: details }),
      setIsBuyingPlan: (buying) => set({ isBuyingPlan: buying }),
      setClothingError: (error) => set({ clothingError: error }),
      setBackgroundsError: (error) => set({ backgroundsError: error }),

      // Actions for Organization Settings
      setOrgApprovedClothing: (clothing) =>
        set({ orgApprovedClothing: clothing }),
      setOrgApprovedBackgrounds: (backgrounds) =>
        set({ orgApprovedBackgrounds: backgrounds }),
      setIsOrgSettingsLoading: (loading) =>
        set({ isOrgSettingsLoading: loading }),

      // Actions for Organization Admin
      setInviteEmail: (email) => set({ inviteEmail: email }),
      setIsInviting: (inviting) => set({ isInviting: inviting }),
      setSentInvitations: (invitations) =>
        set({ sentInvitations: invitations }),
      setInvitationsLoading: (loading) => set({ invitationsLoading: loading }),
      setIsBuyingCredits: (buying) => set({ isBuyingCredits: buying }),
      setOrganizationCredits: (credits) =>
        set({ organizationCredits: credits }),
      setOrganizationCreditsLoading: (loading) =>
        set({ organizationCreditsLoading: loading }),
      setOrganizationCreditsError: (error) =>
        set({ organizationCreditsError: error }),
      fetchOrganizationCredits: async (organizationId) => {
        if (!organizationId) {
          return set({
            organizationCredits: null,
            organizationCreditsLoading: false,
            organizationCreditsError: null,
          });
        }
        set({
          organizationCreditsLoading: true,
          organizationCreditsError: null,
        });
        try {
          const supabase = createSupabaseBrowserClient();
          const { data, error } = await supabase
            .from("credits")
            .select("*")
            .eq("organization_id", organizationId)
            .maybeSingle();

          if (error) throw error;
          set({ organizationCredits: data, organizationCreditsLoading: false });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          console.error("Failed to fetch organization credits:", message);
          set({
            organizationCredits: null,
            organizationCreditsLoading: false,
            organizationCreditsError: message,
          });
        }
      },
      fetchSentInvitations: async (organizationId) => {
        set({ invitationsLoading: true });
        try {
          const supabase = createSupabaseBrowserClient();
          const { data, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false });

          if (error) throw error;
          set({ sentInvitations: data, invitationsLoading: false });
        } catch (error) {
          console.error("Failed to fetch invitations:", error.message);
          set({ sentInvitations: [], invitationsLoading: false });
          // Optionally set an error state here
        }
      },
      createInvitation: async (invitationData) => {
        set({ isInviting: true });
        try {
          const result = await createInvitationAction(invitationData);
          if (result.error) throw new Error(result.error);

          // Add the new invitation to the top of the list for immediate UI feedback
          set((state) => ({
            sentInvitations: [result.data, ...state.sentInvitations],
            isInviting: false,
            inviteEmail: "", // Clear email input on success
          }));
          return { success: true, data: result.data };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          console.error("Failed to create invitation:", message);
          set({ isInviting: false });
          return { success: false, error: message };
        }
      },

      // Enhanced reset function with storage cleanup
      resetStudioForm: (contextType, hasTeamCredits) => {
        // Clear localStorage
        if (typeof window !== "undefined") {
          const storageKey = getStepStorageKey(contextType, hasTeamCredits);
          localStorage.removeItem(storageKey);

          // Also clear old keys for cleanup
          localStorage.removeItem("currentFormStep");

          console.log(`[Store] Cleared storage for ${storageKey}`);
        }

        set({
          currentStep: 0,
          previousStep: 0,
          shouldValidate: false,
          studioMessage: false,
          isSubmitting: false,
          errorDetails: null,
          isBuyingPlan: false,
          clothingError: "",
          backgroundsError: "",
        });
      },

      resetOrgAdmin: () =>
        set({
          inviteEmail: "",
          isInviting: false,
          sentInvitations: [],
          invitationsLoading: true,
          isBuyingCredits: null,
          organizationCredits: null,
          organizationCreditsLoading: true,
          organizationCreditsError: null,
        }),
    }),
    {
      name: "dashboard-store",
    }
  )
);

export default useDashboardStore;

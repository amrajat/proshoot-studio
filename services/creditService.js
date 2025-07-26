/**
 * Credit Service
 * Handles all credit-related operations with proper error handling and security
 */

import createSupabaseBrowserClient from "@/lib/supabase/browser-client";

/**
 * Fetch user credits from the database
 * @param {string} userId - User ID to fetch credits for
 * @returns {Promise<Object>} Credits object or null
 */
export const fetchUserCredits = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch credits");
  }

  const supabase = createSupabaseBrowserClient();

  try {
    const { data, error } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Credit fetch error:", error);
      throw new Error(`Failed to fetch credits: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching credits:", error);
    throw error;
  }
};

/**
 * Check if user has sufficient credits for a plan
 * @param {Object} credits - User credits object
 * @param {string} planType - Plan type (starter, professional, studio)
 * @param {number} requiredAmount - Required credit amount
 * @returns {boolean} Whether user has sufficient credits
 */
export const hasSufficientCredits = (credits, planType, requiredAmount = 1) => {
  if (!credits || !planType) return false;

  const availableCredits = credits[planType.toLowerCase()] || 0;
  return availableCredits >= requiredAmount;
};

/**
 * Get total available credits across all plan types
 * @param {Object} credits - User credits object
 * @returns {number} Total credits
 */
export const getTotalCredits = (credits) => {
  if (!credits) return 0;

  return (
    (credits.starter || 0) +
    (credits.professional || 0) +
    (credits.studio || 0) +
    (credits.team || 0) +
    (credits.balance || 0)
  );
};

/**
 * Check if user has any plan credits (excluding balance and team)
 * @param {Object} credits - User credits object
 * @returns {boolean} Whether user has plan credits
 */
export const hasPlanCredits = (credits) => {
  if (!credits) return false;

  return (
    (credits.starter || 0) > 0 ||
    (credits.professional || 0) > 0 ||
    (credits.studio || 0) > 0
  );
};

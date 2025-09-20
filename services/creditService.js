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
      throw new Error("Failed to fetch user credits");
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
 * @param {string} planType - Plan type (starter, professional, studio, balance)
 * @param {number} requiredAmount - Required credit amount
 * @returns {boolean} Whether user has sufficient credits
 */
export const hasSufficientCredits = (credits, planType, requiredAmount = 1) => {
  if (!credits || !planType) return false;

  const availableCredits = credits[planType.toLowerCase()] || 0;
  return availableCredits >= requiredAmount;
};

/**
 * Check if user has sufficient balance credits for AI operations
 * @param {Object} credits - User credits object
 * @param {number} requiredAmount - Required credit amount
 * @returns {boolean} Whether user has sufficient balance credits
 */
export const hasSufficientBalanceCredits = (credits, requiredAmount = 25) => {
  return hasSufficientCredits(credits, 'balance', requiredAmount);
};

/**
 * Get available balance credits
 * @param {Object} credits - User credits object
 * @returns {number} Available balance credits
 */
export const getBalanceCredits = (credits) => {
  if (!credits) return 0;
  return credits.balance || 0;
};

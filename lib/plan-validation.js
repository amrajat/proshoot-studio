"use server";

import { validatePlan, calculateSecurePrice, getClientPlanConfig, getAvailablePlansForContext } from "@/lib/plans";

/**
 * Server Action: Validate Plan and Calculate Pricing
 * @param {string} planKey - Plan identifier
 * @param {number} quantity - Requested quantity
 * @returns {Promise<Object>} Validation and pricing result
 */
export async function validatePlanAction(planKey, quantity = 1) {
  try {
    const validation = await validatePlan(planKey, quantity);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        code: validation.code,
      };
    }

    const pricing = await calculateSecurePrice(planKey, quantity);
    
    return {
      success: true,
      validation: {
        planKey,
        quantity: validation.quantity,
        valid: true,
      },
      pricing,
    };
  } catch (error) {
    console.error("Plan validation error:", error);
    return {
      success: false,
      error: "Failed to validate plan",
      code: "VALIDATION_ERROR",
    };
  }
}

/**
 * Server Action: Get Available Plans for Context
 * @param {string} context - "personal" or "team"
 * @returns {Promise<Object>} Available plans for the context
 */
export async function getPlansForContextAction(context) {
  try {
    const plans = await getAvailablePlansForContext(context);
    return {
      success: true,
      plans,
    };
  } catch (error) {
    console.error("Get plans error:", error);
    return {
      success: false,
      error: "Failed to get plans",
      plans: {},
    };
  }
}

/**
 * Server Action: Get Single Plan Configuration
 * @param {string} planKey - Plan identifier
 * @returns {Promise<Object>} Plan configuration
 */
export async function getPlanConfigAction(planKey) {
  try {
    const plan = await getClientPlanConfig(planKey);
    
    if (!plan) {
      return {
        success: false,
        error: "Plan not found",
        plan: null,
      };
    }

    return {
      success: true,
      plan,
    };
  } catch (error) {
    console.error("Get plan config error:", error);
    return {
      success: false,
      error: "Failed to get plan configuration",
      plan: null,
    };
  }
}

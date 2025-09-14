"use server";

/**
 * Server-Side Plan Configuration
 * Contains sensitive data like variant IDs and pricing validation
 * This file should NEVER be imported on the client side
 */

// Server-side plan configuration with sensitive data
const SERVER_PLANS = {
  starter: {
    planPrice: 35,
    variantID: 996929,
    totalHeadshots: 40,
    stylesLimit: 10,
    accountContext: "personal",
    mostPopular: false,
    maxQuantity: 100,
  },
  professional: {
    planPrice: 49,
    variantID: 996930,
    totalHeadshots: 60,
    stylesLimit: 20,
    accountContext: "personal",
    mostPopular: true,
    maxQuantity: 100,
  },
  studio: {
    planPrice: 59,
    variantID: 996931,
    totalHeadshots: 100,
    stylesLimit: 25,
    accountContext: "personal",
    mostPopular: false,
    maxQuantity: 100,
  },
  team: {
    planPrice: 49,
    variantID: 996932,
    totalHeadshots: 100,
    stylesLimit: 25,
    accountContext: "team",
    mostPopular: false,
    maxQuantity: 1000,
  },
};

// Team volume discounts (server-side only)
const TEAM_VOLUME_DISCOUNTS = [
  { minQuantity: 2, discount: 0 },
  { minQuantity: 5, discount: 0.1 },
  { minQuantity: 25, discount: 0.2 },
  { minQuantity: 100, discount: 0.3 },
];

/**
 * Validate plan configuration server-side
 * @param {string} planKey - Plan identifier
 * @param {number} quantity - Requested quantity
 * @returns {Object} Validation result with plan data or error
 */
export async function validatePlan(planKey, quantity = 1) {
  const serverPlans = await getServerPlans();
  const plan = serverPlans[planKey];
  if (!plan) {
    return {
      valid: false,
      error: `Invalid plan: ${planKey}`,
      code: "INVALID_PLAN",
    };
  }

  const numQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  // Check quantity limits
  if (numQuantity > plan.maxQuantity) {
    return {
      valid: false,
      error: `Quantity ${numQuantity} exceeds maximum allowed (${plan.maxQuantity}) for plan ${planKey}`,
      code: "QUANTITY_EXCEEDED",
    };
  }

  if (planKey === "team" && numQuantity < 2) {
    return {
      valid: false,
      error: "Team plan requires minimum 2 credits",
      code: "TEAM_MIN_QUANTITY",
    };
  }

  // Validate maximum quantity
  if (numQuantity > plan.maxQuantity) {
    return {
      valid: false,
      error: `Maximum quantity for ${planKey} plan is ${plan.maxQuantity}`,
      code: "MAX_QUANTITY_EXCEEDED",
    };
  }

  return {
    valid: true,
    plan,
    quantity: numQuantity,
  };
}

/**
 * Calculate pricing with server-side validation
 * @param {string} planKey - Plan identifier
 * @param {number} quantity - Requested quantity
 * @returns {Object} Pricing calculation result
 */
export async function calculateSecurePrice(planKey, quantity = 1) {
  const validation = await validatePlan(planKey, quantity);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { plan } = validation;
  const numQuantity = validation.quantity;

  const baseTotal = plan.planPrice * numQuantity;
  let discount = 0;
  let discountedPrice = null;

  // Apply volume discount for team plans
  if (planKey === "team" && numQuantity >= 2) {
    const teamDiscounts = await getTeamVolumeDiscounts();
    const applicableDiscount = [...teamDiscounts]
      .reverse()
      .find((tier) => numQuantity >= tier.minQuantity);

    if (applicableDiscount) {
      discount = applicableDiscount.discount;
    }
  }

  const savings = baseTotal * discount;
  const total = baseTotal - savings;

  // Calculate per-unit discounted price in cents for LemonSqueezy
  if (discount > 0) {
    discountedPrice = Math.round(plan.planPrice * 100 * (1 - discount));
  }

  return {
    planKey,
    quantity: numQuantity,
    basePrice: plan.planPrice,
    baseTotal: parseFloat(baseTotal.toFixed(2)),
    discount: parseFloat((discount * 100).toFixed(1)),
    savings: parseFloat(savings.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    discountedPrice, // In cents for LemonSqueezy
    variantID: plan.variantID,
  };
}

/**
 * Get client-safe plan configuration (without sensitive data)
 * @param {string} planKey - Plan identifier
 * @returns {Object} Client-safe plan data
 */
export async function getClientPlanConfig(planKey) {
  const serverPlans = await getServerPlans();
  const plan = serverPlans[planKey];
  if (!plan) {
    throw new Error(`Invalid plan: ${planKey}`);
  }

  // Return only client-safe data
  return {
    totalHeadshots: plan.totalHeadshots,
    stylesLimit: plan.stylesLimit,
    accountContext: plan.accountContext,
    mostPopular: plan.mostPopular,
    maxQuantity: plan.maxQuantity,
    // Note: variantID and planPrice are intentionally excluded
  };
}

/**
 * Get server plans data (for server-side use only)
 * @returns {Object} Server plans configuration
 */
export async function getServerPlans() {
  return SERVER_PLANS;
}

/**
 * Get team volume discounts (for server-side use only)
 * @returns {Array} Team volume discounts configuration
 */
export async function getTeamVolumeDiscounts() {
  return TEAM_VOLUME_DISCOUNTS;
}

/**
 * Get all available plans for a specific context (without sensitive data)
 * @param {string} context - "personal" or "team"
 * @returns {Object} Safe plan configurations for client
 */
export async function getAvailablePlansForContext(context) {
  const plans = {};
  const serverPlans = await getServerPlans();

  for (const planKey of Object.keys(serverPlans)) {
    const plan = serverPlans[planKey];

    if (context === "personal" && plan.accountContext === "personal") {
      plans[planKey] = await getClientPlanConfig(planKey);
    } else if (context === "team" && planKey === "team") {
      plans[planKey] = await getClientPlanConfig(planKey);
    }
  }

  return plans;
}

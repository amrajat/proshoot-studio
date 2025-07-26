"use server";

import {
  createCheckout,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import config from "@/config";

/**
 * Create Checkout URL Server Action
 * 
 * Creates a secure LemonSqueezy checkout session for the specified plan.
 * 
 * @param {string} plan - Plan name (key from config.PLANS)
 * @param {string} user - User ID for the checkout
 * @param {string} [email] - Optional user email for pre-filling checkout
 * @returns {Promise<string>} Checkout URL for redirection
 * 
 * @throws {Error} When environment variables are missing or invalid
 * @throws {Error} When LemonSqueezy API fails
 * @throws {Error} When plan configuration is invalid
 */
export async function createCheckoutUrl(plan, user, email) {
  // ===== ENVIRONMENT VALIDATION =====
  if (!process.env.LS_API_KEY) {
    throw new Error("Lemon Squeezy API key not set in environment variables.");
  }
  
  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    throw new Error("Lemon Squeezy Store ID not set in environment variables.");
  }
  
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set in environment variables.");
  }

  // ===== LEMONSQUEEZY SETUP =====
  lemonSqueezySetup({
    apiKey: process.env.LS_API_KEY,
  });

  // ===== CONFIGURATION VALIDATION =====
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  const planConfig = config.PLANS[plan];
  if (!planConfig || !planConfig.variantId) {
    throw new Error(`Invalid plan selected for checkout: ${plan}`);
  }

  try {
    // ===== CREATE CHECKOUT SESSION =====
    const checkout = await createCheckout(storeId, planConfig.variantId, {
      checkoutData: {
        email,
        custom: {
          user_id: user,
        },
      },
      productOptions: {
        redirectUrl: `${appUrl}/dashboard/studio/create?payment=success`,
        receiptButtonText: "Go to Studio",
        receiptThankYouNote: "Thank you for your purchase!",
      },
    });

    // ===== ERROR HANDLING =====
    if (checkout.error) {
      console.error("LemonSqueezy Error:", checkout.error);
      throw new Error(checkout.error.message || "Failed to create checkout.");
    }

    // ===== EXTRACT CHECKOUT URL =====
    const checkoutUrl = checkout.data?.data?.attributes?.url;
    
    if (!checkoutUrl) {
      throw new Error("Checkout URL not found in LemonSqueezy response.");
    }

    return checkoutUrl;
  } catch (error) {
    // ===== COMPREHENSIVE ERROR LOGGING =====
    console.error("Checkout creation failed:", {
      plan,
      user,
      email,
      error: error.message,
      stack: error.stack,
    });
    
    // Re-throw with user-friendly message
    throw new Error(
      error.message || "Failed to create checkout session. Please try again."
    );
  }
}

"use server";

import {
  createCheckout,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import config from "@/config";

/**
 * Create Checkout URL Server Action
 *
 * Creates a secure LemonSqueezy checkout session for the specified plan.
 * Authenticates user server-side for security.
 *
 * @param {string} plan - Plan name (key from config.PLANS)
 * @param {number} [quantity] - Quantity of credits to purchase (default: 1)
 * @param {Object} [customData] - Additional custom data for webhook
 * @param {string} [redirectUrl] - Custom redirect URL after successful payment
 * @returns {Promise<string>} Checkout URL for redirection
 *
 * @throws {Error} When user is not authenticated
 * @throws {Error} When environment variables are missing or invalid
 * @throws {Error} When LemonSqueezy API fails
 * @throws {Error} When plan configuration is invalid
 */
export async function createCheckoutUrl(
  plan,
  quantity = 1,
  customData = {},
  redirectUrl = null
) {
  // ===== ENVIRONMENT VALIDATION =====
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    throw new Error("Lemon Squeezy API key not set in environment variables.");
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    throw new Error("Lemon Squeezy Store ID not set in environment variables.");
  }

  if (!process.env.URL) {
    throw new Error("URL is not set in environment variables.");
  }

  // ===== AUTHENTICATE USER SERVER-SIDE =====
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("User authentication required");
  }

  const userId = user.id;
  const userEmail = user.email;

  // ===== LEMONSQUEEZY SETUP =====
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  });

  // ===== CONFIGURATION VALIDATION =====
  const storeId = parseInt(process.env.LEMONSQUEEZY_STORE_ID);
  const appUrl = process.env.URL;

  const planConfig = config.PLANS[plan];
  if (!planConfig || !planConfig.variantID) {
    throw new Error(`Invalid plan selected for checkout: ${plan}`);
  }

  // ===== TEAM VOLUME DISCOUNTS (SERVER-SIDE SECURITY) =====
  const TEAM_VOLUME_DISCOUNTS = [
    { minQuantity: 2, discount: 0 },
    { minQuantity: 5, discount: 0.1 },
    { minQuantity: 25, discount: 0.2 },
    { minQuantity: 100, discount: 0.3 },
  ];

  // Calculate custom price for team plans with volume discounts
  let customPrice = null;
  if (plan.toLowerCase() === "team" && quantity >= 5) {
    const applicableDiscount = [...TEAM_VOLUME_DISCOUNTS]
      .reverse()
      .find((tier) => quantity >= tier.minQuantity);

    if (applicableDiscount && applicableDiscount.discount > 0) {
      const basePrice = planConfig.planPrice * 100; // Convert to cents
      const discountedPrice = Math.round(
        basePrice * (1 - applicableDiscount.discount)
      );
      customPrice = discountedPrice;
    }
  }

  try {
    // ===== PREPARE CUSTOM DATA FOR WEBHOOK =====
    const webhookCustomData = {};

    // Only add string values to avoid validation errors
    if (plan) webhookCustomData.plan = String(plan);
    if (quantity) webhookCustomData.quantity = String(quantity);
    if (userId) webhookCustomData.user = String(userId);
    if (userEmail) webhookCustomData.email_id = String(userEmail);
    if (process.env.CUSTOM_WEBHOOK_SECRET) webhookCustomData.webhook_secret = String(process.env.CUSTOM_WEBHOOK_SECRET);

    // Add custom data, ensuring all values are strings
    Object.entries(customData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        webhookCustomData[key] =
          typeof value === "object" ? JSON.stringify(value) : String(value);
      }
    });

    // ===== DETERMINE REDIRECT URL =====
    const finalRedirectUrl =
      redirectUrl || `${appUrl}/dashboard/studio/create?payment=success`;

    // ===== CREATE CHECKOUT SESSION (OFFICIAL SDK FORMAT) =====
    const checkoutPayload = {
      // Apply custom price for team volume discounts (per-unit price in cents)
      ...(customPrice && { customPrice }),
      checkoutOptions: {
        embed: true,
        media: false,
        logo: true,
      },
      checkoutData: {
        email: userEmail || undefined,
        custom: webhookCustomData,
        variantQuantities: [
          {
            variantId: planConfig.variantID,
            quantity: Math.max(1, parseInt(quantity, 10) || 1),
          },
        ],
      },
      productOptions: {
        enabledVariants: [planConfig.variantID],
        redirectUrl: finalRedirectUrl,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for choosing Proshoot!",
      },
    };

    const checkout = await createCheckout(
      storeId,
      planConfig.variantID,
      checkoutPayload
    );

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
      userId,
      userEmail,
      quantity,
      error: error.message,
      stack: error.stack,
    });

    // Re-throw with user-friendly message
    throw new Error(
      error.message || "Failed to create checkout session. Please try again."
    );
  }
}

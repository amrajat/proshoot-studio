"use server";

import {
  createCheckout,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, getBaseUrlFromEnv, publicEnv } from "@/lib/env";
import { validatePlan, calculateSecurePrice } from "@/lib/plans";

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
  if (!env.LEMONSQUEEZY_API_KEY) {
    throw new Error("Lemon Squeezy API key not set in environment variables.");
  }

  if (!env.LEMONSQUEEZY_STORE_ID) {
    throw new Error("Lemon Squeezy Store ID not set in environment variables.");
  }

  // ===== AUTHENTICATE USER SERVER-SIDE =====
  const cookieStore = cookies();
  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error:", authError);
    throw new Error("User authentication required");
  }

  const userId = user.id;
  const userEmail = user.email;

  // ===== EXTRACT FIRSTPROMOTER COOKIES =====
  const firstPromoterReference = cookieStore.get("_fprom_ref")?.value || null;
  const firstPromoterTID = cookieStore.get("_fprom_tid")?.value || null;

  // ===== LEMONSQUEEZY SETUP =====
  lemonSqueezySetup({
    apiKey: env.LEMONSQUEEZY_API_KEY,
  });

  // ===== CONFIGURATION VALIDATION =====
  const storeId = parseInt(env.LEMONSQUEEZY_STORE_ID);
  const appUrl = getBaseUrlFromEnv();

  // Validate plan and calculate secure pricing server-side
  const validation = await validatePlan(plan, quantity);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const pricing = await calculateSecurePrice(plan, quantity);
  const { variantID, discountedPrice } = pricing;

  try {
    // ===== PREPARE CUSTOM DATA FOR WEBHOOK =====
    const webhookCustomData = {};

    // Only add string values to avoid validation errors
    if (plan) webhookCustomData.plan = String(plan);
    if (quantity) webhookCustomData.quantity = String(quantity);
    if (userId) webhookCustomData.user = String(userId);
    if (userEmail) webhookCustomData.email_id = String(userEmail);
    if (env.WEBHOOK_SECRET)
      webhookCustomData.webhook_secret = String(env.WEBHOOK_SECRET);

    // Add FirstPromoter data only if both values exist
    if (firstPromoterReference && firstPromoterTID) {
      webhookCustomData.firstPromoterReference = String(firstPromoterReference);
      webhookCustomData.firstPromoterTID = String(firstPromoterTID);
    }

    // Add custom data, ensuring all values are strings
    Object.entries(customData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        webhookCustomData[key] =
          typeof value === "object" ? JSON.stringify(value) : String(value);
      }
    });

    // ===== DETERMINE REDIRECT URL =====
    const finalRedirectUrl =
      redirectUrl || `${appUrl}/studio/create?payment=success`;

    // ===== CREATE CHECKOUT SESSION (OFFICIAL SDK FORMAT) =====
    const checkoutPayload = {
      // Apply custom price for team volume discounts (per-unit price in cents)
      ...(discountedPrice && { customPrice: discountedPrice }),
      checkoutOptions: {
        embed: true,
        media: false,
        logo: false,
      },
      checkoutData: {
        email: userEmail || undefined,
        custom: webhookCustomData,
        variantQuantities: [
          {
            variantId: variantID,
            quantity: Math.max(1, parseInt(quantity, 10) || 1),
          },
        ],
      },
      productOptions: {
        enabledVariants: [variantID],
        redirectUrl: finalRedirectUrl,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for choosing Proshoot!",
      },
    };

    const checkout = await createCheckout(
      storeId,
      variantID,
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

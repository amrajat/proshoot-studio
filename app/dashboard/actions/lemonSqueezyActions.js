"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createCheckout,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import { lemonsqueezy } from "@/config/lemonsqueezy";

/**
 * Create Supabase Server Action Client
 *
 * Creates a Supabase client for server actions with proper cookie handling.
 *
 * @returns {Object} Configured Supabase client
 */
const createServerActionClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Silently handle cookie setting errors
            console.warn("Failed to set cookie:", name, error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Silently handle cookie removal errors
            console.warn("Failed to remove cookie:", name, error);
          }
        },
      },
    }
  );
};

/**
 * Create Organization Credit Checkout Server Action
 *
 * Creates a LemonSqueezy checkout session for organization credit purchases:
 * - Validates user authentication and plan selection
 * - Sets up LemonSqueezy checkout with organization context
 * - Handles custom data for webhook processing
 * - Returns checkout URL for redirection
 *
 * @param {Object} params - Checkout parameters
 * @param {string} params.planId - Credit plan ID from config
 * @param {string} params.organizationId - Organization ID for credit allocation
 * @param {string} params.organizationName - Organization name for display
 * @param {string} [params.userFullName] - User's full name (optional)
 * @param {string} [params.userEmail] - User's email (optional, falls back to auth email)
 * @returns {Promise<Object>} Result with checkoutUrl or error message
 */
export async function createOrganizationCreditCheckoutAction(params) {
  // ===== ENVIRONMENT VALIDATION =====
  if (!process.env.LS_API_KEY) {
    throw new Error("LS_API_KEY is not set in environment variables");
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    throw new Error(
      "LEMONSQUEEZY_STORE_ID is not set in environment variables"
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set in environment variables");
  }

  // ===== LEMONSQUEEZY SETUP =====
  lemonSqueezySetup({
    apiKey: process.env.LS_API_KEY,
  });

  // ===== USER AUTHENTICATION =====
  const supabase = createServerActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "User not authenticated." };
  }

  // ===== PLAN VALIDATION =====
  const plan = lemonsqueezy.organizationCreditPlans.find(
    (p) => p.id === params.planId
  );

  if (!plan) {
    return { error: "Selected credit plan not found." };
  }

  // ===== URL CONFIGURATION =====
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const redirectUrl = `${baseUrl}/dashboard/organization?org_id=${params.organizationId}&payment_status=success`;
  const errorRedirectUrl = `${baseUrl}/dashboard/organization?org_id=${params.organizationId}&payment_status=error`;

  try {
    // ===== CREATE CHECKOUT SESSION =====
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID,
      plan.variantId,
      {
        checkoutData: {
          email: params.userEmail || user.email,
          custom: {
            user_id: user.id,
            organization_id: params.organizationId,
            credit_plan_id: plan.id, // For webhook processing
            credit_type: plan.credits.type,
            credit_amount: plan.credits.amount.toString(),
          },
        },
        productOptions: {
          name: plan.name,
          description: plan.description,
          redirectUrl: redirectUrl,
          receiptButtonText: "Go to Dashboard",
          receiptThankYouNote: `Thank you for purchasing credits for ${params.organizationName}!`,
        },
        checkoutOptions: {
          embed: false, // Redirect instead of overlay
          media: false,
          logo: true, // Show store logo
        },
      }
    );

    // ===== EXTRACT CHECKOUT URL =====
    const checkoutUrl =
      checkout.data?.data?.attributes?.url || checkout.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error("No checkout URL found in response:", checkout);
      return { error: "Failed to generate checkout URL." };
    }

    return { checkoutUrl };
  } catch (error) {
    // ===== COMPREHENSIVE ERROR HANDLING =====
    console.error("LemonSqueezy Create Checkout Error:", error);

    // Parse LemonSqueezy API error response
    let errorMessage = "Could not create checkout session.";

    if (error.response?.data?.errors?.[0]?.detail) {
      errorMessage = error.response.data.errors[0].detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log additional error details for debugging
    if (error.response) {
      console.error("LemonSqueezy API Response:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return { error: errorMessage };
  }
}

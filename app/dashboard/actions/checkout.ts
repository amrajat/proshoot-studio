"use server";

import {
  createCheckout,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import config from "@/config";

// Define the type for the plan keys to ensure type safety
type PlanName = keyof typeof config.PLANS;

export async function createCheckoutUrl(
  plan: PlanName,
  user: string,
  email?: string
): Promise<string> {
  if (!process.env.LS_API_KEY) {
    throw new Error("Lemon Squeezy API key not set in environment variables.");
  }
  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    throw new Error("Lemon Squeezy Store ID not set in environment variables.");
  }

  lemonSqueezySetup({
    apiKey: process.env.LS_API_KEY,
  });

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!storeId) {
    throw new Error(
      "LEMONSQUEEZY_STORE_ID is not set in environment variables."
    );
  }
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set in environment variables.");
  }

  const planConfig = config.PLANS[plan];
  if (!planConfig || !planConfig.variantId) {
    throw new Error("Invalid plan selected for checkout.");
  }

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

  if (checkout.error) {
    console.error("LemonSqueezy Error:", checkout.error);
    throw new Error(checkout.error.message || "Failed to create checkout.");
  }

  const checkoutUrl = checkout.data?.data.attributes.url;

  if (!checkoutUrl) {
    throw new Error("Checkout URL not found in LemonSqueezy response.");
  }

  return checkoutUrl;
}

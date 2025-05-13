"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { lemonSqueezySetup } from "@/lib/lemonsqueezy"; // Assuming you have this setup
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import {
  organizationCreditPlans,
  type CreditPlan,
} from "@/config/lemonsqueezyConfig";

const createServerActionClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );
};

interface CreateOrgCreditsCheckoutParams {
  planId: string; // Corresponds to CreditPlan.id
  organizationId: string;
  organizationName: string;
  userFullName?: string | null;
  userEmail?: string | null;
}

export async function createOrganizationCreditCheckoutAction(
  params: CreateOrgCreditsCheckoutParams
): Promise<{ checkoutUrl?: string; error?: string }> {
  lemonSqueezySetup(); // Initialize Lemon Squeezy client
  const supabase = createServerActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "User not authenticated." };
  }

  const plan = organizationCreditPlans.find((p) => p.id === params.planId);
  if (!plan) {
    return { error: "Selected credit plan not found." };
  }

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organization?org_id=${params.organizationId}&payment_status=success`;
  const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organization?org_id=${params.organizationId}&payment_status=error`;

  try {
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      plan.variantId,
      {
        checkoutData: {
          email: params.userEmail || user.email,
          custom: {
            user_id: user.id,
            organization_id: params.organizationId,
            credit_plan_id: plan.id, // To identify which credits to add in webhook
            credit_type: plan.credits.type,
            credit_amount: plan.credits.amount.toString(),
          },
        },
        productOptions: {
          name: plan.name,
          description: plan.description,
          redirectUrl: redirectUrl,
          // receiptButtonText: "Go to Dashboard", // Optional
          // receiptThankYouNote: `Thank you for purchasing credits for ${params.organizationName}!` //Optional
        },
        checkoutOptions: {
          // embed: false, // Set to true if using overlay, false for redirect
          // media: false,
          // logo: true, // Show store logo
        },
      }
    );
    const checkoutObject = checkout.data as any; // Type assertion to bypass linter temporarily
    // TODO: Verify the actual structure of the Checkout object from lemonsqueezy.js and update type access.
    // Common structures are checkout.data.attributes.url or checkout.data.url
    return { checkoutUrl: checkoutObject?.attributes?.url };
  } catch (error: any) {
    console.error("Lemon Squeezy Create Checkout Error:", error);
    // Attempt to parse Lemon Squeezy API error response
    const errorMessage =
      error.response?.data?.errors?.[0]?.detail ||
      error.message ||
      "Could not create checkout session.";
    // Redirect to an error page or show error on current page might be better UI
    // For now, returning error. Client can redirect to errorRedirectUrl if needed.
    return { error: errorMessage };
  }
}

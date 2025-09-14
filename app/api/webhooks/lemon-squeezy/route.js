import crypto from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env, publicEnv, getBaseUrlFromEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

// Constants
const STUDIO_PROCESSING_TIMEOUT = 45000;
const FIRSTPROMOTER_TIMEOUT = 10000;

// Response helpers
const createErrorResponse = (error, status = 400) => {
  return NextResponse.json({ error }, { status });
};

const createSuccessResponse = (data) => {
  return NextResponse.json({ success: true, ...data });
};

// Security helpers
const verifyWebhookSignature = (rawBody, signature) => {
  if (!signature || !env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error("Missing signature or webhook secret");
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET);
    hmac.update(rawBody, "utf8");
    const expectedSignature = hmac.digest("hex");

    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace(/^sha256=/, "");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(cleanSignature, "hex")
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// Main handler
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const webhookSignature = request.headers.get("x-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, webhookSignature)) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Parse webhook body
    let bodyObject;
    try {
      bodyObject = JSON.parse(rawBody);
    } catch (parseError) {
      // Handle empty body (duplicate Next.js call)
      if (rawBody.length === 0 || rawBody.trim() === "") {
        return createSuccessResponse({ message: "Empty body ignored" });
      }

      console.error("Webhook JSON parse error:", parseError.message);
      return createErrorResponse("Invalid JSON payload");
    }

    const { data: orderData, meta } = bodyObject;

    // Validate webhook event type
    if (meta.event_name !== "order_created") {
      return createSuccessResponse({ message: "Event ignored" });
    }

    // Validate order status
    if (orderData.attributes.status !== "paid") {
      return createSuccessResponse({ message: "Order not paid" });
    }

    // Extract custom data
    const {
      plan,
      quantity,
      user,
      email_id,
      first_promoter_reference,
      first_promoter_t_i_d,
      webhook_secret,
    } = meta.custom_data || {};

    // Validate custom webhook secret if provided
    if (webhook_secret && webhook_secret !== env.WEBHOOK_SECRET) {
      return createErrorResponse("Invalid custom webhook secret", 401);
    }

    // Validate required fields
    if (!user || !plan || !quantity) {
      return createErrorResponse("Missing required custom data");
    }

    const orderId = orderData.id;
    const orderAmount = orderData.attributes.total;
    const currency = orderData.attributes.currency;
    const creditsQuantity = parseInt(quantity, 10);

    console.log(`Processing order ${orderId} for user ${user}`);

    // Map plan to credit type
    const creditTypeMap = {
      starter: "STARTER",
      professional: "PROFESSIONAL",
      studio: "STUDIO",
      team: "TEAM",
    };

    const creditType = creditTypeMap[plan.toLowerCase()] || "BALANCE";

    // Create purchase record using RPC function (automatically handles credits)
    const { data: purchaseUserId, error: purchaseError } = await supabase.rpc(
      "create_purchase_record",
      {
        p_user_id: user,
        p_payment_provider: "LEMONSQUEEZY",
        p_provider_payment_id: orderId,
        p_amount: orderAmount,
        p_currency: currency,
        p_credits_granted: creditsQuantity,
        p_credits_type: creditType,
        p_status: "SUCCEEDED",
        p_metadata: {
          order_number: orderData.attributes.order_number,
          customer_email: email_id,
          plan: plan,
          lemon_squeezy_order: orderData,
          webhook_meta: meta,
        },
      }
    );

    if (purchaseError) {
      // Handle duplicate order (UNIQUE constraint violation)
      if (
        purchaseError.code === "23505" &&
        purchaseError.message.includes("provider_payment_id")
      ) {
        console.log(`Duplicate order detected: ${orderId}`);
        return createSuccessResponse({ message: "Duplicate order processed" });
      }

      console.error("Failed to create purchase record:", purchaseError);
      return createErrorResponse("Failed to create purchase record", 500);
    }

    console.log(`Purchase record created for ${purchaseUserId}`);

    // Handle Studio creation if studio_id exists
    if (
      meta.custom_data?.studio_id &&
      meta.custom_data?.source === "studio_create"
    ) {
      console.log(
        `Starting studio processing for ${meta.custom_data.studio_id}`
      );
      await handleStudioCreation({
        studioId: meta.custom_data.studio_id,
        user_id: user,
        signature: webhookSignature,
      });
    }

    // Handle FirstPromoter tracking if reference exists
    if (first_promoter_reference && first_promoter_t_i_d) {
      await handleFirstPromoterTracking({
        user,
        amount: orderAmount,
        eventId: orderId,
        refId: first_promoter_reference,
        tid: first_promoter_t_i_d,
      });
    }

    console.log(`Webhook processed successfully for order ${orderId}`);
    return createSuccessResponse({
      message: "Webhook processed successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

/**
 * Handle FirstPromoter affiliate tracking
 */
async function handleFirstPromoterTracking({
  user,
  amount,
  eventId,
  refId,
  tid,
}) {
  try {
    const params = new URLSearchParams({
      uid: user,
      amount: amount.toString(),
      event_id: eventId,
      ref_id: refId,
      tid: tid,
    });

    const response = await fetch(
      "https://firstpromoter.com/api/v1/track/sale",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": env.FIRSTPROMOTER_API_KEY,
        },
        body: params.toString(),
        signal: AbortSignal.timeout(FIRSTPROMOTER_TIMEOUT),
      }
    );

    if (!response.ok) {
      throw new Error(`FirstPromoter API error: ${response.status}`);
    }

    console.log("FirstPromoter tracking successful");
  } catch (error) {
    console.error("FirstPromoter tracking failed:", error);
    // Don't throw - affiliate tracking failures shouldn't break the webhook
  }
}

/**
 * Handle Studio creation processing
 */
async function handleStudioCreation({ studioId, user_id, signature }) {
  try {
    const response = await fetch(`${getBaseUrlFromEnv()}/api/studio/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": env.WEBHOOK_SECRET,
      },
      body: JSON.stringify({ studioId, user_id }),
      signal: AbortSignal.timeout(STUDIO_PROCESSING_TIMEOUT),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        // Handle HTML error responses (404, 500, etc.)
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `Studio processing failed: ${response.status} - ${errorText.substring(0, 200)}`
        );
      }
      throw new Error(
        errorData.error || `Studio processing failed: ${response.status}`
      );
    }

    const result = await response.json().catch(() => ({}));
    console.log("Studio processing completed:", result);
    return result;
  } catch (error) {
    console.error("Studio processing failed:", error);
    throw error;
  }
}

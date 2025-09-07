import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// Constants
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

// FirstPromoter refund tracking
const handleFirstPromoterRefund = async ({ user, amount, eventId }) => {
  if (!env.FIRSTPROMOTER_API_KEY) {
    console.log(
      "FirstPromoter API key not configured, skipping refund tracking"
    );
    return;
  }

  try {
    console.log(
      `Processing FirstPromoter refund for user ${user}, amount: ${amount}, eventId: ${eventId}`
    );

    const refundData = {
      uid: user,
      event_id: eventId,
      amount_cents: -Math.abs(amount),
    };

    const response = await fetch(
      "https://firstpromoter.com/api/v1/track/refund",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": env.FIRSTPROMOTER_API_KEY,
        },
        body: JSON.stringify(refundData),
        signal: AbortSignal.timeout(FIRSTPROMOTER_TIMEOUT),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FirstPromoter API error: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log(`FirstPromoter refund tracked successfully:`, result);

    return result;
  } catch (error) {
    console.error("FirstPromoter refund tracking failed:", error);
    // Don't throw - we don't want to fail the webhook for tracking issues
    return null;
  }
};

// Main POST handler
export async function POST(request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const webhookSignature = request.headers.get("x-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, webhookSignature)) {
      console.error("Invalid webhook signature");
      return createErrorResponse("Invalid signature", 401);
    }

    // Parse webhook data
    const webhookData = JSON.parse(rawBody);
    const { data, meta } = webhookData;

    // Validate webhook structure
    if (!data || !meta) {
      console.error("Invalid webhook structure");
      return createErrorResponse("Invalid webhook structure", 400);
    }

    // Extract order data
    const {
      id: orderId,
      attributes: {
        status,
        refunded,
        refunded_amount,
        user_email,
        total,
        refunded_at,
      },
    } = data;

    // Extract metadata
    const { event_name, custom_data = {} } = meta;

    // Validate this is a refund event
    if (event_name !== "order_refunded" || !refunded || status !== "refunded") {
      console.log(
        `Ignoring non-refund event: ${event_name}, status: ${status}, refunded: ${refunded}`
      );
      return createSuccessResponse({
        message: "Event ignored - not a refund",
        orderId: orderId,
      });
    }

    console.log(`Processing refund webhook for order ${orderId}`);
    console.log(`Refunded amount: ${refunded_amount}, User: ${user_email}`);

    // Extract FirstPromoter tracking data
    const { first_promoter_reference, first_promoter_t_i_d, user } =
      custom_data;

    // Handle FirstPromoter refund tracking if reference exists
    if (first_promoter_reference && first_promoter_t_i_d && user) {
      await handleFirstPromoterRefund({
        user: user,
        amount: refunded_amount,
        eventId: orderId,
      });
    } else {
      console.log(
        "No FirstPromoter tracking data found, skipping refund tracking"
      );
    }

    console.log(`Refund webhook processed successfully for order ${orderId}`);
    return createSuccessResponse({
      message: "Refund webhook processed successfully",
      orderId: orderId,
      refundedAmount: refunded_amount,
      refundedAt: refunded_at,
    });
  } catch (error) {
    console.error("Refund webhook processing error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

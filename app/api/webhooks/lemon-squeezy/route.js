import crypto from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Secure Lemon Squeezy Webhook Handler
 * Processes payment webhooks and updates database records
 */
export async function POST(request) {
  try {
    const cookieStore = cookies();

    const supabase = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const secret = process.env.LS_WB_SECRET;
    if (!secret) {
      console.error("❌ LS_WB_SECRET environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(
      request.headers.get("X-Signature") || "",
      "utf8"
    );

    if (!crypto.timingSafeEqual(digest, signature)) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook body
    const bodyObject = JSON.parse(rawBody);
    const { data: orderData, meta } = bodyObject;

    // Validate webhook event type
    if (meta.event_name !== "order_created") {
      console.log(`ℹ️ Ignoring webhook event: ${meta.event_name}`);
      return NextResponse.json({ message: "Event ignored" });
    }

    // Validate order status
    if (orderData.attributes.status !== "paid") {
      console.log(`ℹ️ Ignoring unpaid order: ${orderData.attributes.status}`);
      return NextResponse.json({ message: "Order not paid" });
    }

    // Extract custom data
    const {
      plan,
      quantity,
      user,
      email_id,
      first_promoter_reference,
      first_promoter_t_i_d,
      studioData,
      webhook_secret,
    } = meta.custom_data || {};

    // Additional webhook secret check (if provided in custom_data)
    if (
      webhook_secret &&
      webhook_secret !== process.env.CUSTOM_WEBHOOK_SECRET
    ) {
      console.error("❌ Invalid custom webhook secret");
      return NextResponse.json(
        { error: "Invalid custom webhook secret" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!user || !plan || !quantity) {
      console.error("❌ Missing required custom data fields", {
        user: !!user,
        plan: !!plan,
        quantity: !!quantity,
      });
      return NextResponse.json(
        { error: "Missing required custom data" },
        { status: 400 }
      );
    }

    const orderId = orderData.id;
    const orderAmount = orderData.attributes.total; // Amount in cents
    const currency = orderData.attributes.currency;
    const creditsQuantity = parseInt(quantity, 10);

    console.log(`💰 Processing order ${orderId} for user ${user}`);

    // Note: Duplicate prevention is handled by UNIQUE constraint on provider_payment_id
    // The RPC function will fail gracefully if duplicate is attempted

    // Map plan to credit type
    const creditTypeMap = {
      Basic: "STARTER",
      Professional: "PROFESSIONAL",
      Studio: "STUDIO",
      Team: "TEAM",
    };

    const creditType = creditTypeMap[plan] || "BALANCE";

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
      // Check if it's a duplicate order error (UNIQUE constraint violation)
      if (
        purchaseError.code === "23505" &&
        purchaseError.message.includes("provider_payment_id")
      ) {
        console.log(`⚠️ Duplicate order detected: ${orderId}`);
        return NextResponse.json(
          { message: "Duplicate order processed successfully" },
          { status: 200 }
        );
      }

      console.error("❌ Failed to create purchase record:", purchaseError);
      return NextResponse.json(
        { error: "Failed to create purchase record" },
        { status: 500 }
      );
    }

    console.log(
      `✅ Purchase record created, credits added, and transaction logged for purchase ${purchaseUserId}`
    );

    // Handle Studio creation if studioData exists
    if (studioData) {
      await handleStudioCreation({ studioData, user_id: user });
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

    console.log(`🎉 Webhook processed successfully for order ${orderId}`);
    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    console.log(`🔗 Tracking FirstPromoter sale for ref: ${refId}`);

    const params = new URLSearchParams();
    params.append("uid", user);
    params.append("amount", amount.toString());
    params.append("event_id", eventId);
    params.append("ref_id", refId);
    params.append("tid", tid);

    const response = await fetch(
      "https://firstpromoter.com/api/v1/track/sale",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": process.env.FIRSTPROMOTER_API_KEY,
        },
        body: params.toString(),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        console.log("✅ FirstPromoter tracking successful:", data);
      } catch (parseError) {
        console.log(
          "✅ FirstPromoter tracking successful (non-JSON response):",
          text
        );
      }
    } else {
      console.log("✅ FirstPromoter tracking successful (empty response)");
    }
  } catch (error) {
    console.error("❌ FirstPromoter tracking failed:", error);
    // Don't throw - we don't want affiliate tracking failures to break the webhook
  }
}

/**
 * Handle Studio creation using the same API as ImageUploadStep
 */
async function handleStudioCreation({ studioData, user_id }) {
  try {
    const response = await fetch(`${process.env.URL}/api/studio/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studioData,
        user_id,
      }),
      // Add timeout to prevent webhook hanging
      signal: AbortSignal.timeout(45000), // 45 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          `Studio creation failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`✅ Studio created via webhook: ${data.studioId}`);
    return data;
  } catch (error) {
    console.error("❌ Studio creation via webhook failed:", error);
    // Don't throw - we don't want studio creation failures to break the webhook
    // The payment has already been processed successfully
  }
}

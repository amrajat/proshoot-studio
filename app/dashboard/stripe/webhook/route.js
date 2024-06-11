import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
// async function processEvent(event) {
//   let processingError = "";

//   const customData = event.body["meta"]["custom_data"] || null;

//   if (!customData || !customData["user_id"]) {
//     processingError = "No user ID, can't process";
//   } else {
//     const obj = event.body["data"];

//     if (event.eventName.startsWith("subscription_payment_")) {
//       // Save subscription invoices; obj is a "Subscription invoice"
//       /* Not implemented */
//     } else if (event.eventName.startsWith("subscription_")) {
//       // Save subscriptions; obj is a "Subscription"

//       const data = obj["attributes"];

//       // We assume the Plan table is up to date
//       const plan = await prisma.plan.findUnique({
//         where: {
//           variantId: data["variant_id"],
//         },
//       });

//       if (!plan) {
//         processingError =
//           "Plan not found in DB. Could not process webhook event.";
//       } else {
//         // Update the subscription

//         const lemonSqueezyId = parseInt(obj["id"]);

//         // Get subscription's Price object
//         // We save the Price value to the subscription so we can display it in the UI
//         let priceData = await ls.getPrice({
//           id: data["first_subscription_item"]["price_id"],
//         });

//         const updateData = {
//           orderId: data["order_id"],
//           name: data["user_name"],
//           email: data["user_email"],
//           status: data["status"],
//           renewsAt: data["renews_at"],
//           endsAt: data["ends_at"],
//           trialEndsAt: data["trial_ends_at"],
//           planId: plan["id"],
//           userId: customData["user_id"],
//           price: priceData["data"]["attributes"]["unit_price"],
//           subscriptionItemId: data["first_subscription_item"]["id"],
//           // Save this for usage-based billing reporting; no need to if you use quantity-based billing
//           isUsageBased: data["first_subscription_item"]["is_usage_based"],
//         };

//         const createData = updateData;
//         createData.lemonSqueezyId = lemonSqueezyId;
//         createData.price = plan.price;

//         try {
//           // Create/update subscription
//           await prisma.subscription.upsert({
//             where: {
//               lemonSqueezyId: lemonSqueezyId,
//             },
//             update: updateData,
//             create: createData,
//           });
//         } catch (error) {
//           processingError = error;
//           console.log(error);
//         }
//       }
//     } else if (event.eventName.startsWith("order_")) {
//       // Save orders; obj is a "Order"
//       /* Not implemented */
//     } else if (event.eventName.startsWith("license_")) {
//       // Save license keys; obj is a "License key"
//       /* Not implemented */
//     }

//     try {
//       // Mark event as processed
//       await prisma.webhookEvent.update({
//         where: {
//           id: event.id,
//         },
//         data: {
//           processed: true,
//           processingError,
//         },
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }
export const dynamic = "force-dynamic";

export async function POST(request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
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

  // Make sure request is from Lemon Squeezy
  const rawBody = await request.text();

  const secret = process.env.LS_WB_SECRET;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(
    request.headers.get("X-Signature") || "",
    "utf8"
  );

  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error("Invalid signature.");
  }

  // Now save the event

  const bodyObject = JSON.parse(rawBody);
  const { plan, quantity, user, email_id } = bodyObject["meta"]["custom_data"];

  // Start....First check if payment id is not already updated to avoid duplicate entries/credits to the database.

  let {
    data: [{ purchase_history = [] } = {}],
  } = await supabase.from("users").select("purchase_history").eq("id", user);

  if (purchase_history.length > 0) {
    const isDuplicateEntry = purchase_history.find(
      (paymentObject) =>
        Number(paymentObject.session) === Number(bodyObject["data"]["id"])
    );
    if (isDuplicateEntry)
      return NextResponse.json({ message: "Duplicate Entry" }, { status: 403 });
  }

  // End......First check if payment id is not already updated to avoid duplicate entries/credits to the database.

  const transaction_data = {
    plan,
    qty: Number(quantity),
    timestamp: new Date().toISOString(),
    session: bodyObject["data"]["id"],
  };

  let { data, error } = await supabase.rpc("add_purchase_history", {
    transaction_data: transaction_data,
    user_id: user,
  });

  if (!error) {
    const {
      data: [{ credits }],
      error: creditsError,
    } = await supabase.from("users").select("credits").eq("id", user);

    if (!creditsError) {
      credits[plan] = credits[plan] + Number(quantity);
      const { data: updatedData, error: updateError } = await supabase
        .from("users")
        .update({ credits: credits })
        .eq("id", user);
    }
  }

  // Process the event
  // This could be done out of the main thread

  // processEvent(event);

  return new Response("Done");
}

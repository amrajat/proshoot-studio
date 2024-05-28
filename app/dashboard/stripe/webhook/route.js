import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { performance } from "node:perf_hooks";

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
  const startTime = performance.now();
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

  const endTime = performance.now();
  console.log("Lemon Squeezy webhook took this time", endTime - startTime);

  return new Response("Done");
}

// Stripe starts here.

// import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
// import Stripe from "stripe";
// import { streamToString } from "@/lib/utils";
// const checkout_session_completed = "checkout.session.completed";

// export const dynamic = "force-dynamic";

// export async function POST(req, res) {
//   const cookieStore = cookies();

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SECRET_KEY,
//     {
//       cookies: {
//         get(name) {
//           return cookieStore.get(name)?.value;
//         },
//         set(name, value, options) {
//           cookieStore.set({ name, value, ...options });
//         },
//         remove(name, options) {
//           cookieStore.set({ name, value: "", ...options });
//         },
//       },
//     }
//   );
//   const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
//     apiVersion: "2023-10-16",
//   });
//   const webhookSecret = `${process.env.STRIPE_WEBHOOK_SECRET}`;
//   const sig = req.headers.get("stripe-signature");

//   // const reqBody = await req.text();
//   const reqBody = await streamToString(req.body);
//   console.log("reqBody", reqBody);
//   // const reqBody = await buffer(req);

//   let event;
//   console.log(sig, webhookSecret);

//   try {
//     if (!sig || !webhookSecret) return;
//     event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
//     console.log(event);
//   } catch (error) {
//     console.log(error, JSON.stringify(error));
//     return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
//   }

//   switch (event.type) {
//     case checkout_session_completed:
//       const session = event.data.object;

//       const {
//         // @ts-ignore
//         metadata: { user, plan, quantity },
//       } = session;
//       const transaction_data = {
//         plan,
//         qty: Number(quantity),
//         timestamp: new Date().toISOString(),
//         session: session.id,
//       };

//       let { data, error } = await supabase.rpc("add_purchase_history", {
//         transaction_data: transaction_data,
//         user_id: user,
//       });

//       if (!error) {
//         const {
//           data: [{ credits }],
//           error: creditsError,
//         } = await supabase.from("users").select("credits").eq("id", user);

//         if (!creditsError) {
//           credits[plan] = credits[plan] + Number(quantity);
//           const { data: updatedData, error: updateError } = await supabase
//             .from("users")
//             .update({ credits: credits })
//             .eq("id", user);
//         }
//       }

//       return NextResponse.json("Booking successful", {
//         status: 200,
//         statusText: "Booking Successful",
//       });

//     default:
//   }

//   return NextResponse.json("Event Received", {
//     status: 200,
//     statusText: "Event Received",
//   });
// }

// Stripe Ends here

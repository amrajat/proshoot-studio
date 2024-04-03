import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";
const checkout_session_completed = "checkout.session.completed";
// FOR WEBHOOK TESTING ON STRIPE TERMINAL
// stripe trigger checkout.session.completed
// stripe listen --forward-to localhost:3000/dashboard/stripe/webhook --skip-verify
// const checkout_session_completed = "product.created";

export async function POST(req, res) {
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
  const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
    apiVersion: "2023-10-16",
  });
  const webhookSecret = `${process.env.STRIPE_WEBHOOK_SECRET}`;
  const sig = req.headers.get("stripe-signature");

  const reqBody = await req.text();
  // const reqBody = await buffer(req);

  let event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }

  switch (event.type) {
    case checkout_session_completed:
      const session = event.data.object;

      const {
        // @ts-ignore
        metadata: { user, plan, quantity },
      } = session;
      const transaction_data = {
        plan,
        qty: Number(quantity),
        timestamp: new Date().toISOString(),
        session: session.id,
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

      return NextResponse.json("Booking successful", {
        status: 200,
        statusText: "Booking Successful",
      });

    default:
  }

  return NextResponse.json("Event Received", {
    status: 200,
    statusText: "Event Received",
  });
}

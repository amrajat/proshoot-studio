import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";
// stripe trigger checkout.session.completed
const checkout_session_completed = "checkout.session.completed";
// stripe listen --forward-to localhost:3000/dashboard/stripe/webhook --skip-verify
// const checkout_session_completed = "product.created";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2023-10-16",
});

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

  const reqBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }

  // load our event
  console.log(event.type);
  switch (event.type) {
    case checkout_session_completed:
      const session = event.data.object;

      const {
        // @ts-ignore
        metadata: { user, plan, planType, quantity },
      } = session;
      const transaction_data = {
        plan: plan,
        planType,
        qty: Number(quantity),
        timestamp: new Date().toISOString(),
        session: [session.id, session.payment_intent],
      };
      let { data, error } = await supabase.rpc("add_purchase_history", {
        transaction_data: transaction_data,
        user_id: user,
      });

      if (error) console.error(error);
      else console.log(data);

      // FIXME: update the credits of the users.table from supabase accordingly

      return NextResponse.json("Booking successful", {
        status: 200,
        statusText: "Booking Successful",
      });

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json("Event Received", {
    status: 200,
    statusText: "Event Received",
  });
}

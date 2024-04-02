import Stripe from "stripe";

import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/supabase/actions/server";
import { PLANS } from "@/lib/data";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2023-10-16",
});

export async function POST(req, res) {
  const { plan, quantity } = await req.json();

  if (
    !Object.keys(PLANS).includes(plan) ||
    !quantity ||
    PLANS[plan]["planPrice"] <= 0
  ) {
    return new NextResponse("Please all fields are required", { status: 400 });
  }

  const origin = req.headers.get("origin");

  const { session } = await getCurrentSession();

  if (!session) {
    return new NextResponse("Authentication required", { status: 400 });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: quantity,
          price_data: {
            currency: "usd",
            product_data: {
              name: plan,
            },
            unit_amount: parseInt((PLANS[plan].planPrice * 100).toString()),
          },
        },
      ],
      payment_method_types: ["card"],
      customer_email: session.user.email,
      billing_address_collection: "auto",
      success_url: `${origin}/dashboard/studio/create`,
      metadata: {
        user: session.user.id,
        plan: plan,
        quantity: quantity.toString(),
      },
    });

    return NextResponse.json(stripeSession, {
      status: 200,
      statusText: "Payment session created",
    });
  } catch (error) {
    console.log("Payment failed", error);
    return new NextResponse(error, { status: 500 });
  }
}

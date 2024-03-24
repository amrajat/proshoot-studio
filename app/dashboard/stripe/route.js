import Stripe from "stripe";

import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/supabase/actions/server";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2023-10-16",
});
const PLANS = [
  {
    planName: "Basic",
    planPrice: 21,
    headshots: 20,
    features: ["f11", "f12", "f13"],
    description:
      "this is going to be an brief explanation of the plan and product.",
  },
  {
    planName: "Standard",
    planPrice: 39,
    headshots: 40,
    features: ["f21", "f22", "f23"],
    description:
      "this is going to be an brief explanation of the plan and product.",
  },
  {
    planName: "Premium",
    planPrice: 59,
    headshots: 100,
    features: ["f31", "f32", "f33"],
    description:
      "this is going to be an brief explanation of the plan and product.",
  },
];

export async function POST(req, res) {
  const { plan, planType, quantity } = await req.json();
  console.log(plan, planType, quantity);

  if (planType !== "Individual" && planType !== "Team") {
    console.log(planType !== "Individual", planType !== "Team");
    return new NextResponse("planType: Please all fields are required", {
      status: 400,
    });
  }

  if (plan < 0 || !planType || !quantity || plan.planPrice < 0) {
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
              name: PLANS[plan].planName,
              // FIXME: Need to update the image
              // images: [
              //   "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/avatars/avatar--0.060672491453946265-Jeeja@2x.png",
              // ],
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
        plan: JSON.stringify(PLANS[plan]),
        planType: planType.toString(),
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

import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
// const checkout_session_completed = "checkout.session.completed";
// FOR WEBHOOK TESTING ON STRIPE TERMINAL
// stripe trigger checkout.session.completed
// stripe listen --forward-to localhost:3000/dashboard/stripe/webhook --skip-verify
// const checkout_session_completed = "product.created";

export async function POST(req, res) {
  // const cookieStore = cookies();
  const { user_id, user_email } = await req.query;
  const studioObject = await req.body;
  // formData.append('tune[callback]', 'https://optional-callback-url.com/webhooks/studio?user_id=1&user_email=1');
  const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
  // const supabase = createServerClient(
  //   `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
  //   `${process.env.SUPABASE_SECRET_KEY}`,
  //   {
  //     cookies: {
  //       get(name) {
  //         return cookieStore.get(name)?.value;
  //       },
  //       set(name, value, options) {
  //         cookieStore.set({ name, value, ...options });
  //       },
  //       remove(name, options) {
  //         cookieStore.set({ name, value: "", ...options });
  //       },
  //     },
  //   }
  // );

  try {
    if (!user_id || !user_email) return;
    // Send email to customer
    // grab the tune id  retrive all the prompts form astria and put the prompts array object into subabase
    //  and and get array of "images" and loop over the arrays and put those images
    // into supabase storage with studio and prompt mapping.

    const headers = { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` };
    const response = await fetch(
      `https://api.astria.ai/tunes/${studioObject.id}/prompts`,
      {
        headers: headers,
      }
    );
    const prompts = await response.json();
    const data = await resend.emails.send({
      from: "Headsshot <team@headsshot.com>",
      to: [user_email],
      subject: "Your Studio is Ready! 🎉",
      html: `<p>Your studio is ready. user: ${user_id} , studio: ${
        studioObject?.id
      }, prompts: ${JSON.stringify(prompts)}, studioObject: ${JSON.stringify(
        studioObject
      )}</p>`,
    });

    // return Response.json(data);
  } catch (error) {
    return new NextResponse(`Studio Webhook Error: ${error.message}`, {
      status: 500,
    });
  }

  // switch (event.type) {
  //   case checkout_session_completed:
  //     const session = event.data.object;

  //     const {
  //       // @ts-ignore
  //       metadata: { user, plan, quantity },
  //     } = session;
  //     const transaction_data = {
  //       plan,
  //       qty: Number(quantity),
  //       timestamp: new Date().toISOString(),
  //       session: session.id,
  //     };

  //     let { data, error } = await supabase.rpc("add_purchase_history", {
  //       transaction_data: transaction_data,
  //       user_id: user,
  //     });

  //     if (!error) {
  //       const {
  //         data: [{ credits }],
  //         error: creditsError,
  //       } = await supabase.from("users").select("credits").eq("id", user);

  //       if (!creditsError) {
  //         credits[plan] = credits[plan] + Number(quantity);
  //         const { data: updatedData, error: updateError } = await supabase
  //           .from("users")
  //           .update({ credits: credits })
  //           .eq("id", user);
  //       }
  //     }

  //     return NextResponse.json("Booking successful", {
  //       status: 200,
  //       statusText: "Booking Successful",
  //     });

  //   default:
  // }

  return NextResponse.json("Studio Webhook Success", {
    status: 200,
    statusText: "Studio Finished Tuning.",
  });
}

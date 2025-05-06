import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

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
  const {
    plan,
    quantity,
    user,
    email_id,
    first_promoter_reference,
    first_promoter_t_i_d,
  } = bodyObject["meta"]["custom_data"];

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

  // Send post request to first-promoter

  const params = new URLSearchParams();
  params.append("uid", user);
  params.append("amount", bodyObject["data"]["attributes"]["total"]);
  params.append("event_id", bodyObject["data"]["id"]);
  params.append("ref_id", first_promoter_reference);
  params.append("tid", first_promoter_t_i_d);

  console.log(
    "route handler webhook",
    first_promoter_reference,
    first_promoter_t_i_d
  );

  const trackSale = async () => {
    try {
      const response = await fetch(
        "https://firstpromoter.com/api/v1/track/sale",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-api-key": process.env.FIRSTPROMOTER_API_KEY,
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        return;
      }

      // Handle empty response
      const text = await response.text();
      if (!text) {
        console.log("FirstPromoter tracking successful (empty response)");
        return;
      }

      try {
        const data = JSON.parse(text);
        console.log("FirstPromoter tracking successful:", data);
      } catch (parseError) {
        console.error("Failed to parse FirstPromoter response:", text);
      }
    } catch (error) {
      console.error("FirstPromoter tracking failed:", error);
      // Continue execution - don't let tracking failures affect the main flow
    }
  };

  // Call the function
  if (first_promoter_reference) await trackSale();

  return new Response("Done");
}

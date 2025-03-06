import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";

// Initialize Resend with API key
const url = process.env.ZOHO_ZEPTOMAIL_URL;
const token = process.env.ZOHO_ZEPTOMAIL_TOKEN;
const eMailClient = new SendMailClient({ url, token });

// Webhook secret for verification
const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

// Rate limiting map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 requests per minute

// interface WebhookPayload {
//   type: "INSERT" | "UPDATE" | "DELETE";
//   table: string;
//   record: {
//     id: string,
//     email: string,
//     raw_user_meta_data: {
//       username?: string,
//     },
//     created_at: string,
//   };
//   schema: string;
// }

// Rate limiting function
function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

export async function GET(request) {
  try {
    // Get client IP for rate limiting
    const headersList = headers();
    const clientIp = headersList.get("x-forwarded-for") || "unknown";

    // Check rate limit
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Verify webhook signature
    // const signature = headersList.get("x-webhook-signature");
    // if (!signature || signature !== webhookSecret) {
    //   return NextResponse.json(
    //     { error: "Invalid webhook signature" },
    //     { status: 401 }
    //   );
    // }

    const payload = await request.json();

    // Only process new user insertions
    if (payload.type !== "INSERT" || payload.table !== "users") {
      return NextResponse.json({ status: "ignored" });
    }

    // Extract user information
    const { email, raw_user_meta_data } = payload.record;
    const username = raw_user_meta_data?.username || email.split("@")[0];

    // Send welcome email
    // await resend.emails.send({
    //   from: "Proshoot <welcome@proshoot.co>",
    //   to: email,
    //   subject: "Welcome to Proshoot! 🎉",
    //   react: WelcomeEmail({ username }),
    // });

    await eMailClient
      .sendMailWithTemplate({
        mail_template_key:
          "2518b.55dd124be7f45b04.k1.fa0ee950-f9db-11ef-bc61-525400b0b0f3.19567102465",
        from: {
          address: "noreply@proshoot.co",
          name: "noreply",
        },
        to: [
          {
            email_address: {
              address: "ablognet@gmail.com",
              name: "Support",
            },
          },
        ],
        merge_info: {
          "product name": "product name_value",
          product: "product_value",
          "support id": "support id_value",
          brand: "brand_value",
          username: "username_value",
        },
        subject: "Test Email",
      })
      .then((resp) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    return NextResponse.json(
      { status: "success", message: "Welcome email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

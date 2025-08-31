import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import { env } from "@/lib/env";

// Initialize Resend with API key
const url = env.ZOHO_ZEPTOMAIL_URL;
const token = env.ZOHO_ZEPTOMAIL_TOKEN;
const eMailClient = new SendMailClient({ url, token });

// Rate limiting map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 requests per minute

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

export async function POST(request) {
  // verify webhook secret using search params
  const secret = request.nextUrl.searchParams.get("SUPABASE_WEBHOOK_SECRET");
  if (secret !== env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Invalid Webhook Secret" },
      { status: 401 }
    );
  }

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

    const payload = await request.json();

    // Only process new user insertions
    if (payload.type !== "INSERT" || payload.table !== "users") {
      return NextResponse.json({ status: "ignored" });
    }

    // Extract user information
    const { email, raw_user_meta_data } = payload.record;
    const firstName =
      raw_user_meta_data?.full_name?.split(" ")[0] || email.split("@")[0];
    const fullName = raw_user_meta_data?.full_name || email;

    await eMailClient.sendMailWithTemplate({
      mail_template_key:
        "2518b.55dd124be7f45b04.k1.fa0ee950-f9db-11ef-bc61-525400b0b0f3.19567102465",
      from: {
        address: "rajat@proshoot.co",
        name: "Rajat",
      },
      to: [
        {
          email_address: {
            address: email,
            name: fullName,
          },
        },
      ],
      merge_info: {
        user_name: firstName,
      },
    });

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

//generate a random string for the webhook secret 32 characters long secure and unique
function generateRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

console.log(generateRandomString(32));

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA token required",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA verification service unavailable",
        },
        { status: 500 }
      );
    }

    // Get client IP for additional validation
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Verify token with Cloudflare Turnstile
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: clientIP,
        }),
      }
    );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA verification failed",
        },
        { status: 500 }
      );
    }

    const result = await verifyResponse.json();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "CAPTCHA verified successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA verification failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "CAPTCHA verification service error",
      },
      { status: 500 }
    );
  }
}

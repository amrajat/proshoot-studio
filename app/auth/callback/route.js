import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/"; // Default redirect to root
  const error_description = searchParams.get("error_description");

  if (error_description) {
    console.error("Supabase Auth Callback Error:", error_description);
    // Redirect with generic error message to prevent information leakage
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Authentication failed. Please try again.")}`
    );
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      console.error("Supabase Code Exchange Error:", exchangeError.message);
      // Redirect with generic error message to prevent information leakage
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("Authentication failed. Please try again.")}`
      );
    }
  }

  // After successful OAuth or if it's an OTP redirect without a code (session handled by client-side verifyOtp)
  // Strict validation to prevent open redirect vulnerabilities
  const safeNext = (next && 
                   next.startsWith("/") && 
                   !next.startsWith("//") && 
                   !next.includes(":") &&
                   next.length < 200) ? next : "/";
  console.log(`Redirecting to: ${origin}${safeNext}`);
  return NextResponse.redirect(`${origin}${safeNext}`);
}

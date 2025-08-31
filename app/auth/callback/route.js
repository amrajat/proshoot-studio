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
    // Redirect to a generic error page or login page with an error message
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error_description)}`
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
      // Redirect to an error page or login page with an error message
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // After successful OAuth or if it's an OTP redirect without a code (session handled by client-side verifyOtp)
  // Ensure 'next' is a relative path to prevent open redirect vulnerabilities
  const safeNext = next.startsWith("/") ? next : "/";
  console.log(`Redirecting to: ${origin}${safeNext}`);
  return NextResponse.redirect(`${origin}${safeNext}`);
}

// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// // import createSupabaseServerClient from "@/lib/supabase/server";

// export async function GET(request) {
//   // The `/auth/callback` route is required for the server-side auth flow implemented
//   // by the Auth Helpers package. It exchanges an auth code for the user's session.
//   // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
//   const requestUrl = new URL(request.url);
//   // const code = requestUrl.searchParams.get("code");
//   // console.log("this has been called", code);

//   // if (code) {
//   //   const cookieStore = cookies();
//   //   const supabase = createSupabaseServerClient(cookieStore);
//   //   await supabase.auth.exchangeCodeForSession(code);
//   // }

//   // URL to redirect to after sign in process completes
//   return NextResponse.redirect(new URL("/auth", request.url));
// }

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

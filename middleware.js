import { getCurrentSession } from "@/lib/supabase/actions/server";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const { session } = await getCurrentSession();
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith(`/dashboard/stripe/webhook`) ||
    pathname.startsWith(`/dashboard/webhooks`) ||
    pathname.startsWith(`/auth/callback`)
  ) {
    // Allow access to the requested path
    return NextResponse.next();
  }

  // Check if the user is authenticated and trying to access a protected path
  if (pathname.startsWith(`/dashboard`) && !session) {
    // Redirect the user to the /auth page if not authenticated
    return NextResponse.redirect(new URL(`/auth`, request.url));
  }

  // If the user is not authenticated and trying to access the /auth page
  if (pathname.startsWith(`/auth`) && session) {
    // Redirect the user to the /dashboard page if authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the user is authenticated and trying to access any other path
  if (session) {
    // Allow access to the requested path

    return NextResponse.next();
  }

  // For all other cases, allow the request to continue
  // return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
    "/auth",
  ],
};

import { getCurrentSession } from "@/lib/supabase/actions/server";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication checks
    if (
      pathname.startsWith(`/dashboard/stripe/webhook`) ||
      pathname.startsWith(`/dashboard/webhooks`) ||
      pathname.startsWith(`/auth/callback`)
    ) {
      // Allow access to the requested path
      return NextResponse.next();
    }

    // Get session with error handling
    let session;
    try {
      const sessionData = await getCurrentSession();
      session = sessionData.session;
    } catch (error) {
      // Log the error but don't crash the middleware
      console.error("Session retrieval error:", error);
      Sentry.captureException(error);

      // If we can't verify the session, redirect to auth for protected routes
      if (pathname.startsWith(`/dashboard`)) {
        return NextResponse.redirect(new URL(`/auth`, request.url));
      }

      // For other routes, allow the request to continue
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
    return NextResponse.next();
  } catch (error) {
    // Catch any unexpected errors to prevent middleware from crashing
    console.error("Middleware error:", error);
    Sentry.captureException(error);

    // Default to allowing the request rather than breaking the application
    return NextResponse.next();
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
    "/auth",
  ],
};

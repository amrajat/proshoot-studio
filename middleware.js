import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import * as Sentry from "@sentry/nextjs";

// Helper function to validate internal redirect paths
function isValidInternalPath(path) {
  if (!path || typeof path !== 'string') return false;
  // Must start with / but not //
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  // Must not contain backslashes (prevents /\evil.com)
  if (path.includes('\\')) return false;
  // Must not be a protocol (prevents javascript:, data:, etc.)
  if (path.includes(':')) return false;
  return true;
}

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;
  const response = NextResponse.next();
  
  // Set pathname header for dynamic metadata generation
  response.headers.set('x-pathname', pathname);

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (error) {
    console.error('Middleware: Failed to get user:', error);
    Sentry.captureException(error);
    // Continue without user - will be treated as unauthenticated
  }

  // Define public and auth routes
  const publicRoutes = ["/", "/pricing", "/terms", "/privacy"];
  const authRoutes = ["/auth", "/auth/callback"];
  const publicApiRoutes = ["/api/webhooks", "/api/auth", "/api/prompts", "/api/studio/process", "/api/monitoring", "/ps-data"]; // Only specific API routes are public
  const isPublicRoute =
    publicRoutes.some(
      (route) =>
        pathname === route ||
        (route !== "/" && pathname.startsWith(route + "/"))
    ) || publicApiRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!user && !isPublicRoute && !isAuthRoute) {
    // User is not logged in and trying to access a protected route
    // Store the intended URL to redirect after login
    const redirectTo = `${origin}/auth?next=${encodeURIComponent(pathname)}${
      request.nextUrl.search
    }`;
    return NextResponse.redirect(redirectTo);
  }

  if (user && isAuthRoute && pathname !== "/auth/callback") {
    // User is logged in but trying to access /auth page (not callback)
    // Redirect them to root or their intended 'next' page if available
    const nextUrl = request.nextUrl.searchParams.get("next") || "/";
    // Secure redirect validation - only allow internal paths
    const safeNextUrl = isValidInternalPath(nextUrl) ? nextUrl : "/";
    return NextResponse.redirect(`${origin}${safeNextUrl}`);
  }

  // For One Tap: If the user is trying to access a specific page and gets logged in via One Tap,
  // the One Tap component itself will handle the redirect to 'redirectToAfterLogin' from sessionStorage.
  // This middleware primarily handles direct navigation and OAuth/OTP flows.

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (if you have a public /images folder)
     * - ps-data (PostHog proxy - must bypass middleware completely)
       */
    "/((?!_next/static|_next/image|favicon.ico|images|ps-data).*)",
  ],
};

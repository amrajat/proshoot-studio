import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { getBaseUrlFromEnv } from "@/lib/env";
import { generateMetadata as getRouteMetadata } from "@/lib/metadata";

import FirstPromoterScript from "@/components/services/first-promoter";
import { SidebarProvider } from "@/context/SidebarContext";
import GoogleOneTapComponent from "@/app/auth/components/google-one-tap";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "./(dashboard)/components/sidebar/dashboard-layout.jsx";
import createSupabaseServerClient from "@/lib/supabase/server-client";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/";
  
  const routeMetadata = getRouteMetadata(pathname);
  
  return {
    metadataBase: new URL(getBaseUrlFromEnv()),
    title: `${routeMetadata.title}`,
    description: routeMetadata.description,
    robots: routeMetadata.robots,
  };
}

/**
 * Optimized Root Layout with Route-Based Rendering
 *
 * Uses pathname detection to determine layout type:
 * - Dashboard layout for authenticated app routes
 * - Simple layout for auth and public routes
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Get current pathname for route detection
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // Determine if this is an auth route
  const isAuthRoute =
    pathname.startsWith("/auth") || pathname === "/accept-invite";

  // Get user session
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // For authenticated users on app routes, use dashboard layout
  if (user && !authError && !isAuthRoute) {
    // ===== PARALLEL DATA FETCHING =====
    const [profileRes, orgMembersRes] = await Promise.allSettled([
      supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("members")
        .select(
          "organizations (id, name, owner_user_id, team_size, invite_token)"
        )
        .eq("user_id", user.id),
    ]);

    // ===== SAFE DATA PROCESSING =====
    const profile =
      profileRes.status === "fulfilled" ? profileRes.value.data : null;
    const orgMembersData =
      orgMembersRes.status === "fulfilled" ? orgMembersRes.value.data : [];

    // Process organizations with error handling
    const organizations =
      orgMembersData
        ?.flatMap((member) => member.organizations || [])
        .filter((org) => !!org)
        .filter(
          (org, index, self) => index === self.findIndex((o) => o.id === org.id)
        ) || [];

    // Log errors but don't fail
    if (profileRes.status === "rejected") {
      console.error("Layout: Profile fetch error:", profileRes.reason);
    }
    if (orgMembersRes.status === "rejected") {
      console.error("Layout: Organization fetch error:", orgMembersRes.reason);
    }

    return (
      <html lang="en" className="scroll-smooth min-h-screen">
        <FirstPromoterScript />
        <body className={`${GeistSans.className} antialiased min-h-screen`}>
          <GoogleOneTapComponent />
          <SidebarProvider>
            <DashboardLayout
              initialProfile={profile}
              initialOrganizations={organizations}
            >
              {children}
            </DashboardLayout>
          </SidebarProvider>
          <Toaster
            closeButton
            position="bottom-right"
            richColors
            toastOptions={{
              style: { boxShadow: "none" },
              classNames: {
                toast: "bg-background text-foreground border border-border",
                success: "!bg-success !text-success-foreground !border-success",
                error:
                  "!bg-destructive !text-destructive-foreground !border-destructive",
                warning: "!bg-accent !text-accent-foreground !border-accent",
                info: "!bg-primary !text-primary-foreground !border-primary",
                closeButton:
                  "!bg-destructive !text-destructive-foreground !border-destructive",
              },
            }}
          />
        </body>
      </html>
    );
  }

  // For auth routes or unauthenticated users, use simple layout
  return (
    <html lang="en" className="scroll-smooth min-h-screen">
      <FirstPromoterScript />
      <body className={`${GeistSans.className} antialiased min-h-screen`}>
        <GoogleOneTapComponent />
        <SidebarProvider>{children}</SidebarProvider>
        <Toaster
          closeButton
          position="bottom-right"
          richColors
          toastOptions={{
            style: { boxShadow: "none" },
            classNames: {
              toast: "bg-background text-foreground border border-border",
              success: "!bg-success !text-success-foreground !border-success",
              error:
                "!bg-destructive !text-destructive-foreground !border-destructive",
              warning: "!bg-accent !text-accent-foreground !border-accent",
              info: "!bg-primary !text-primary-foreground !border-primary",
              closeButton:
                "!bg-destructive !text-destructive-foreground !border-destructive",
            },
          }}
        />
      </body>
    </html>
  );
}

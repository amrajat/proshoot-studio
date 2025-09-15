import { headers } from "next/headers";

import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { getBaseUrlFromEnv } from "@/lib/env";
import { generateMetadata as getRouteMetadata } from "@/lib/metadata";

import { SidebarProvider } from "@/context/SidebarContext";
import { AccountProvider } from "@/context/AccountContext";
import GoogleOneTapComponent from "@/components/services/google-one-tap";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "../components/sidebar/dashboard-layout.jsx";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { IntercomProvider } from "@/components/services/intercom-provider";

export async function generateMetadata() {
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

export default async function RootLayout({ children }) {
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

  // Determine if we should use dashboard layout
  const useDashboardLayout = user && !authError && !isAuthRoute;

  // Fetch data only for dashboard layout
  let profile = null;
  let organizations = [];

  if (useDashboardLayout) {
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

    profile = profileRes.status === "fulfilled" ? profileRes.value.data : null;
    const orgMembersData =
      orgMembersRes.status === "fulfilled" ? orgMembersRes.value.data : [];

    organizations =
      orgMembersData
        ?.flatMap((member) => member.organizations || [])
        .filter((org) => !!org)
        .filter(
          (org, index, self) => index === self.findIndex((o) => o.id === org.id)
        ) || [];
  }

  return (
    <html lang="en" className="scroll-smooth min-h-screen">
      <body className={`${GeistSans.className} antialiased min-h-screen`}>
        <AccountProvider
          initialProfile={profile}
          initialOrganizations={organizations}
          initialIsLoading={false}
        >
          <GoogleOneTapComponent />
          <SidebarProvider>
            {useDashboardLayout ? (
              <DashboardLayout>
                <IntercomProvider>{children}</IntercomProvider>
              </DashboardLayout>
            ) : (
              <IntercomProvider>{children}</IntercomProvider>
            )}
          </SidebarProvider>
        </AccountProvider>
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

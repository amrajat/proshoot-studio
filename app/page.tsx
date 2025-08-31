import { redirect } from "next/navigation";
import { Suspense } from "react";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import DashboardView from "./(dashboard)/components/DashboardView";
import { PageLoader } from "@/components/shared/universal-loader";

/**
 * Optimized Root Page - Dashboard Entry Point
 *
 * Main dashboard page using route groups for clean URLs.
 * Features optimized authentication and error handling.
 */
export default async function RootPage() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users to auth
    if (userError || !user) {
      redirect("/auth");
    }

    // Render dashboard with loading fallback
    return (
      <Suspense fallback={<PageLoader />}>
        <DashboardView userId={user.id} />
      </Suspense>
    );
  } catch (error) {
    console.error("Root page error:", error);
    redirect("/auth");
  }
}

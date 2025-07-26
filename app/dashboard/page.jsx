import createSupabaseServerClient from "@/lib/supabase/server-client";
import { ContentLayout } from "./components/sidebar/content-layout";
import { redirect } from "next/navigation";
import DashboardView from "./components/DashboardView";

/**
 * Main Dashboard Page (Server Component)
 *
 * Entry point for the dashboard that:
 * - Authenticates the user and redirects if not logged in
 * - Renders the main dashboard content within ContentLayout
 * - Passes user ID to DashboardView for context-aware rendering
 */
export default async function DashboardPage() {
  // ===== AUTHENTICATION CHECK =====
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Redirect to auth if user is not authenticated
  if (userError || !user) {
    redirect("/auth");
  }

  // ===== RENDER DASHBOARD =====
  return (
    <ContentLayout title="Dashboard">
      <DashboardView userId={user.id} />
    </ContentLayout>
  );
}

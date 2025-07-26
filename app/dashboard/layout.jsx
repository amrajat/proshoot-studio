import DashboardLayout from "./components/sidebar/dashboard-layout.jsx";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

/**
 * Main Dashboard Layout (Server Component)
 *
 * Server-side layout that:
 * - Authenticates users and redirects if not logged in
 * - Fetches initial profile and organization data
 * - Passes data to client-side DashboardLayout component
 * - Handles parallel data fetching for better performance
 */
export default async function DashboardLayoutServer({ children }) {
  // ===== AUTHENTICATION CHECK =====
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to auth if user is not logged in
  if (authError || !user) {
    redirect("/auth");
  }

  // ===== PARALLEL DATA FETCHING =====
  const [profileRes, orgMembersRes] = await Promise.all([
    // Fetch user profile
    supabase
      .from("profiles")
      .select("user_id, full_name")
      .eq("user_id", user.id)
      .maybeSingle(),

    // Fetch user's organization memberships
    supabase
      .from("members")
      .select(
        "organizations (id, name, owner_user_id, team_size, invite_token)"
      )
      .eq("user_id", user.id),
  ]);

  // ===== ERROR HANDLING =====
  if (profileRes.error) {
    console.error("Layout: Profile fetch error:", profileRes.error);
  }

  if (orgMembersRes.error) {
    console.error(
      "Layout: Organization members fetch error:",
      orgMembersRes.error
    );
  }

  // ===== DATA PROCESSING =====
  const profile = profileRes.data;

  // Process organizations data - handle nested structure and deduplicate
  const organizations =
    orgMembersRes.data
      ?.flatMap((member) => member.organizations || [])
      .filter((org) => !!org) // Remove null/undefined
      .filter(
        (org, index, self) => index === self.findIndex((o) => o.id === org.id) // Deduplicate by ID
      ) || [];

  // ===== RENDER CLIENT LAYOUT =====
  return (
    <DashboardLayout
      initialProfile={profile}
      initialOrganizations={organizations}
    >
      {children}
    </DashboardLayout>
  );
}

// app/dashboard/page.tsx
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import { redirect } from "next/navigation";
import DashboardClient from "../../components/dashboard/DashboardClient";

// Type definitions can be removed or moved to a central types file if desired

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }, // Get user directly
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User fetch error or no user:", userError);
    redirect("/auth"); // Or your specific login path
  }

  // No need to fetch profile, credits, or orgs here anymore - layout does it.
  // We only need to pass userId to the client component if it needs it for actions.

  return (
    <ContentLayout title="Dashboard">
      {/* Pass only necessary props - context handles profile/orgs now */}
      <DashboardClient userId={user.id} />
    </ContentLayout>
  );
}

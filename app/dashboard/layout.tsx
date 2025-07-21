import DashboardLayout from "./components/sidebar/dashboard-layout";
import createSupabaseServerClient from "@/lib/supabase/server-client"; // Use ServerClient for layouts
import { redirect } from "next/navigation";

// Define minimal types needed here
type Profile = {
  user_id: string;
  full_name?: string | null;
};

type Organization = {
  id: string;
  name: string;
  owner_user_id: string;
  team_size?: number | null; // Add optional fields
  website?: string | null;
  industry?: string | null;
  department?: string | null;
  position?: string | null;
};

// Fetched data type might be different if Supabase types join as array
type FetchedOrgMemberLayout = {
  organizations: Organization[] | null; // Expect array based on context fix
};

export default async function DemoLayout({
  // Make layout async
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  // Fetch user session
  const {
    data: { user }, // Use user directly
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth"); // Redirect if not logged in
  }

  // Fetch profile and organizations in parallel
  const [profileRes, orgMembersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, full_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("members")
      // Update select to fetch all needed fields
      .select(
        "organizations (id, name, owner_user_id, team_size, website, industry, department, position)"
      )
      .eq("user_id", user.id),
  ]);

  // Basic error handling (log for now, could show error page)
  if (profileRes.error) {
    console.error("Layout: Profile fetch error:", profileRes.error);
  }
  if (orgMembersRes.error) {
    console.error(
      "Layout: Organization members fetch error:",
      orgMembersRes.error
    );
  }

  const profile: Profile | null = profileRes.data;
  // Adjust mapping using flatMap, similar to AccountContext fix
  const organizations: Organization[] =
    orgMembersRes.data
      ?.flatMap((om: FetchedOrgMemberLayout) => om.organizations || []) // Use flatMap
      .filter((org): org is Organization => !!org) // Filter out nulls
      .filter(
        (org, index, self) => index === self.findIndex((o) => o.id === org.id) // Deduplicate
      ) || [];

  return (
    <DashboardLayout
      // Pass fetched data down to the client layout component
      initialProfile={profile}
      initialOrganizations={organizations} // Pass the correctly typed and processed orgs
    >
      {children}
    </DashboardLayout>
  );
}

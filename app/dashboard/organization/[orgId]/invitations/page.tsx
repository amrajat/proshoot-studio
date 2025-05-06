import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import InvitationsClient from "./_components/InvitationsClient"; // We'll create this

// Basic types - ideally from a central file
type Organization = { id: string; name: string /* ... */ };
type Credits = {
  id: string;
  balance: number;
  starter: number;
  pro: number;
  elite: number;
  studio: number /* ... */;
};
type Invitation = {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  transfer_credit_type: string;
  transfer_credit_amount: number | null /* ... */;
};

interface OrgInvitationsPageProps {
  params: { orgId: string };
}

export default async function OrgInvitationsPage({
  params,
}: OrgInvitationsPageProps) {
  const supabase = await createSupabaseServerClient();
  const { orgId } = params;

  // Verify user authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth");
  }

  // Verify user is an admin of this specific organization
  const { data: memberData, error: memberError } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name)") // Fetch org name too
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (memberError || !memberData || memberData.role !== "admin") {
    console.error("Admin access check failed:", memberError);
    // Redirect to dashboard or show an unauthorized message
    redirect("/dashboard?error=unauthorized");
  }

  const organization = memberData.organizations as Organization | null;
  if (!organization) {
    console.error("Failed to fetch organization details for admin check");
    redirect("/dashboard?error=org_not_found");
  }

  // Fetch current invitations for this org
  const { data: invitationsData, error: invitesError } = await supabase
    .from("invitations")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  // Fetch current credits for this org to display/validate against in the client
  const { data: orgCreditsData, error: creditsError } = await supabase
    .from("credits")
    .select("*")
    .eq("organization_id", orgId)
    .single(); // Org should have exactly one credit row

  if (invitesError || creditsError) {
    console.error(
      "Error fetching invites or credits:",
      invitesError,
      creditsError
    );
    // Handle appropriately - maybe allow page load but show error fetching data
  }

  const invitations: Invitation[] = invitationsData || [];
  const orgCredits: Credits | null = orgCreditsData;

  return (
    <ContentLayout title={`Invitations - ${organization.name}`}>
      <InvitationsClient
        organizationId={orgId}
        initialInvitations={invitations}
        orgCredits={orgCredits}
      />
    </ContentLayout>
  );
}

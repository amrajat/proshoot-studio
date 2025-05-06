import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import CreateStudioForm from "@/app/dashboard/studio/_components/CreateStudioForm";
import Link from "next/link";
import MultiStepForm from "@/components/dashboard/studio-creation/MultiStepForm";

// Helper function to check if any plan credits exist in a credit object
const checkPlanCredits = (credits) => {
  return (
    credits &&
    (credits.starter > 0 ||
      credits.pro > 0 ||
      credits.elite > 0 ||
      credits.studio > 0)
  );
};

export default async function CreateStudioPage() {
  noStore();
  const supabase = await createSupabaseServerClient();

  // 1. Get User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch User's Personal Credits
  const { data: personalCredits, error: personalCreditsError } = await supabase
    .from("credits")
    .select("id, starter, pro, elite, studio")
    .eq("user_id", user.id)
    .is("organization_id", null)
    .single();

  // Handle personal credits error (e.g., no row found is okay if they have org credits)
  if (personalCreditsError && personalCreditsError.code !== "PGRST116") {
    console.error(
      "Error fetching personal credits:",
      personalCreditsError.message
    );
    // Redirect or show error, might depend on whether org credits are also fetched
  }

  // 3. Fetch Organizations where the user is an Admin AND their credits
  const { data: adminOrganizations, error: adminOrgsError } = await supabase
    .from("organization_members")
    .select(
      `
          role,
          organizations (
              id,
              name,
              credits ( id, starter, pro, elite, studio )
          )
      `
    )
    .eq("user_id", user.id);

  if (adminOrgsError) {
    console.error(
      "Error fetching member organizations:",
      adminOrgsError.message
    );
    // Handle error - perhaps redirect with a generic error
    redirect("/dashboard/studio?error=fetch-orgs-failed");
  }

  // Filter out orgs that might be missing data and flatten the structure
  const memberOrganizations =
    adminOrganizations
      ?.map((om) => om.organizations) // Get the organization object
      .filter((org) => org) || // Ensure org exists (basic check)
    [];

  // 4. Check if user has personal credits to create a studio
  //    (assuming credits are transferred to the user)
  const hasPersonalPlanCredits = checkPlanCredits(personalCredits);
  const canCreateStudio = hasPersonalPlanCredits; // Simplify based on user feedback

  return (
    <ContentLayout title="Create New Studio">
      <MultiStepForm />
      {!canCreateStudio ? (
        <div>
          <p className="mb-4 text-destructive">
            You need available plan credits (Starter, Pro, Elite, or Studio) in
            your personal account to create a new studio. Credits might be
            transferred to you when accepting an organization invitation.
          </p>
          <Link
            href="/dashboard/billing"
            className="text-primary hover:underline"
          >
            Go to Personal Billing
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-muted-foreground">
            Select the context (Personal or Organization), enter a name, and
            choose which of your personal credits to use.
          </p>
          {/* <CreateStudioForm
            personalCredits={personalCredits} // May be null
            memberOrganizations={memberOrganizations} // Pass unfiltered orgs
          /> */}
        </>
      )}
    </ContentLayout>
  );
}

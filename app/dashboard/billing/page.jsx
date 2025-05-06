import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import BillingClient from "@/app/dashboard/billing/_components/BillingClient";
import { unstable_noStore as noStore } from "next/cache";

export default async function BillingPage() {
  noStore();
  const supabase = await createSupabaseServerClient();

  // 1. Get User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth");
  }

  // 2. Fetch personal credits
  const { data: personalCreditsData, error: personalCreditsError } =
    await supabase
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
  if (personalCreditsError)
    console.error("Personal Credits Error:", personalCreditsError.message);
  const personalCredits = personalCreditsData; // Assign directly

  // 3. Fetch organization memberships (including role)
  const { data: membershipsData, error: membershipsError } = await supabase
    .from("organization_members")
    .select("organization_id, user_id, role")
    .eq("user_id", user.id);
  if (membershipsError)
    console.error("Memberships Error:", membershipsError.message);
  const memberships = membershipsData || [];
  const orgIds = memberships.map((m) => m.organization_id);

  let ownedOrgCredits = []; // Array for owned org credits
  let memberOrgCredits = []; // Array for member org credits
  let orgPurchases = [];
  let transactions = [];
  let allCreditAccountIds = personalCredits ? [personalCredits.id] : [];

  // 4. Fetch organization details and their credits (if user belongs to any orgs)
  if (orgIds.length > 0) {
    const { data: orgsData, error: orgsError } = await supabase
      .from("organizations")
      .select(`id, name, owner_user_id, credits (*)`)
      .in("id", orgIds);

    if (orgsError) {
      console.error("Organization Details Error:", orgsError.message);
    } else {
      const organizationsDataWithCredits = (orgsData || []).map((org) => ({
        ...org,
        credits: org.credits && org.credits.length > 0 ? org.credits[0] : null,
      }));

      // Categorize organizations and collect credit IDs
      organizationsDataWithCredits.forEach((org) => {
        if (org.credits?.id) {
          allCreditAccountIds.push(org.credits.id);
        }

        const orgInfo = {
          id: org.id,
          name: org.name,
          credits: org.credits, // May be null if org has no credits row
        };

        if (org.owner_user_id === user.id) {
          // This user owns this organization
          if (org.credits) {
            // Only include if credits data exists
            ownedOrgCredits.push(orgInfo);
          }
        } else {
          // This user is just a member
          if (org.credits) {
            // Only include if credits data exists
            memberOrgCredits.push(orgInfo);
          }
        }
      });
    }

    // 5. Fetch organization purchases
    const { data: orgPurchasesData, error: orgPurchasesError } = await supabase
      .from("purchases")
      .select(`*, organizations ( name )`)
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false });
    if (orgPurchasesError)
      console.error("Org Purchases Error:", orgPurchasesError.message);
    orgPurchases = orgPurchasesData || [];
  }

  // 6. Fetch personal purchases
  const { data: personalPurchasesData, error: personalPurchasesError } =
    await supabase
      .from("purchases")
      .select(`*, organizations ( name )`)
      .eq("user_id", user.id)
      .is("organization_id", null)
      .order("created_at", { ascending: false });
  if (personalPurchasesError)
    console.error("Personal Purchases Error:", personalPurchasesError.message);
  const personalPurchases = personalPurchasesData || [];

  // 7. Fetch transactions if there are any credit accounts
  if (allCreditAccountIds.length > 0) {
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select(`*, credits ( user_id, organization_id, organizations ( name ) )`)
      .in("credit_account_id", allCreditAccountIds)
      .order("created_at", { ascending: false })
      .limit(100);
    if (transactionsError)
      console.error("Transactions Error:", transactionsError.message);
    transactions = transactionsData || [];
  }

  return (
    <ContentLayout title="Billing & Usage">
      <BillingClient
        personalCredits={personalCredits}
        ownedOrganizationCredits={ownedOrgCredits}
        memberOrganizationCredits={memberOrgCredits}
        personalPurchases={personalPurchases}
        organizationPurchases={orgPurchases}
        transactions={transactions}
      />
    </ContentLayout>
  );
}

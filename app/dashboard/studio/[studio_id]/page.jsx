import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image"; // Using next/image for optimization
import { notFound } from "next/navigation";
import { HeadshotCard } from "../_components/HeadshotCard"; // Import the new component
import { Building } from "lucide-react";

async function getStudioDetails(supabase, studioId, userId) {
  // Fetch studio with organization details
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select(
      `
      id,
      name,
      status,
      creator_user_id,
      organization_id,
      organizations ( name )
    `
    )
    .eq("id", studioId)
    .single();

  if (studioError || !studio) {
    console.error("Error fetching studio or not found:", studioError?.message);
    return { studio: null, headshots: [], error: "Studio not found" };
  }

  // Security Check: Allow if user created it OR if it's an org studio and user is a member
  let canAccess = false;
  if (studio.creator_user_id === userId) {
    canAccess = true;
  } else if (studio.organization_id) {
    // Check if user is a member of the organization
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("user_id", { count: "exact", head: true }) // Just need to know if a row exists
      .eq("user_id", userId)
      .eq("organization_id", studio.organization_id);

    if (membershipError) {
      console.error(
        "Error checking organization membership for studio access:",
        membershipError.message
      );
      // Default to no access on error
    } else if (membership && membership.count > 0) {
      canAccess = true;
    }
  }

  if (!canAccess) {
    console.warn(`User ${userId} access denied for studio ${studioId}`);
    return { studio: null, headshots: [], error: "Forbidden" };
  }

  // Fetch Result Headshots AND their favorite status for the CURRENT logged-in user
  const { data: headshotsData, error: headshotsError } = await supabase
    .from("result_headshots")
    .select(
      `
      id,
      image_url,
      favorites ( user_id )
    `
    )
    .eq("studio_id", studioId)
    .order("created_at", { ascending: true });

  if (headshotsError) {
    console.error("Error fetching result headshots:", headshotsError.message);
    return { studio, headshots: [], error: "Error fetching headshots" };
  }

  // Process data to add an easy 'isFavorited' flag
  const headshots =
    headshotsData?.map((h) => ({
      ...h,
      isFavorited: h.favorites.length > 0,
    })) || [];

  return { studio, headshots, error: null };
}

export default async function StudioDetailPage({ params }) {
  noStore();
  const studioId = params.studio_id;
  const supabase = await createSupabaseServerClient();

  // 1. Get User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch studio details and result headshots with favorite status
  const {
    studio,
    headshots,
    error: dataError,
  } = await getStudioDetails(supabase, studioId, user.id);

  // Handle errors from fetching data
  if (dataError === "Studio not found" || dataError === "Forbidden") {
    notFound(); // Show a 404 page
  }
  // Handle other potential errors (e.g., fetching headshots failed)
  if (dataError) {
    // You could show an error message on the page instead of redirecting
    console.error("Data fetching error for studio page:", dataError);
    // For now, redirect back to the list with an error query param
    redirect("/dashboard/studio?error=load-details-failed");
  }

  const studioTitle = studio?.organization_id
    ? `${studio.organizations?.name || "Organization"} / ${studio.name}`
    : studio?.name || "Studio Details";

  return (
    <ContentLayout title={studioTitle}>
      {studio?.organization_id && (
        <p className="mb-1 text-sm text-muted-foreground flex items-center gap-1.5">
          <Building className="h-4 w-4" /> Organization Studio
        </p>
      )}
      <p className="mb-4 text-muted-foreground">
        Status: <span className="font-medium">{studio?.status}</span>
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Result Headshots</CardTitle>
        </CardHeader>
        <CardContent>
          {headshots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {headshots.map((headshot) => (
                <HeadshotCard
                  key={headshot.id}
                  headshot={headshot}
                  studioId={studio.id} // Pass studioId
                  initialIsFavorited={headshot.isFavorited} // Pass initial state
                />
              ))}
            </div>
          ) : (
            <p>No result headshots found for this studio.</p>
          )}
        </CardContent>
      </Card>
      {/* Optionally add preview headshots here in another card */}
    </ContentLayout>
  );
}

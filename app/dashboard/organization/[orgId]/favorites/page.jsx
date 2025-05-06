import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect, notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { groupBy } from "lodash-es"; // Using lodash for grouping ease

async function getOrganizationFavorites(supabase, orgId, userId) {
  console.log(`Fetching favorites for org: ${orgId}, user: ${userId}`); // Log entry

  // 1. Verify Admin Status
  console.log("Checking admin status..."); // Log before check
  const { data: adminMembership, error: adminCheckError } = await supabase
    .from("organization_members")
    .select("role") // Select the role column
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle(); // Use maybeSingle to handle non-admins gracefully

  if (adminCheckError) {
    console.error("Error checking admin status:", adminCheckError.message);
    return {
      organization: null,
      groupedFavorites: {},
      error: "Error verifying permissions.",
    };
  }
  // Check if a membership record with role 'admin' was found
  console.log("Admin membership check result:", adminMembership); // Log result
  if (!adminMembership) {
    console.log("User is not admin or check failed."); // Log reason for forbidden
    return { organization: null, groupedFavorites: {}, error: "Forbidden" };
  }
  console.log("User is admin."); // Log success

  // 2. Fetch Organization Name
  console.log("Fetching organization details..."); // Log before fetch
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();

  if (orgError || !organization) {
    console.error(
      "Error fetching organization details or not found:",
      orgError?.message
    ); // Log fetch error
    return {
      organization: null,
      groupedFavorites: {},
      error: "Organization not found",
    };
  }
  console.log("Organization found:", organization); // Log success

  // 3. Fetch Favorites WITHOUT profiles initially
  console.log("Fetching base favorites data...");
  const { data: baseFavorites, error: favoritesError } = await supabase
    .from("favorites")
    .select(
      `
          id,
          created_at,
          user_id, 
          studios!inner ( id, name, organization_id ),
          result_headshots!inner ( id, image_url )
      `
      // Removed profiles!inner from here
    )
    .eq("studios.organization_id", orgId) // Filter by studios belonging to this org
    .order("created_at", { ascending: false });

  if (favoritesError) {
    console.error(
      "Error fetching base organization favorites:",
      favoritesError.message
    );
    return {
      organization,
      groupedFavorites: {},
      error: "Error fetching favorites data.",
    };
  }
  console.log(`Found ${baseFavorites?.length || 0} base favorites.`);

  if (!baseFavorites || baseFavorites.length === 0) {
    console.log("No base favorites found, returning early.");
    return { organization, groupedFavorites: {}, error: null };
  }

  // 4. Get unique user IDs from favorites
  const userIds = [
    ...new Set(baseFavorites.map((fav) => fav.user_id).filter(Boolean)), // Filter out potential nulls
  ];
  console.log("Unique user IDs from favorites:", userIds);

  // 5. Fetch profiles for these users
  let profilesMap = {};
  if (userIds.length > 0) {
    console.log("Fetching profiles for unique users...");
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError.message);
      // Proceed without profile data, but log error
    } else {
      console.log(`Fetched ${profilesData?.length || 0} profiles.`);
      profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {});
    }
  }

  // 6. Combine favorites with profile data
  const combinedFavorites = baseFavorites.map((fav) => ({
    ...fav,
    profiles: profilesMap[fav.user_id] || null, // Add profile data, default to null if not found
  }));

  // 7. Group Combined Favorites by User
  console.log("Grouping combined favorites...");
  const groupedFavorites = groupBy(combinedFavorites || [], "user_id");

  console.log("Returning grouped favorites."); // Log before return
  return { organization, groupedFavorites, error: null };
}

export default async function OrgFavoritesPage({ params }) {
  noStore();
  const orgId = params.orgId;
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Fetch data
  const { organization, groupedFavorites, error } =
    await getOrganizationFavorites(supabase, orgId, user.id);

  // Handle errors
  if (error === "Forbidden" || error === "Organization not found") {
    notFound();
  }
  if (error) {
    console.error("Error loading org favorites page:", error);
    // Consider showing an error message on the page
    redirect(`/dashboard/organization/${orgId}?error=load-favorites-failed`);
  }

  const favoriteEntries = Object.entries(groupedFavorites);

  return (
    <ContentLayout title={`Favorites: ${organization?.name || "Organization"}`}>
      <CardDescription className="mb-6">
        View headshots favorited by members in this organization's studios.
      </CardDescription>

      {favoriteEntries.length > 0 ? (
        <div className="space-y-8">
          {favoriteEntries.map(([userId, favs]) => {
            const memberProfile = favs[0]?.profiles; // Get profile from first favorite
            const memberName =
              memberProfile?.full_name || `User ID: ${userId.substring(0, 8)}`;
            const memberAvatar = memberProfile?.avatar_url;

            return (
              <Card key={userId}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={memberAvatar} alt={memberName} />
                    <AvatarFallback>
                      {memberName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{memberName}</CardTitle>
                    <CardDescription>
                      {favs.length} favorite headshot
                      {favs.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {favs.map((fav) => (
                      <Link
                        key={fav.id}
                        href={`/dashboard/studio/${fav.studios.id}`}
                        title={`Studio: ${fav.studios.name}`}
                        className="block aspect-square relative overflow-hidden rounded-md border group transition-transform hover:scale-105"
                      >
                        <Image
                          src={fav.result_headshots.image_url}
                          alt={`Favorited headshot ${fav.result_headshots.id}`}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 12.5vw"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs truncate font-medium">
                            {fav.studios.name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p>
          No favorites have been marked by members in this organization yet.
        </p>
      )}
    </ContentLayout>
  );
}

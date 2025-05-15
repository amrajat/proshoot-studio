"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { unstable_noStore as noStore } from "next/cache";

export async function getStudioDetailsData(
  currentUserId,
  studioId,
  currentContextType,
  currentContextId
) {
  noStore();
  const supabase = await createSupabaseServerClient();

  console.log("SA: getStudioDetailsData PARAMS:", {
    currentUserId,
    studioId,
    currentContextType,
    currentContextId,
  });

  if (!currentUserId || !studioId) {
    console.error("SA Error: User or Studio ID missing.", {
      currentUserId,
      studioId,
    });
    return {
      error: { message: "User or Studio ID missing." },
      studio: null,
      headshots: [],
      canFavorite: false,
      viewMode: "", // Ensure a default empty string or appropriate type
    };
  }

  // 1. Fetch Studio Details
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select("*, organizations (name)")
    .eq("id", studioId)
    .maybeSingle(); // Use maybeSingle in case ID is invalid

  console.log(
    "SA: Fetched studio:",
    studio
      ? {
          id: studio.id,
          name: studio.name,
          creator: studio.creator_user_id,
          downloaded: studio.downloaded,
          orgId: studio.organization_id,
        }
      : null,
    "Error:",
    studioError
  );

  if (studioError || !studio) {
    console.error(
      `SA Error: Error fetching studio ${studioId}:`,
      studioError?.message || "Studio not found."
    );
    return {
      error: studioError || { message: "Studio not found." },
      studio: null,
      headshots: [],
      canFavorite: false,
      viewMode: "",
    };
  }

  let headshots = [];
  let canFavorite = false;
  let serverViewMode = "preview"; // Internal server-side view mode
  let userFavoritesIds = []; // IDs of headshots favorited by the current user

  // 2. Determine user role if in organization context for this studio
  let isOrgAdmin = false;
  if (
    studio.organization_id &&
    currentContextType === "organization" &&
    currentContextId === studio.organization_id
  ) {
    const { data: orgMember, error: orgMemberError } = await supabase
      .from("organization_members")
      .select("role, organizations (owner_user_id)")
      .eq("user_id", currentUserId)
      .eq("organization_id", studio.organization_id)
      .single();
    if (orgMemberError) {
      console.warn(
        "SA Warn: Error fetching org membership for studio owner check:",
        orgMemberError.message
      );
    } else if (orgMember) {
      const isOwner = orgMember.organizations?.owner_user_id === currentUserId;
      isOrgAdmin = orgMember.role === "admin" || isOwner;
    }
  }
  console.log(
    "SA: Determined isOrgAdmin:",
    isOrgAdmin,
    "for orgId:",
    studio.organization_id,
    "currentContextId:",
    currentContextId
  );

  // 3. Fetch Headshots based on downloaded status and context
  if (!studio.downloaded) {
    serverViewMode = "preview";
    console.log(
      `SA: Studio ${studioId} NOT downloaded. Mode: ${serverViewMode}`
    );
    const { data: previewHeadshotsData, error: previewError } = await supabase
      .from("preview_headshots")
      .select("id, image_url, created_at")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: true });
    if (previewError)
      console.error(
        "SA Error: Fetching preview headshots:",
        previewError.message
      );
    headshots = (previewHeadshotsData || []).map((h) => ({
      ...h,
      isFavorite: false,
    }));
    console.log("SA: Fetched preview_headshots count:", headshots.length);
  } else {
    // Studio is downloaded
    console.log(`SA: Studio ${studioId} IS downloaded. Evaluating roles...`);
    if (
      currentContextType === "personal" ||
      (currentContextType === "organization" &&
        !isOrgAdmin &&
        studio.creator_user_id === currentUserId) // Member viewing own org studio
    ) {
      serverViewMode = "favorites_then_results"; // Client will call this 'creator' effectively if isCurrentUserCreator is true
      canFavorite = true;
      console.log(
        `SA: Mode: ${serverViewMode} (Personal or Member-Creator viewing own Org Studio). CanFavorite: ${canFavorite}`
      );

      const { data: favs, error: favsError } = await supabase
        .from("favorites")
        .select("headshot_id")
        .eq("user_id", currentUserId)
        .eq("studio_id", studioId);
      if (favsError)
        console.error("SA Error: Fetching user favorites:", favsError.message);
      userFavoritesIds = (favs || []).map((f) => f.headshot_id);
      console.log(
        "SA: User's favorite headshot IDs for this studio:",
        userFavoritesIds
      );

      const { data: allResultHeadshotsData, error: resultsError } =
        await supabase
          .from("result_headshots")
          .select("id, image_url, created_at")
          .eq("studio_id", studioId)
          .order("created_at", { ascending: true });
      if (resultsError)
        console.error(
          "SA Error: Fetching all result headshots:",
          resultsError.message
        );

      headshots = (allResultHeadshotsData || [])
        .map((h) => ({ ...h, isFavorite: userFavoritesIds.includes(h.id) }))
        .sort(
          (a, b) =>
            (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) ||
            new Date(a.created_at) - new Date(b.created_at)
        );
      console.log(
        "SA: Fetched all result_headshots count:",
        headshots.length,
        "(includes favorites marked)"
      );
    } else if (
      currentContextType === "organization" &&
      isOrgAdmin &&
      studio.creator_user_id !== currentUserId
    ) {
      // Admin viewing another member's org studio
      serverViewMode = "admin_favorites_only"; // This will map to client's 'admin_viewing_member_studio'
      canFavorite = false;
      console.log(
        `SA: Mode: ${serverViewMode} (Admin viewing Member's Org Studio). CanFavorite: ${canFavorite}. Studio Creator: ${studio.creator_user_id}`
      );

      const { data: adminFavoritesRawData, error: adminFavError } =
        await supabase
          .from("favorites")
          .select(
            `
          user_id,
          headshot_id,
          profiles (full_name),
          result_headshots (id, image_url, created_at)
        `
          )
          .eq("studio_id", studioId);
      // .eq("user_id", studio.creator_user_id); // As per clarification: only creator makes favorites, so this would be implicit if data is clean.
      // If we want to be absolutely sure we only get creator's favorites: uncomment and test.

      if (adminFavError) {
        console.error(
          `SA Error: Fetching admin favorites for studio ${studioId}:`,
          adminFavError.message
        );
        headshots = [];
      } else {
        console.log(
          "SA: Raw adminFavoritesData count:",
          adminFavoritesRawData?.length
        );
        headshots = (adminFavoritesRawData || [])
          .map((fav) => {
            if (!fav.result_headshots) {
              console.warn(
                `SA Warn: Favorite entry for studio ${studioId} (headshot_id: ${fav.headshot_id}, user: ${fav.user_id}) missing linked result_headshot data.`
              );
              return null;
            }
            // Filter here to ensure we only show favorites made by the actual studio creator
            if (fav.user_id !== studio.creator_user_id) {
              console.log(
                `SA Info: Skipping favorite by user ${fav.user_id} as it's not the studio creator ${studio.creator_user_id} (Admin View restriction).`
              );
              return null;
            }
            return {
              ...fav.result_headshots,
              isFavorite: true,
              favoritedBy: fav.profiles?.full_name || fav.user_id,
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        console.log(
          "SA: Processed admin_favorites_only headshots count:",
          headshots.length
        );
      }
    } else if (
      currentContextType === "organization" &&
      isOrgAdmin &&
      studio.creator_user_id === currentUserId
    ) {
      // Admin viewing THEIR OWN org studio
      serverViewMode = "favorites_then_results"; // Treat as creator view
      canFavorite = true;
      // Logic is same as personal/creator view for their own favorites
      const { data: favs, error: favsError } = await supabase
        .from("favorites")
        .select("headshot_id")
        .eq("user_id", currentUserId) // Their own favorites
        .eq("studio_id", studioId);
      if (favsError)
        console.error(
          "SA Error: Fetching admin-creator favorites:",
          favsError.message
        );
      userFavoritesIds = (favs || []).map((f) => f.headshot_id);
      console.log(
        "SA: Admin-Creator's favorite headshot IDs:",
        userFavoritesIds
      );

      const { data: allResultHeadshotsData, error: resultsError } =
        await supabase
          .from("result_headshots")
          .select("id, image_url, created_at")
          .eq("studio_id", studioId)
          .order("created_at", { ascending: true });
      if (resultsError)
        console.error(
          "SA Error: Fetching admin-creator results:",
          resultsError.message
        );
      headshots = (allResultHeadshotsData || [])
        .map((h) => ({ ...h, isFavorite: userFavoritesIds.includes(h.id) }))
        .sort(
          (a, b) =>
            (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) ||
            new Date(a.created_at) - new Date(b.created_at)
        );
      console.log(
        "SA: Fetched admin-creator result_headshots count:",
        headshots.length
      );
    } else {
      // Fallback for other org contexts or if user isn't creator/admin as expected
      console.warn(
        `SA Warn: Unhandled context for downloaded org studio. Studio ID: ${studioId}, User: ${currentUserId}, isOrgAdmin: ${isOrgAdmin}, creator: ${studio.creator_user_id}, currentContextType: ${currentContextType}`
      );
      serverViewMode = "preview"; // Fallback view, show all results without specific favorite logic for this path
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from("result_headshots")
        .select("id, image_url, created_at")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: true });
      if (fallbackError)
        console.error(
          "SA Error: Fetching fallback results:",
          fallbackError.message
        );
      headshots = (fallbackResults || []).map((h) => ({
        ...h,
        isFavorite: false,
      }));
      console.log("SA: Fallback result_headshots count:", headshots.length);
    }
  }

  // Client side expects viewMode: 'creator', 'admin_viewing_member_studio', 'preview'
  // Map server-side viewMode to client-expected viewMode
  let clientViewMode = "preview"; // Default
  if (serverViewMode === "favorites_then_results") {
    clientViewMode = "creator"; // This covers personal, member viewing own org studio, admin viewing own org studio
  } else if (serverViewMode === "admin_favorites_only") {
    clientViewMode = "admin_viewing_member_studio";
  }
  // 'preview' remains 'preview'

  console.log(
    `SA: ServerViewMode: ${serverViewMode} -> ClientViewMode: ${clientViewMode}`
  );

  const result = {
    studio,
    headshots,
    canFavorite,
    viewMode: clientViewMode,
    userFavoritesIds,
  };
  console.log("SA: getStudioDetailsData RETURNING:", {
    studioId: result.studio?.id,
    headshotsCount: result.headshots?.length,
    canFavorite: result.canFavorite,
    viewMode: result.viewMode,
    userFavoritesIdsCount: result.userFavoritesIds?.length,
    // Avoid logging full headshots array here if too large, already logged counts above
  });
  return result;
}

export async function toggleFavoriteAction(
  userId,
  studioId,
  headshotId,
  currentFavoriteStatus
) {
  noStore();
  const supabase = await createSupabaseServerClient();

  if (!userId || !studioId || !headshotId) {
    return {
      error: { message: "Missing IDs for favorite action." },
      success: false,
    };
  }

  // Check if studio exists and user owns it or is part of the org (basic validation)
  // More detailed RLS policies should handle fine-grained permissions.
  const { data: studio, error: studioCheckError } = await supabase
    .from("studios")
    .select("id, creator_user_id, organization_id, downloaded")
    .eq("id", studioId)
    .single();

  if (studioCheckError || !studio) {
    return {
      error: { message: "Studio not found or access denied." },
      success: false,
    };
  }

  if (!studio.downloaded) {
    return {
      error: { message: "Cannot favorite images in a non-downloaded studio." },
      success: false,
    };
  }

  // Further permission checks: Personal studio must be by user. Org studio - user must be member.
  // RLS on 'favorites' table should primarily enforce this.

  if (currentFavoriteStatus) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("studio_id", studioId)
      .eq("headshot_id", headshotId);
    if (error) {
      console.error("SA ToggleFav: Error deleting favorite:", error);
      return { error, success: false };
    }
    return { success: true, newFavoriteStatus: false };
  } else {
    // Add favorite
    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      studio_id: studioId,
      headshot_id: headshotId,
    });
    if (error) {
      console.error("SA ToggleFav: Error inserting favorite:", error);
      // Check for unique constraint violation (PGRST01 / 23505) if user tries to double-favorite (UI should prevent)
      return { error, success: false };
    }
    return { success: true, newFavoriteStatus: true };
  }
}

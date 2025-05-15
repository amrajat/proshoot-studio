"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client"; // Use server client in server actions
import { unstable_noStore as noStore } from "next/cache";

// Helper function to get image for a studio (can be co-located or imported)
async function getStudioDisplayImage(
  supabase,
  studio,
  userIdForFavorites,
  isOrgAdminViewingOrgStudio
) {
  if (!studio.downloaded) {
    return "/placeholder.svg";
  }

  let favoriteImageUrl = null;

  // Logic for favorite image
  const favoriteQuery = supabase
    .from("favorites")
    .select("result_headshots (image_url)")
    .eq("studio_id", studio.id);

  if (isOrgAdminViewingOrgStudio) {
    // Org admin sees any favorite in that studio
    // No additional user_id filter needed for favorites in this specific admin case for the grid image
  } else if (userIdForFavorites) {
    // Personal or org member (not admin) sees their own favorites
    favoriteQuery.eq("user_id", userIdForFavorites);
  }

  const { data: favorite, error: favoriteError } = await favoriteQuery
    .limit(1)
    .maybeSingle();

  if (
    favorite &&
    favorite.result_headshots &&
    favorite.result_headshots.image_url
  ) {
    favoriteImageUrl = favorite.result_headshots.image_url;
  }
  if (favoriteError && favoriteError.code !== "PGRST116") {
    console.warn(
      `SA: Error fetching favorite for studio ${studio.id}:`,
      favoriteError.message
    );
  }

  if (favoriteImageUrl) return favoriteImageUrl;

  // If no favorite, get the first result_headshot
  const { data: resultHeadshot, error: resultHeadshotError } = await supabase
    .from("result_headshots")
    .select("image_url")
    .eq("studio_id", studio.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (resultHeadshot && resultHeadshot.image_url) {
    return resultHeadshot.image_url;
  }
  if (resultHeadshotError && resultHeadshotError.code !== "PGRST116") {
    console.warn(
      `SA: Error fetching result headshot for studio ${studio.id}:`,
      resultHeadshotError.message
    );
  }

  return "/placeholder.svg"; // Fallback
}

export async function getStudiosData(currentUserId, contextType, contextId) {
  noStore(); // Ensure dynamic data fetching
  const supabase = await createSupabaseServerClient();

  if (!currentUserId) {
    return {
      error: { message: "User not authenticated." },
      studios: [],
      pageTitle: "Error",
    };
  }

  let studiosQuery;
  let pageTitle = "Studios";
  let isOrgAdminViewingCurrentContext = false;
  let effectiveContextId = null; // To pass to image fetcher for org admin view

  if (contextType === "personal") {
    pageTitle = "Personal Studios";
    studiosQuery = supabase
      .from("studios")
      .select("*, organizations (name)")
      .eq("creator_user_id", currentUserId)
      .is("organization_id", null);
  } else if (contextType === "organization" && contextId) {
    effectiveContextId = contextId;
    const { data: orgMember, error: orgMemberError } = await supabase
      .from("organization_members")
      .select("role, organizations (name, owner_user_id)")
      .eq("user_id", currentUserId)
      .eq("organization_id", contextId)
      .single();

    if (orgMemberError || !orgMember) {
      console.error(
        "SA: Error fetching org membership:",
        orgMemberError?.message
      );
      return {
        error: orgMemberError || { message: "Org context error." },
        studios: [],
        pageTitle: "Error",
      };
    }

    const orgName = orgMember.organizations?.name || "Organization";
    const isOwner = orgMember.organizations?.owner_user_id === currentUserId;
    const isAdmin = orgMember.role === "admin" || isOwner;
    isOrgAdminViewingCurrentContext = isAdmin;

    if (isAdmin) {
      pageTitle = `${orgName} Studios (Admin View)`;
      studiosQuery = supabase
        .from("studios")
        .select(
          "*, organizations (name), profiles!inner(user_id, full_name, email)"
        ) //   Ensure profiles join
        .eq("organization_id", contextId)

        .eq("downloaded", true);
    } else {
      pageTitle = `Your Studios in ${orgName}`;
      studiosQuery = supabase
        .from("studios")
        .select("*, organizations (name)")
        .eq("creator_user_id", currentUserId)
        .eq("organization_id", contextId);
    }
  } else {
    return {
      error: { message: "Invalid context." },
      studios: [],
      pageTitle: "Error",
    };
  }

  const { data: rawStudios, error: studiosError } = await studiosQuery.order(
    "created_at",
    { ascending: false }
  );

  if (studiosError) {
    console.error("SA: Error fetching studios:", studiosError.message);
    return { error: studiosError, studios: [], pageTitle };
  }

  const studiosWithImages = await Promise.all(
    (rawStudios || []).map(async (studio) => {
      // For org admin view, pass true to getStudioDisplayImage if it's an org studio they are admin of
      // For personal, userIdForFavorites is currentUserId, isOrgAdminViewingOrgStudio is false
      // For org member (not admin), userIdForFavorites is currentUserId, isOrgAdminViewingOrgStudio is false
      // For org admin, userIdForFavorites can be null (to fetch any favorite), isOrgAdminViewingOrgStudio is true
      const isCurrentStudioInAdminOrgView =
        contextType === "organization" &&
        studio.organization_id === effectiveContextId &&
        isOrgAdminViewingCurrentContext;

      return {
        ...studio,
        imageUrl: await getStudioDisplayImage(
          supabase,
          studio,
          currentUserId,
          isCurrentStudioInAdminOrgView
        ),
      };
    })
  );

  return {
    studios: studiosWithImages,
    error: null,
    pageTitle,
    isOrgAdminViewingCurrentContext,
    currentOrgId: effectiveContextId,
  };
}

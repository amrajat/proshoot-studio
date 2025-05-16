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

  if (!currentUserId || !studioId) {
    return {
      error: { message: "User or Studio ID missing." },
      studio: null,
      favorites: [],
      resultHeadshots: [],
      previewHeadshots: [],
      canFavorite: false,
      viewMode: "",
    };
  }

  // 1. Fetch Studio Details
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select("*, organizations (name)")
    .eq("id", studioId)
    .maybeSingle(); // Use maybeSingle in case ID is invalid

  if (studioError || !studio) {
    return {
      error: studioError || { message: "Studio not found." },
      studio: null,
      favorites: [],
      resultHeadshots: [],
      previewHeadshots: [],
      canFavorite: false,
      viewMode: "",
    };
  }

  let favorites = [];
  let resultHeadshots = [];
  let previewHeadshots = [];
  let canFavorite = false;
  let viewMode = "preview"; // Possible values: preview, creator, admin_viewing_member_studio

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
        "SA Details: Error fetching org membership for studio owner check:",
        orgMemberError.message
      );
    } else if (orgMember) {
      const isOwner = orgMember.organizations?.owner_user_id === currentUserId;
      isOrgAdmin = orgMember.role === "admin" || isOwner;
    }
  }

  if (!studio.downloaded) {
    // PREVIEW MODE: Only show preview_headshots, no favorites, no result_headshots
    viewMode = "preview";
    const { data: preview, error: previewError } = await supabase
      .from("preview_headshots")
      .select("id, image_url, created_at")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: true });

    previewHeadshots = preview || [];
    canFavorite = false;
  } else {
    // DOWNLOADED MODE
    if (
      // Personal context, or org context where user is creator (member or admin)
      (currentContextType === "personal" &&
        studio.creator_user_id === currentUserId) ||
      (currentContextType === "organization" &&
        studio.creator_user_id === currentUserId)
    ) {
      // Show both favorites and result headshots
      viewMode = "creator";
      canFavorite = true;
      // Fetch favorites for this user and studio
      const { data: favs, error: favsError } = await supabase
        .from("favorites")
        .select("headshot_id, result_headshots (id, image_url, created_at)")
        .eq("user_id", currentUserId)
        .eq("studio_id", studioId);

      favorites = (favs || []).map((f) => f.result_headshots).filter(Boolean);
      // Fetch all result headshots
      const { data: results, error: resultsError } = await supabase
        .from("result_headshots")
        .select("id, image_url, created_at")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: true });

      resultHeadshots = results || [];
    } else if (
      currentContextType === "organization" &&
      isOrgAdmin &&
      studio.creator_user_id !== currentUserId
    ) {
      // Admin viewing another member's org studio: show only creator's favorites
      viewMode = "admin_viewing_member_studio";
      canFavorite = false;
      // Fetch favorites for the studio creator
      const { data: adminFavoritesData, error: adminFavError } = await supabase
        .from("favorites")
        .select("headshot_id, result_headshots (id, image_url, created_at)")
        .eq("studio_id", studioId)
        .eq("user_id", studio.creator_user_id);

      favorites = (adminFavoritesData || [])
        .map((f) => f.result_headshots)
        .filter(Boolean);
      resultHeadshots = [];
    } else {
      // Fallback: show only result headshots (should not happen in normal flows)
      viewMode = "creator";
      canFavorite = false;
      const { data: results, error: resultsError } = await supabase
        .from("result_headshots")
        .select("id, image_url, created_at")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: true });

      resultHeadshots = results || [];
      favorites = [];
    }
  }

  return {
    studio,
    favorites,
    resultHeadshots,
    previewHeadshots,
    canFavorite,
    viewMode,
  };
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

"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";

/**
 * Toggle favorite status for a headshot
 * @param {string} headshotId - Headshot ID
 * @param {string} studioId - Studio ID
 * @param {string} currentUserId - Current user ID
 * @param {boolean} isFavorite - Current favorite status
 * @returns {Promise<{success: boolean, error: object|null, isFavorite: boolean}>}
 */
export async function toggleFavorite(
  headshotId,
  studioId,
  currentUserId,
  isFavorite
) {
  // Input validation
  if (!headshotId || typeof headshotId !== "string") {
    return {
      success: false,
      error: { message: "Valid headshot ID is required." },
      isFavorite: false,
    };
  }

  if (!studioId || typeof studioId !== "string") {
    return {
      success: false,
      error: { message: "Valid studio ID is required." },
      isFavorite: false,
    };
  }

  if (!currentUserId || typeof currentUserId !== "string") {
    return {
      success: false,
      error: { message: "User authentication required." },
      isFavorite: false,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Verify user owns the studio
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("creator_user_id")
      .eq("id", studioId)
      .single();

    if (studioError || studio?.creator_user_id !== currentUserId) {
      return {
        success: false,
        error: {
          message:
            "Access denied. You can only modify your own studio favorites.",
        },
        isFavorite: false,
      };
    }

    if (isFavorite) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("headshot_id", headshotId)
        .eq("studio_id", studioId)
        .eq("user_id", currentUserId);

      if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        return {
          success: false,
          error: { message: "Failed to remove from favorites." },
          isFavorite: true,
        };
      }

      return {
        success: true,
        error: null,
        isFavorite: false,
      };
    } else {
      // Add to favorites
      const { error: insertError } = await supabase.from("favorites").insert({
        headshot_id: headshotId,
        studio_id: studioId,
        user_id: currentUserId,
      });

      if (insertError) {
        console.error("Error adding favorite:", insertError);
        return {
          success: false,
          error: { message: "Failed to add to favorites." },
          isFavorite: false,
        };
      }

      return {
        success: true,
        error: null,
        isFavorite: true,
      };
    }
  } catch (error) {
    console.error("Unexpected error in toggleFavorite:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred. Please try again." },
      isFavorite: false,
    };
  }
}

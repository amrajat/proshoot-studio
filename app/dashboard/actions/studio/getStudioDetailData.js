"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";

/**
 * Get studio detail data with headshots and favorites
 * @param {string} studioId - Studio ID
 * @param {string} currentUserId - Current user ID
 * @returns {Promise<{success: boolean, error: object|null, studio: object|null, headshots: array, favorites: array}>}
 */
export async function getStudioDetailData(studioId, currentUserId) {
  // Input validation
  if (!studioId || typeof studioId !== "string") {
    return {
      success: false,
      error: { message: "Valid studio ID is required." },
      studio: null,
      headshots: [],
      favorites: [],
    };
  }

  if (!currentUserId || typeof currentUserId !== "string") {
    return {
      success: false,
      error: { message: "User authentication required." },
      studio: null,
      headshots: [],
      favorites: [],
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    console.log("🔍 [DEBUG] Starting getStudioDetailData for:", {
      studioId,
      currentUserId,
    });

    // QUERY 1: Get basic studio information
    // Simple English: "Find the studio with this ID and tell me who created it"
    console.log("📋 [DEBUG] QUERY 1: Fetching studio details...");
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select(
        `
        id,
        creator_user_id,
        organization_id,
        name,
        status,
        created_at,
        organizations(name)
      `
      )
      .eq("id", studioId)
      .single();

    console.log("📋 [DEBUG] QUERY 1 Result:", { studio, studioError });

    if (studioError) {
      console.error("Error fetching studio:", studioError);
      return {
        success: false,
        error: { message: "Studio not found or access denied." },
        studio: null,
        headshots: [],
        favorites: [],
      };
    }

    // SECURITY CHECK: Make sure the user can access this studio
    // Simple English: "Is this person the creator OR the organization owner?"
    const isStudioCreator = studio.creator_user_id === currentUserId;

    let isOrganizationOwner = false;
    if (!isStudioCreator && studio.organization_id) {
      // Check if current user is the owner of the studio's organization
      const { data: orgData } = await supabase
        .from("organizations")
        .select("owner_user_id")
        .eq("id", studio.organization_id)
        .single();

      isOrganizationOwner = orgData?.owner_user_id === currentUserId;
    }

    console.log("🔒 [DEBUG] SECURITY CHECK:", {
      studioCreator: studio.creator_user_id,
      currentUser: currentUserId,
      organizationId: studio.organization_id,
      isStudioCreator,
      isOrganizationOwner,
      hasAccess: isStudioCreator || isOrganizationOwner,
    });

    if (!isStudioCreator && !isOrganizationOwner) {
      console.log(
        "❌ [DEBUG] ACCESS DENIED: User is neither studio creator nor organization owner"
      );
      return {
        success: false,
        error: {
          message:
            "Access denied. You can only view your own studios or studios from your organization.",
        },
        studio: null,
        headshots: [],
        favorites: [],
      };
    }

    console.log("✅ [DEBUG] ACCESS GRANTED:", {
      reason: isStudioCreator
        ? "User is studio creator"
        : "User is organization owner",
    });
    console.log("🎨 [DEBUG] Studio Status:", studio.status);

    // Fetch headshots based on studio status
    let headshots = [];
    let favorites = [];

    if (studio.status === "COMPLETED") {
      console.log("🎨 [DEBUG] COMPLETED STATUS: Fetching preview images...");

      // QUERY 2A: Get all preview images for COMPLETED studio (using secure view)
      // Simple English: "Show me all the watermarked preview images for this studio"
      // Using secure view ensures result/hd columns are NULL for COMPLETED status
      console.log(
        "🖼️ [DEBUG] QUERY 2A: Getting preview images via secure view..."
      );
      const { data: headshotsData, error: headshotsError } = await supabase
        .from("headshots_secure")
        .select("id, preview, prompt, created_at, studio_status")
        .eq("studio_id", studioId)
        .not("preview", "is", null)
        .order("created_at", { ascending: false });

      console.log("🖼️ [DEBUG] QUERY 2A Result:", {
        foundImages: headshotsData?.length || 0,
        error: headshotsError,
        sampleImage: headshotsData?.[0],
      });

      if (headshotsError) {
        console.error("❌ [DEBUG] Error fetching headshots:", headshotsError);
      } else {
        headshots = headshotsData || [];
        console.log(
          "✅ [DEBUG] Successfully loaded",
          headshots.length,
          "preview images"
        );
      }
    } else if (studio.status === "ACCEPTED") {
      if (isOrganizationOwner && !isStudioCreator) {
        console.log(
          "🏢 [DEBUG] ACCEPTED STATUS (ORG OWNER): Fetching only favorites created by studio owner..."
        );

        // QUERY 2B-ORG: Get studio creator's favorite images (organization owner view)
        // Simple English: "Show me only the favorites that the studio creator has marked"
        // Organization owners can only see favorites for privacy reasons
        console.log(
          "❤️ [DEBUG] QUERY 2B-ORG: Getting studio creator's favorite images via secure view..."
        );
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select(
            `
            id,
            headshot_id,
            created_at,
            headshots_secure!inner(
              id,
              result,
              hd,
              prompt,
              created_at,
              studio_status
            )
          `
          )
          .eq("studio_id", studioId)
          .eq("user_id", studio.creator_user_id) // Use studio creator's favorites, not current user
          .order("created_at", { ascending: false });

        console.log("❤️ [DEBUG] QUERY 2B-ORG Result:", {
          foundFavorites: favoritesData?.length || 0,
          error: favoritesError,
          sampleFavorite: favoritesData?.[0],
        });

        if (favoritesError) {
          console.error("❌ [DEBUG] Error fetching favorites:", favoritesError);
        } else {
          favorites = favoritesData || [];
          console.log(
            "✅ [DEBUG] Successfully loaded",
            favorites.length,
            "studio creator's favorite images"
          );
        }

        // Organization owners don't get access to all headshots for privacy
        headshots = [];
      } else {
        console.log(
          "⭐ [DEBUG] ACCEPTED STATUS (CREATOR): Fetching favorites and all images..."
        );

        // QUERY 2B: Get user's favorite images for ACCEPTED studio
        // Simple English: "Show me the high-quality images this user has marked as favorites"
        // This joins two tables: favorites + headshots_secure to get the actual image data
        console.log(
          "❤️ [DEBUG] QUERY 2B: Getting user's favorite images via secure view..."
        );
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select(
            `
            id,
            headshot_id,
            created_at,
            headshots_secure!inner(
              id,
              result,
              hd,
              prompt,
              created_at,
              studio_status
            )
          `
          )
          .eq("studio_id", studioId)
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false });

        console.log("❤️ [DEBUG] QUERY 2B Result:", {
          foundFavorites: favoritesData?.length || 0,
          error: favoritesError,
          sampleFavorite: favoritesData?.[0],
        });

        if (favoritesError) {
          console.error("❌ [DEBUG] Error fetching favorites:", favoritesError);
        } else {
          favorites = favoritesData || [];
          console.log(
            "✅ [DEBUG] Successfully loaded",
            favorites.length,
            "favorite images"
          );
        }

        // QUERY 2C: Get ALL available high-quality images for favorite toggling
        // Simple English: "Show me every high-quality image in this studio so user can add/remove favorites"
        // Using secure view ensures result/hd columns are only shown for ACCEPTED status
        console.log(
          "🖼️ [DEBUG] QUERY 2C: Getting all available images via secure view..."
        );
        const { data: allHeadshotsData, error: allHeadshotsError } =
          await supabase
            .from("headshots_secure")
            .select("id, result, hd, prompt, created_at, studio_status")
            .eq("studio_id", studioId)
            .or("result.not.is.null,hd.not.is.null")
            .order("created_at", { ascending: false });

        console.log("🖼️ [DEBUG] QUERY 2C Result:", {
          foundAllImages: allHeadshotsData?.length || 0,
          error: allHeadshotsError,
          sampleImage: allHeadshotsData?.[0],
          imageTypes: allHeadshotsData
            ?.map((img) => ({
              id: img.id,
              hasResult: !!img.result,
              hasHD: !!img.hd,
            }))
            .slice(0, 3), // Show first 3 as sample
        });

        if (allHeadshotsError) {
          console.error(
            "❌ [DEBUG] Error fetching all headshots:",
            allHeadshotsError
          );
        } else {
          headshots = allHeadshotsData || [];
          console.log(
            "✅ [DEBUG] Successfully loaded",
            headshots.length,
            "total high-quality images for favoriting"
          );
        }
      }
    }

    // FINAL RESULT: Package everything up to send back to the frontend
    const result = {
      success: true,
      error: null,
      studio,
      headshots,
      favorites,
    };

    console.log("🎉 [DEBUG] FINAL RESULT:", {
      success: result.success,
      studioName: result.studio?.name,
      studioStatus: result.studio?.status,
      headshotsCount: result.headshots?.length || 0,
      favoritesCount: result.favorites?.length || 0,
      organizationName: result.studio?.organizations?.name || "Personal",
    });

    return result;
  } catch (error) {
    console.error("Unexpected error in getStudioDetailData:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred. Please try again." },
      studio: null,
      headshots: [],
      favorites: [],
    };
  }
}

"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { generateSecureImageUrls } from "@/lib/jwt-image-delivery-tokens";
import { env, publicEnv } from "@/lib/env";

/**
 * Secure Studio Detail Data Fetcher
 * Fetches studio data with secure image URLs for authorized users
 *
 * @param {string} studioId - Studio UUID
 * @param {string} currentUserId - Current user UUID
 * @returns {Promise<{success: boolean, studio?: object, headshots?: array, favorites?: array, error?: object}>}
 */
export const fetchStudio = async (studioId, currentUserId) => {
  if (!studioId || !currentUserId) {
    return {
      success: false,
      error: { message: "Studio ID and user ID are required" },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Fetch studio with organization info
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select(
        `
        *,
        organizations (
          id,
          name,
          owner_user_id
        )
      `
      )
      .eq("id", studioId)
      .single();

    if (studioError || !studio) {
      return {
        success: false,
        error: { message: "Studio not found or access denied" },
      };
    }

    // Check authorization
    const isStudioCreator = studio.creator_user_id === currentUserId;
    const isOrganizationOwner =
      studio.organizations?.owner_user_id === currentUserId;

    if (!isStudioCreator && !isOrganizationOwner) {
      return {
        success: false,
        error: {
          message:
            "Access denied: You must be the studio creator or organization owner",
        },
      };
    }

    // Fetch headshots based on studio status
    let headshots = [];
    let favorites = [];

    if (studio.status === "COMPLETED" || studio.status === "ACCEPTED") {
      // Fetch headshots
      const { data: headshotsData, error: headshotsError } = await supabase
        .from("headshots")
        .select("*")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: true });

      if (headshotsError) {
        return {
          success: false,
          error: { message: "Failed to fetch headshots" },
        };
      }

      headshots = headshotsData || [];

      // For ACCEPTED status, also fetch favorites
      if (studio.status === "ACCEPTED") {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select(
            `
            *,
            headshots (*)
          `
          )
          .eq("studio_id", studioId)
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false });

        if (favoritesError) {
          console.error("Error fetching favorites:", favoritesError);
        } else {
          favorites = favoritesData || [];
        }
      }

      // Generate secure URLs for all images
      if (headshots.length > 0) {
        const jwtSecret = env.R2_IMAGES_DELIVERY_PROXY_JWT_SECRET;
        const deliveryDomain = publicEnv.NEXT_PUBLIC_IMAGE_DELIVERY_DOMAIN;

        if (jwtSecret && deliveryDomain) {
          try {
            // Extract and validate image keys from headshots
            const imageKeys = [];
            const authFallbackUrl = "/images/image-delivery-auth-fallback.png";

            headshots.forEach((headshot) => {
              // Validate each image key belongs to authorized studio
              if (headshot.preview) {
                if (headshot.preview.startsWith(studioId + "/")) {
                  imageKeys.push(headshot.preview);
                } else {
                  // Replace unauthorized key with fallback
                  headshot.preview = authFallbackUrl;
                }
              }
              if (headshot.result) {
                if (headshot.result.startsWith(studioId + "/")) {
                  imageKeys.push(headshot.result);
                } else {
                  headshot.result = authFallbackUrl;
                }
              }
              if (headshot.hd) {
                if (headshot.hd.startsWith(studioId + "/")) {
                  imageKeys.push(headshot.hd);
                } else {
                  headshot.hd = authFallbackUrl;
                }
              }
            });

            // Extract and validate keys from favorites
            const favoriteImageKeys = [];
            favorites.forEach((fav) => {
              if (fav && fav.headshots) {
                if (fav.headshots.preview) {
                  if (fav.headshots.preview.startsWith(studioId + "/")) {
                    favoriteImageKeys.push(fav.headshots.preview);
                  } else {
                    fav.headshots.preview = authFallbackUrl;
                  }
                }
                if (fav.headshots.result) {
                  if (fav.headshots.result.startsWith(studioId + "/")) {
                    favoriteImageKeys.push(fav.headshots.result);
                  } else {
                    fav.headshots.result = authFallbackUrl;
                  }
                }
                if (fav.headshots.hd) {
                  if (fav.headshots.hd.startsWith(studioId + "/")) {
                    favoriteImageKeys.push(fav.headshots.hd);
                  } else {
                    fav.headshots.hd = authFallbackUrl;
                  }
                }
              }
            });

            // Combine and deduplicate validated keys only
            const allImageKeys = [
              ...new Set([...imageKeys, ...favoriteImageKeys]),
            ];

            if (allImageKeys.length > 0) {
              // Generate secure URLs
              const secureUrls = await generateSecureImageUrls(
                allImageKeys,
                jwtSecret,
                deliveryDomain
              );

              // Create lookup map for quick access
              const urlMap = new Map(
                secureUrls.map((item) => [item.key, item.secureUrl])
              );

              // Replace URLs in headshots
              headshots = headshots.map((headshot) => ({
                ...headshot,
                preview: headshot.preview
                  ? urlMap.get(headshot.preview) || headshot.preview
                  : null,
                result: headshot.result
                  ? urlMap.get(headshot.result) || headshot.result
                  : null,
                hd: headshot.hd ? urlMap.get(headshot.hd) || headshot.hd : null,
              }));

              // Replace URLs in favorites
              favorites = favorites.map((favorite) => ({
                ...favorite,
                headshots_secure: favorite.headshots
                  ? {
                      ...favorite.headshots,
                      preview: favorite.headshots.preview
                        ? urlMap.get(favorite.headshots.preview) ||
                          favorite.headshots.preview
                        : null,
                      result: favorite.headshots.result
                        ? urlMap.get(favorite.headshots.result) ||
                          favorite.headshots.result
                        : null,
                      hd: favorite.headshots.hd
                        ? urlMap.get(favorite.headshots.hd) ||
                          favorite.headshots.hd
                        : null,
                    }
                  : null,
              }));
            }
          } catch (urlError) {
            // Fallback to placeholder image when secure URL generation fails
            const placeholderUrl = "/images/image-delivery-fallback.png";

            // Replace all image URLs with placeholder
            headshots = headshots.map((headshot) => ({
              ...headshot,
              preview: placeholderUrl,
              result: placeholderUrl,
              hd: placeholderUrl,
            }));

            // Replace URLs in favorites with placeholder
            favorites = favorites.map((favorite) => ({
              ...favorite,
              headshots_secure: favorite.headshots
                ? {
                    ...favorite.headshots,
                    preview: placeholderUrl,
                    result: placeholderUrl,
                    hd: placeholderUrl,
                  }
                : null,
            }));
          }
        } else {
          // Missing JWT secret or delivery domain - use placeholder
          const placeholderUrl = "/images/image-delivery-fallback.png";

          // Replace all image URLs with placeholder
          headshots = headshots.map((headshot) => ({
            ...headshot,
            preview: placeholderUrl,
            result: placeholderUrl,
            hd: placeholderUrl,
          }));

          // Replace URLs in favorites with placeholder
          favorites = favorites.map((favorite) => ({
            ...favorite,
            headshots_secure: favorite.headshots
              ? {
                  ...favorite.headshots,
                  preview: placeholderUrl,
                  result: placeholderUrl,
                  hd: placeholderUrl,
                }
              : null,
          }));
        }
      }
    }

    return {
      success: true,
      studio,
      headshots,
      favorites,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "An unexpected error occurred while fetching studio data",
      },
    };
  }
};

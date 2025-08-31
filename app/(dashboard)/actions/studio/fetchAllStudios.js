"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { createSecureImageUrl } from "@/lib/jwt-image-delivery-tokens";
import { env, publicEnv } from "@/lib/env";

/**
 * Secure Studios Data Fetcher
 * Fetches studios list with secure thumbnail URLs for authorized users
 *
 * @param {string} userId - Current user UUID
 * @param {string} contextType - "personal" or "organization"
 * @param {string|null} contextId - Organization ID if contextType is "organization"
 * @returns {Promise<{success: boolean, studios?: array, pageTitle?: string, error?: object}>}
 */
export const fetchAllStudios = async (userId, contextType, contextId) => {
  if (!userId || !contextType) {
    return {
      success: false,
      error: { message: "User ID and context type are required" },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    let query = supabase
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
      .order("created_at", { ascending: false });

    // Apply context-based filtering
    if (contextType === "personal") {
      query = query.eq("creator_user_id", userId).is("organization_id", null);
    } else if (contextType === "organization" && contextId) {
      query = query.eq("organization_id", contextId);
    } else {
      return {
        success: false,
        error: { message: "Invalid context configuration" },
      };
    }

    const { data: studios, error: studiosError } = await query;

    if (studiosError) {
      console.error("Error fetching studios:", studiosError);
      return {
        success: false,
        error: { message: "Failed to fetch studios" },
      };
    }

    // Generate secure thumbnail URLs for ACCEPTED studios
    const jwtSecret = env.R2_IMAGES_DELIVERY_PROXY_JWT_SECRET;
    const deliveryDomain = publicEnv.NEXT_PUBLIC_IMAGE_DELIVERY_DOMAIN;

    let studiosWithSecureUrls = studios || [];

    if (jwtSecret && deliveryDomain && studiosWithSecureUrls.length > 0) {
      try {
        // Process studios to add secure thumbnail URLs
        studiosWithSecureUrls = await Promise.all(
          studiosWithSecureUrls.map(async (studio) => {
            // Only generate thumbnails for ACCEPTED studios
            if (studio.status === "ACCEPTED") {
              try {
                // Fetch a sample headshot for thumbnail
                const { data: sampleHeadshot } = await supabase
                  .from("headshots")
                  .select("result, preview")
                  .eq("studio_id", studio.id)
                  .not("result", "is", null)
                  .limit(1)
                  .single();

                if (sampleHeadshot) {
                  // Prefer result over preview for thumbnail
                  const thumbnailKey =
                    sampleHeadshot.result || sampleHeadshot.preview;

                  if (thumbnailKey) {
                    const secureUrl = await createSecureImageUrl(
                      thumbnailKey,
                      jwtSecret,
                      deliveryDomain
                    );

                    return {
                      ...studio,
                      imageUrl: secureUrl,
                    };
                  }
                }
              } catch (thumbnailError) {
                console.error(
                  `Error generating thumbnail for studio ${studio.id}:`,
                  thumbnailError
                );
                // Continue without thumbnail
              }
            }

            return studio;
          })
        );
      } catch (urlError) {
        console.error("Error generating secure URLs for studios:", urlError);
        // Continue with original data
      }
    }

    // Determine page title based on context
    let pageTitle = "Studios";
    if (contextType === "personal") {
      pageTitle = "Personal Studios";
    } else if (contextType === "organization" && contextId) {
      const orgName = studiosWithSecureUrls[0]?.organizations?.name;
      pageTitle = orgName ? `${orgName} Studios` : "Organization Studios";
    }

    return {
      success: true,
      studios: studiosWithSecureUrls,
      pageTitle,
    };
  } catch (error) {
    console.error("Error in fetchAllStudios:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred while fetching studios" },
    };
  }
};

"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

// Configure R2 Client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate presigned URL for a single object key
 * @param {string} objectKey - The R2 object key
 * @returns {Promise<string>} Presigned URL
 */
const generatePresignedUrl = async (objectKey) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "images",
      Key: objectKey,
      ResponseContentDisposition: `attachment; filename="${objectKey.split('/').pop()}"`,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return presignedUrl;
  } catch (error) {
    console.error(`Error generating presigned URL for ${objectKey}:`, error);
    return "/images/image-delivery-fallback.png";
  }
};

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

    // Generate presigned thumbnail URLs for ACCEPTED studios
    let studiosWithSecureUrls = studios || [];

    if (studiosWithSecureUrls.length > 0) {
      try {
        // Process studios to add presigned thumbnail URLs
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
                    const presignedUrl = await generatePresignedUrl(thumbnailKey);

                    return {
                      ...studio,
                      imageUrl: presignedUrl,
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
        console.error("Error generating presigned URLs for studios:", urlError);
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

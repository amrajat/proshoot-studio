"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Get Studios Data Server Action
 * 
 * Fetches studios based on account context with proper RLS security.
 * Handles both personal and organization contexts.
 * 
 * @param {string} currentUserId - Current authenticated user ID
 * @param {string} contextType - 'personal' or 'organization'
 * @param {string|null} contextId - Organization ID if contextType is 'organization'
 * @returns {Promise<Object>} Studios data with metadata
 */
export async function getStudiosData(currentUserId, contextType, contextId) {
  noStore(); // Ensure dynamic data fetching
  
  try {
    const supabase = await createSupabaseServerClient();

    // Validate input parameters
    if (!currentUserId) {
      return {
        success: false,
        error: { message: "User not authenticated." },
        studios: [],
        pageTitle: "Authentication Error",
      };
    }

    if (!contextType || !['personal', 'organization'].includes(contextType)) {
      return {
        success: false,
        error: { message: "Invalid context type." },
        studios: [],
        pageTitle: "Error",
      };
    }

    if (contextType === 'organization' && !contextId) {
      return {
        success: false,
        error: { message: "Organization ID is required for organization context." },
        studios: [],
        pageTitle: "Error",
      };
    }

    let studiosQuery;
    let pageTitle = "Studios";
    let isOwnerViewingTeam = false;

    if (contextType === "personal") {
      // Fetch personal studios (organization_id IS NULL)
      pageTitle = "Personal Studios";
      studiosQuery = supabase
        .from("studios")
        .select(`
          id,
          creator_user_id,
          organization_id,
          name,
          status,
          created_at
        `)
        .eq("creator_user_id", currentUserId)
        .is("organization_id", null)
        .order("created_at", { ascending: false });
    } else if (contextType === "organization") {
      // Check if user is the owner of this organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("name, owner_user_id")
        .eq("id", contextId)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
        return {
          success: false,
          error: { message: "Organization not found." },
          studios: [],
          pageTitle: "Error",
        };
      }

      isOwnerViewingTeam = org.owner_user_id === currentUserId;
      pageTitle = isOwnerViewingTeam ? `${org.name} Team Studios` : `${org.name} Studios`;

      if (isOwnerViewingTeam) {
        // Owner viewing team: get all team member studios (including owner's own org studios)
        // First, get all team members
        const { data: members, error: membersError } = await supabase
          .from("members")
          .select("user_id")
          .eq("organization_id", contextId);

        if (membersError) {
          console.warn("Error fetching team members:", membersError.message);
        }

        // Create array of user IDs (members + owner)
        const teamUserIds = [currentUserId]; // Include owner
        if (members) {
          members.forEach(member => {
            if (!teamUserIds.includes(member.user_id)) {
              teamUserIds.push(member.user_id);
            }
          });
        }

        // Fetch studios created by any team member in this organization
        studiosQuery = supabase
          .from("studios")
          .select(`
            id,
            creator_user_id,
            organization_id,
            name,
            status,
            created_at,
            organizations!inner(name)
          `)
          .eq("organization_id", contextId)
          .in("creator_user_id", teamUserIds)
          .order("created_at", { ascending: false });
      } else {
        // Regular member: only their own studios in this organization
        studiosQuery = supabase
          .from("studios")
          .select(`
            id,
            creator_user_id,
            organization_id,
            name,
            status,
            created_at,
            organizations!inner(name)
          `)
          .eq("organization_id", contextId)
          .eq("creator_user_id", currentUserId)
          .order("created_at", { ascending: false });
      }
    } else {
      return {
        success: false,
        error: { message: "Invalid context type. Must be 'personal' or 'organization'." },
        studios: [],
        pageTitle: "Error",
      };
    }

    const { data: studios, error: studiosError } = await studiosQuery;

    if (studiosError) {
      console.error("Error fetching studios:", studiosError);
      return {
        success: false,
        error: { message: "Failed to fetch studios. Please try again." },
        studios: [],
        pageTitle,
      };
    }

    // Fetch favorite images for ACCEPTED studios
    const studiosWithImages = await Promise.all(
      (studios || []).map(async (studio) => {
        let imageUrl = "/images/placeholder.svg"; // Default placeholder

        // Only fetch favorite image if studio status is ACCEPTED
        if (studio.status === "ACCEPTED") {
          try {
            const { data: favorite, error: favoriteError } = await supabase
              .from("favorites")
              .select(`
                headshots!inner(
                  preview,
                  result
                )
              `)
              .eq("studio_id", studio.id)
              .eq("user_id", studio.creator_user_id) // Use creator_user_id instead of currentUserId
              .limit(1)
              .maybeSingle();

            if (favorite?.headshots) {
              // Use result image if available, otherwise preview
              imageUrl = favorite.headshots.result || favorite.headshots.preview || imageUrl;
            }

            if (favoriteError && favoriteError.code !== "PGRST116") {
              console.warn(`Error fetching favorite for studio ${studio.id}:`, favoriteError.message);
            }
          } catch (error) {
            console.warn(`Error processing favorite for studio ${studio.id}:`, error.message);
          }
        }

        return {
          ...studio,
          imageUrl,
        };
      })
    );

    return {
      success: true,
      error: null,
      studios: studiosWithImages,
      pageTitle,
    };
  } catch (error) {
    console.error("Unexpected error in getStudiosData:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred." },
      studios: [],
      pageTitle: "Error",
    };
  }
}

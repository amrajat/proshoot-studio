"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

/**
 * Update studio status using secure RPC function
 * Only allows COMPLETED -> ACCEPTED/DELETED and ACCEPTED -> DELETED transitions
 * 
 * @param {string} studioId - Studio ID to update
 * @param {string} newStatus - New status ('ACCEPTED' or 'DELETED')
 * @returns {Object} Result object with success/error
 */
export async function updateStudioStatus(studioId, newStatus) {
  try {
    console.log("🔄 [DEBUG] updateStudioStatus called:", { studioId, newStatus });

    // Validate inputs
    if (!studioId || !newStatus) {
      return {
        success: false,
        error: { message: "Studio ID and new status are required" }
      };
    }

    if (!["ACCEPTED", "DELETED"].includes(newStatus)) {
      return {
        success: false,
        error: { message: "Invalid status. Only ACCEPTED and DELETED are allowed" }
      };
    }

    const supabase = await createSupabaseServerClient();

    // Call the secure RPC function
    const { data, error } = await supabase.rpc('update_studio_status', {
      p_studio_id: studioId,
      p_new_status: newStatus
    });

    console.log("📋 [DEBUG] RPC Result:", { data, error });

    if (error) {
      console.error("❌ [DEBUG] RPC Error:", error);
      return {
        success: false,
        error: { message: error.message || "Failed to update studio status" }
      };
    }

    // The RPC function returns a JSONB object
    if (!data.success) {
      console.error("❌ [DEBUG] RPC Function Error:", data.error);
      return {
        success: false,
        error: { message: data.error }
      };
    }

    console.log("✅ [DEBUG] Studio status updated successfully:", data.message);

    // Revalidate the studio detail page to reflect changes
    revalidatePath(`/studio/${studioId}`);
    
    // Also revalidate the studios list page
    revalidatePath("/studio");

    return {
      success: true,
      message: data.message,
      previousStatus: data.previous_status,
      newStatus: data.new_status
    };

  } catch (error) {
    console.error("Unexpected error in updateStudioStatus:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred. Please try again." }
    };
  }
}

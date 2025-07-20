"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export async function updateStudioDownloadedStatusAction(studioId, userId) {
  if (!studioId || !userId) {
    return { error: { message: "Studio ID and User ID are required." } };
  }

  const supabase = await createSupabaseServerClient();

  // First, verify the user is the creator of the studio
  const { data: studio, error: fetchError } = await supabase
    .from("studios")
    .select("creator_user_id")
    .eq("id", studioId)
    .single();

  if (fetchError || !studio) {
    // Consider more specific error logging or messages
    console.error("Fetch studio error for download status update:", fetchError);
    return {
      error: {
        message: "Studio not found or access denied when fetching for update.",
      },
    };
  }

  if (studio.creator_user_id !== userId) {
    return {
      error: { message: "Only the studio creator can perform this action." },
    };
  }

  // Update the downloaded status
  const { error: updateError } = await supabase
    .from("studios")
    .update({ downloaded: true, status: "completed" })
    .eq("id", studioId)
    .eq("creator_user_id", userId); // Ensure ownership on update

  if (updateError) {
    console.error("Error updating studio downloaded status:", updateError);
    return {
      error: {
        message: "Failed to update studio status: " + updateError.message,
      },
    };
  }

  revalidatePath(`/dashboard/studio/${studioId}`);
  // Optional: revalidate other relevant paths, e.g., a general studio list page
  // revalidatePath(`/dashboard/studios`);

  return {
    success: true,
    message: "Studio successfully marked as downloaded.",
  };
}

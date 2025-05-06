"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as z from "zod";

const inputSchema = z.object({
  studioId: z.string().uuid(),
  headshotId: z.string().uuid(),
  isCurrentlyFavorited: z.boolean(),
});

export async function toggleFavoriteAction(input) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  // 1. Validate input
  const validatedInput = inputSchema.safeParse(input);
  if (!validatedInput.success) {
    return {
      error: "Invalid input.",
      newFavoriteState: input.isCurrentlyFavorited,
    };
  }
  const { studioId, headshotId, isCurrentlyFavorited } = validatedInput.data;

  try {
    // 2. Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        error: "User not authenticated.",
        newFavoriteState: isCurrentlyFavorited,
      };
    }

    // No explicit permission check needed here IF RLS is correct.
    // The RLS policies on the 'favorites' table will enforce:
    // - INSERT: User must have SELECT access to the studio.
    // - DELETE: User must be the owner of the favorite (auth.uid() = user_id).

    if (isCurrentlyFavorited) {
      // 3a. Remove from favorites
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id) // Ensure deleting own favorite
        .eq("studio_id", studioId)
        .eq("headshot_id", headshotId);

      if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        // RLS errors (like 42501) should be caught here if policies are wrong
        return {
          error: "Could not remove from favorites.",
          newFavoriteState: true, // Keep UI state consistent on error
        };
      }
      revalidatePath(`/dashboard/studio/${studioId}`);
      // Also revalidate org favorites page if applicable (though less critical here)
      // Consider revalidating the specific org favorites page if you know the studio's org ID
      // revalidatePath(`/dashboard/organization/[orgId]/favorites`);
      return { success: true, newFavoriteState: false };
    } else {
      // 3b. Add to favorites
      const { error: insertError } = await supabase.from("favorites").insert({
        user_id: user.id,
        studio_id: studioId,
        headshot_id: headshotId,
      });

      if (insertError) {
        console.error("Error adding favorite:", insertError);
        // Unique constraint violation (already favorited)
        if (insertError.code === "23505") {
          revalidatePath(`/dashboard/studio/${studioId}`);
          return { success: true, newFavoriteState: true };
        }
        // RLS errors (like 42501) will be caught here
        return {
          error: "Could not add to favorites.",
          newFavoriteState: false,
        };
      }
      revalidatePath(`/dashboard/studio/${studioId}`);
      // Consider revalidating the specific org favorites page
      return { success: true, newFavoriteState: true };
    }
  } catch (e) {
    console.error("Unexpected error toggling favorite:", e);
    return {
      error: "An unexpected error occurred.",
      newFavoriteState: isCurrentlyFavorited,
    };
  }
}

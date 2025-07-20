"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export async function addStudio(formData, accountContext) {
  const supabase = createServerActionClient({ cookies });
  let studioId; // Define studioId here to be accessible for redirection

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not found.");
    }

    // 1. Update 'refered_by' in profiles if applicable
    if (formData.howDidYouHearAboutUs) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ refered_by: formData.howDidYouHearAboutUs })
        .eq("id", user.id)
        .is("refered_by", null);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // We can decide not to block studio creation for this, so just log it.
      }
    }

    studioId = uuidv4();

    // 2. Create a new entry in public.studios table
    const studioData = {
      id: studioId,
      creator_user_id: user.id,
      organization_id:
        accountContext?.type === "organization" ? accountContext.id : null,
      name: formData.studioName,
      status: "pending",
      plan: formData.plan,
      attributes: {
        gender: formData.gender,
        age: formData.age,
        ethnicity: formData.ethnicity,
        hairstyle: formData.hairstyle,
        eyecolor: formData.eyecolor,
        glasses: formData.glasses,
      },
      attire_ids: formData.clothing,
      background_ids: formData.backgrounds,
      dataset: formData.images,
    };

    const { error: studioError } = await supabase
      .from("studios")
      .insert(studioData);

    if (studioError) {
      throw new Error(`Error creating studio: ${studioError.message}`);
    }

    // 3. Call the RunPod API
    const runpodApiUrl = process.env.RUNPOD_API_URL;
    if (runpodApiUrl) {
      // We will uncomment this once we have the runpod api url working
      /*
      const response = await fetch(runpodApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authorization headers
        },
        body: JSON.stringify({
          studio_id: studioId,
          ...studioData, // Send all data or just what's needed
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`RunPod API call failed: ${response.status} ${errorBody}`);
      }
      */
    } else {
      console.warn(
        "RUNPOD_API_URL environment variable not set. Skipping API call."
      );
    }
  } catch (error) {
    console.error("Error adding studio:", error);
    return {
      error: {
        message: error.message,
      },
    };
  }

  // 4. Redirect user on success
  // This needs to be outside the try block for redirect to work.
  // The redirect function throws an error, which would be caught by the catch block.
  if (studioId) {
    redirect(`/dashboard/studio/${studioId}`);
  }
}

/**
 * Deletes a studio.
 * @param {string} studioId - The ID of the studio to delete.
 */
export async function deleteStudio(studioId) {
  console.log(`deleteStudio function called for studioId: ${studioId}`);
  // we'll implement this later
}

/**
 * Refunds a studio.
 * @param {string} studioId - The ID of the studio to refund.
 */
export async function refundStudio(studioId) {
  console.log(`refundStudio function called for studioId: ${studioId}`);
  // we'll implement this later
}

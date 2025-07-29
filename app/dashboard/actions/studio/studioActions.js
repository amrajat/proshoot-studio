"use server";
// this must be service_role only.

export async function createStudio(studioData) {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");

  try {
    // Create Supabase client with service role for webhook operations
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Map studioData to database schema
    const {
      studioID,
      user_id: creator_user_id,
      organization_id,
      studioName: name,
      images: datasets_object_key,
      style_pairs,
      plan,
      gender,
      age,
      ethnicity,
      hairLength,
      hairColor,
      hairType,
      eyeColor,
      glasses,
      bodyType,
      height,
      weight,
      ...metadata
    } = studioData;

    // Prepare user_attributes object
    const user_attributes = {
      gender,
      age,
      ethnicity,
      hairLength,
      hairColor,
      hairType,
      eyeColor,
      glasses,
      bodyType,
      height,
      weight
    };

    // Insert studio record
    const { data, error } = await supabase
      .from("studios")
      .insert({
        id: studioID,
        creator_user_id,
        organization_id: organization_id || null,
        name,
        status: "PROCESSING",
        provider: "REPLICATE",
        datasets_object_key,
        style_pairs,
        user_attributes,
        plan: plan.toUpperCase(),
        started_at: new Date().toISOString(),
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating studio:", error);
      throw new Error(`Failed to create studio: ${error.message}`);
    }

    console.log("✅ Studio created successfully:", data.id);

    // TODO: Call Modal training API
    // 1. PREPARE THE DATASET
    // 2. CALL THE REPLICATE API AND START TRAINING
    // 3. GET TRAINING ID FROM REPLICATE
    // 4. UPDATE STUDIO WITH PROVIDER_ID

    return data;
  } catch (error) {
    console.error("❌ Studio creation failed:", error);
    throw error;
  }
}

export async function deleteStudio(studioID) {}
export async function redoStudio(studioID) {}
export async function refundStudio(studioID) {}
export async function updateStudioStatus(studioID, status) {}

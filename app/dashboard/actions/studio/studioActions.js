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
      ...rest
    } = studioData;

    // Deduct credits before creating studio
    const { data: creditResult, error: creditError } = await supabase.rpc(
      "deduct_credits",
      {
        p_user_id: creator_user_id,
        p_plan: plan,
        p_credits_to_deduct: 1,
        p_context: organization_id ? "ORGANIZATION" : "PERSONAL",
        p_studio_id: studioID,
        p_description: `Studio creation - ${plan.toUpperCase()} plan (${name})`,
      }
    );

    if (creditError) {
      console.error("❌ Credit deduction failed:", creditError);
      throw new Error(`Failed to deduct credits: ${creditError.message}`);
    }

    // Check if credit deduction was successful
    if (!creditResult?.success) {
      console.error("❌ Insufficient credits:", creditResult);
      throw new Error(
        creditResult?.error || "Insufficient credits for studio creation"
      );
    }

    // Prepare user_attributes object
    const user_attributes = {
      trigger_word: "ohwx",
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
    };

    // Call Modal training API first to get provider_id
    const myHeaders = new Headers();
    myHeaders.append("Modal-Key", "modal-key");
    myHeaders.append("Modal-Secret", "modal-secret");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      object_key: datasets_object_key,
      gender: gender,
      user_id: creator_user_id,
      plan: plan,
      studio_id: studioID,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const ModalResponse = await fetch(
      "https://ablognet--replicate-lora-trainer-dev.modal.run",
      requestOptions
    );

    if (!ModalResponse.ok) {
      console.error("❌ Modal API call failed");
      throw new Error("Failed to start training");
    }

    const modalData = await ModalResponse.json();

    // Create studio record in database
    const { data, error } = await supabase
      .from("studios")
      .insert({
        id: studioID,
        creator_user_id,
        organization_id: organization_id || null,
        name,
        status: "PROCESSING",
        provider_id: modalData.id || null,
        provider: "REPLICATE",
        datasets_object_key,
        style_pairs,
        user_attributes,
        plan: plan.toUpperCase(),
        metadata: modalData,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating studio:", error);
      throw new Error(`Failed to create studio: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("❌ Studio creation failed:", error);
    throw error;
  }
}

// export async function deleteStudio(studioID) {}
// export async function redoStudio(studioID) {}
// export async function refundStudio(studioID) {}
// export async function updateStudioStatus(studioID, status) {}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel free plan limit

export async function POST(request) {
  try {
    const body = await request.json();
    const { studioData: studioFormData, user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
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

    // Map studioFormData to database schema
    const {
      studioID,
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
    } = studioFormData;

    // Create studio record FIRST (before deducting credits to avoid FK constraint)
    const { data: studioRecord, error: studioError } = await supabase
      .from("studios")
      .insert({
        id: studioID,
        creator_user_id: user_id,
        organization_id: organization_id || null,
        name,
        status: "PROCESSING",
        provider_id: null,
        provider: "REPLICATE",
        datasets_object_key,
        style_pairs,
        user_attributes: {
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
        },
        plan: plan.toUpperCase(),
        metadata: {},
      })
      .select()
      .single();

    if (studioError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create studio: ${studioError.message}`,
        },
        { status: 500 }
      );
    }

    // Deduct credits AFTER creating studio (to satisfy FK constraint)
    const { data: creditResult, error: creditError } = await supabase.rpc(
      "deduct_credits",
      {
        p_user_id: user_id,
        p_plan: plan.toLowerCase(),
        p_credits_to_deduct: 1,
        p_context: organization_id ? "ORGANIZATION" : "PERSONAL",
        p_studio_id: studioID,
        p_description: `Studio creation - ${plan.toUpperCase()} plan (${name})`,
      }
    );

    if (creditError) {
      // If credit deduction fails, delete the created studio
      await supabase.from("studios").delete().eq("id", studioID);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to deduct credits: ${creditError.message}`,
        },
        { status: 400 }
      );
    }

    // Check if credit deduction was successful
    if (!creditResult?.success) {
      // If credit deduction fails, delete the created studio
      await supabase.from("studios").delete().eq("id", studioID);
      return NextResponse.json(
        {
          success: false,
          error:
            creditResult?.error || "Insufficient credits for studio creation",
        },
        { status: 400 }
      );
    }

    // Fire-and-forget Modal API call (don't await)
    triggerModalTraining({
      datasets_object_key,
      gender,
      user_id,
      plan,
      studioID,
      supabase,
    }).catch((error) => {
      console.error("❌ Modal training trigger failed:", error);
      // Update studio status to failed in background
      supabase
        .from("studios")
        .update({ status: "FAILED", metadata: { error: error.message } })
        .eq("id", studioID)
        .then(() => console.log(`Studio ${studioID} marked as FAILED`));
    });

    // Return immediately with studio_id for redirect
    return NextResponse.json({
      success: true,
      studioId: studioID,
      message: "Studio created successfully. Training started in background.",
    });
  } catch (error) {
    console.error("❌ Studio creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fire-and-forget function for Modal API call
async function triggerModalTraining({
  datasets_object_key,
  gender,
  user_id,
  plan,
  studioID,
  supabase,
}) {
  const myHeaders = new Headers();
  myHeaders.append("Modal-Key", "modal-key");
  myHeaders.append("Modal-Secret", "modal-secret");
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    object_key: datasets_object_key,
    gender: gender,
    user_id: user_id,
    plan: plan,
    studio_id: studioID,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
    // Add timeout to prevent hanging
    signal: AbortSignal.timeout(30000), // 30 second timeout
  };

  const ModalResponse = await fetch(
    "https://ablognet--replicate-lora-trainer-dev.modal.run",
    requestOptions
  );

  if (!ModalResponse.ok) {
    throw new Error(`Modal API failed with status: ${ModalResponse.status}`);
  }

  console.log(`✅ Modal training started for studio ${studioID}`);
}

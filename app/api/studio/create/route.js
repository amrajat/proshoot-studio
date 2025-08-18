import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Helper functions
const createErrorResponse = (error, status = 400) => {
  return NextResponse.json({ success: false, error }, { status });
};

const createSuccessResponse = (data) => {
  return NextResponse.json({ success: true, ...data });
};

const getUserAttributes = (formData) => {
  const {
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
  } = formData;
  return {
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
};

const validateCredits = (creditsRecord, plan) => {
  const planLower = plan.toLowerCase();
  const availableCredits = creditsRecord[planLower] || 0;

  if (availableCredits < 1) {
    throw new Error(
      `Insufficient ${plan.toUpperCase()} credits. You have ${availableCredits} credits, but need at least 1 to create a studio.`
    );
  }
};

const cleanupFailedStudio = async (supabase, studioID) => {
  await supabase.from("studios").delete().eq("id", studioID);
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { studioData: studioFormData, user_id } = body;

    if (!user_id) {
      return createErrorResponse("User ID is required");
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

    // Extract required fields from studioFormData
    const {
      studioID,
      organization_id,
      studioName: name,
      images: datasets_object_key,
      style_pairs,
      plan,
    } = studioFormData;

    // Validate credits before creating studio
    const { data: creditsRecord, error: creditsError } = await supabase
      .from("credits")
      .select("starter, professional, studio, team, balance")
      .eq("user_id", user_id)
      .single();

    if (creditsError) {
      return createErrorResponse(
        "Unable to fetch credit balance. Please try again."
      );
    }

    if (!creditsRecord) {
      return createErrorResponse(
        "No credit record found. Please contact support."
      );
    }

    try {
      validateCredits(creditsRecord, plan);
    } catch (error) {
      return createErrorResponse(error.message);
    }

    // Create studio record after credit validation
    const user_attributes = getUserAttributes(studioFormData);

    const { error: studioError } = await supabase.from("studios").insert({
      id: studioID,
      creator_user_id: user_id,
      organization_id: organization_id || null,
      name,
      status: "PROCESSING",
      provider_id: null,
      provider: "REPLICATE",
      datasets_object_key,
      style_pairs,
      user_attributes,
      plan: plan.toUpperCase(),
      metadata: {},
    });

    if (studioError) {
      return createErrorResponse(
        `Failed to create studio: ${studioError.message}`,
        500
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
      await cleanupFailedStudio(supabase, studioID);
      return createErrorResponse(
        `Failed to deduct credits: ${creditError.message}`
      );
    }

    if (!creditResult?.success) {
      await cleanupFailedStudio(supabase, studioID);
      return createErrorResponse(
        creditResult?.error || "Insufficient credits for studio creation"
      );
    }

    // Trigger Modal API call and handle errors
    try {
      await triggerModalTraining({
        datasets_object_key,
        gender: studioFormData.gender,
        user_id,
        plan,
        studioID,
        supabase,
      });
    } catch (error) {
      // Update studio status to failed if Modal training fails
      await supabase
        .from("studios")
        .update({ status: "FAILED", metadata: { error: error.message } })
        .eq("id", studioID);

      return createErrorResponse(
        `Failed to start training: ${error.message}`,
        500
      );
    }

    return createSuccessResponse({
      studioId: studioID,
      message: "Studio created successfully. Training started in background.",
    });
  } catch (error) {
    return createErrorResponse("Internal server error", 500);
  }
}

// Modal API call function
async function triggerModalTraining({
  datasets_object_key,
  gender,
  user_id,
  plan,
  studioID,
  supabase,
}) {
  const myHeaders = new Headers();
  myHeaders.append("Modal-Key", process.env.MODAL_KEY);
  myHeaders.append("Modal-Secret", process.env.MODAL_SECRET);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    object_key: datasets_object_key,
    gender,
    user_id,
    plan,
    studio_id: studioID,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
    // Add timeout to prevent hanging
    signal: AbortSignal.timeout(45000), // 45 second timeout
  };

  const ModalResponse = await fetch(
    process.env.MODAL_TRAINING_ENDPOINT,
    requestOptions
  );

  if (!ModalResponse.ok) {
    throw new Error(`Modal API failed with status: ${ModalResponse.status}`);
  }
}

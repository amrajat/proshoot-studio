import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env, publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Constants
const VALID_PLANS = ["starter", "professional", "studio", "team"];
const MODAL_TIMEOUT_MS = 45000;

// Response helpers
const createErrorResponse = (error, status = 400) => {
  return NextResponse.json({ success: false, error }, { status });
};

const createSuccessResponse = (data) => {
  return NextResponse.json({ success: true, ...data });
};

// Validation helpers
const validateRequiredFields = (studioFormData) => {
  const {
    studioID,
    studioName: name,
    images: datasets_object_key,
    plan,
  } = studioFormData;

  if (!studioID || !name || !datasets_object_key || !plan) {
    throw new Error("Missing required studio fields");
  }

  if (!VALID_PLANS.includes(plan.toLowerCase())) {
    throw new Error("Invalid plan specified");
  }
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

// Data transformation helpers
const getUserAttributes = (formData) => {
  const { gender, ethnicity, hairLength, hairColor, hairType, glasses } =
    formData;

  return {
    trigger_word: "ohwx",
    gender,
    ethnicity,
    hairLength,
    hairColor,
    hairType,
    glasses,
  };
};

const buildStudioRecord = (studioFormData, user, user_attributes) => {
  const {
    studioID,
    organization_id,
    studioName: name,
    images: datasets_object_key,
    style_pairs,
    plan,
  } = studioFormData;

  return {
    id: studioID,
    creator_user_id: user.id,
    organization_id: organization_id || null,
    name,
    status: "PROCESSING",
    provider_id: null,
    provider: "MODAL",
    datasets_object_key,
    style_pairs,
    user_attributes,
    plan: plan.toUpperCase(),
    metadata: {},
  };
};

// Database operations
const updateStudioStatus = async (
  supabase,
  studioID,
  status = "PAYMENT_PENDING"
) => {
  const { error } = await supabase
    .from("studios")
    .update({ status })
    .eq("id", studioID);

  if (error) {
    console.error(
      `Failed to update studio ${studioID} status to ${status}:`,
      error
    );
  }
};

const fetchUserCredits = async (supabase, userId) => {
  const { data: creditsRecord, error: creditsError } = await supabase
    .from("credits")
    .select("starter, professional, studio, team, balance")
    .eq("user_id", userId)
    .single();

  if (creditsError) {
    throw new Error("Unable to fetch credit balance. Please try again.");
  }

  if (!creditsRecord) {
    throw new Error("No credit record found. Please contact support.");
  }

  return creditsRecord;
};

const createStudioRecord = async (supabase, studioRecord) => {
  const { error: studioError } = await supabase
    .from("studios")
    .insert(studioRecord);

  if (studioError) {
    throw new Error(`Failed to create studio: ${studioError.message}`);
  }
};

const deductCredits = async (supabase, user, studioFormData) => {
  const { studioID, organization_id, studioName: name, plan } = studioFormData;

  const { data: creditResult, error: creditError } = await supabase.rpc(
    "deduct_credits",
    {
      p_user_id: user.id,
      p_plan: plan.toLowerCase(),
      p_credits_to_deduct: 1,
      p_context: organization_id ? "ORGANIZATION" : "PERSONAL",
      p_studio_id: studioID,
      p_description: `Studio creation - ${plan.toUpperCase()} plan (${name})`,
    }
  );

  if (creditError) {
    throw new Error(`Failed to deduct credits: ${creditError.message}`);
  }

  if (!creditResult?.success) {
    throw new Error(
      creditResult?.error || "Insufficient credits for studio creation"
    );
  }

  return creditResult;
};

// External API operations
const triggerModalTraining = async ({
  datasets_object_key,
  gender,
  user_id,
  plan,
  studioID,
}) => {
  const headers = new Headers({
    "Modal-Key": env.MODAL_KEY,
    "Modal-Secret": env.MODAL_SECRET,
    "Content-Type": "application/json",
  });

  const payload = {
    object_key: datasets_object_key,
    gender,
    user_id,
    plan,
    studio_id: studioID,
  };

  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    redirect: "follow",
    signal: AbortSignal.timeout(MODAL_TIMEOUT_MS),
  };

  // const response = await fetch(
  //   env.MODAL_TRAINING_ENDPOINT_V2,
  //   requestOptions
  // );

  // if (!response.ok) {
  //   throw new Error(`Modal API failed with status: ${response.status}`);
  // }

  console.log("modal api called via api/studio/create");
};

// Main handler
export async function POST(request) {
  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse("Authentication required", 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const { studioData: studioFormData } = body;

    if (!studioFormData) {
      return createErrorResponse("Studio data is required");
    }

    // Validate required fields and plan
    try {
      validateRequiredFields(studioFormData);
    } catch (error) {
      return createErrorResponse(error.message);
    }

    // Fetch and validate user credits
    let creditsRecord;
    try {
      creditsRecord = await fetchUserCredits(supabase, user.id);
      validateCredits(creditsRecord, studioFormData.plan);
    } catch (error) {
      return createErrorResponse(error.message);
    }

    // Prepare studio data
    const user_attributes = getUserAttributes(studioFormData);
    const studioRecord = buildStudioRecord(
      studioFormData,
      user,
      user_attributes
    );

    // Create studio record
    try {
      await createStudioRecord(supabase, studioRecord);
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }

    // Deduct credits
    try {
      await deductCredits(supabase, user, studioFormData);
    } catch (error) {
      await updateStudioStatus(
        supabase,
        studioFormData.studioID,
        "PAYMENT_PENDING"
      );
      return createErrorResponse(error.message);
    }

    // Trigger Modal training
    try {
      await triggerModalTraining({
        datasets_object_key: studioFormData.images,
        gender: user_attributes.gender,
        user_id: user.id,
        plan: studioFormData.plan.toLowerCase(),
        studioID: studioFormData.studioID,
      });
    } catch (error) {
      await updateStudioStatus(supabase, studioFormData.studioID, "FAILED");
      return createErrorResponse(
        `Modal training failed: ${error.message}`,
        500
      );
    }

    return createSuccessResponse({
      studioId: studioFormData.studioID,
      message: "Studio created successfully. Training started in background.",
    });
  } catch (error) {
    console.error("Studio creation error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

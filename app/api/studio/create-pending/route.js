import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, publicEnv } from "@/lib/env";

// Constants
const VALID_PLANS = ["starter", "professional", "studio", "team"];

// Response helpers
const createErrorResponse = (message, status = 400) => {
  return NextResponse.json({ success: false, error: message }, { status });
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

// Data transformation helpers
const getUserAttributes = (studioFormData) => {
  const { gender, ethnicity, hairColor, hairLength, hairType, glasses } = studioFormData;

  return {
    trigger_word: "ohwx",
    gender,
    ethnicity,
    hair_length: hairLength,
    hair_color: hairColor,
    hair_type: hairType,
    glasses,
  };
};

const buildPendingStudioRecord = (studioFormData, user) => {
  const {
    studioID,
    organization_id,
    studioName: name,
    images: datasets_object_key,
    style_pairs,
    plan,
  } = studioFormData;

  const user_attributes = getUserAttributes(studioFormData);

  return {
    id: studioID,
    creator_user_id: user.id,
    organization_id: organization_id || null,
    name,
    status: "PAYMENT_PENDING",
    provider_id: null,
    provider: "MODAL",
    weights: `${studioID}/lora.safetensors`,
    datasets_object_key,
    style_pairs,
    user_attributes,
    plan: plan.toUpperCase(),
    metadata: {},
  };
};

// Database operations with UPSERT logic
const createOrUpdatePendingStudio = async (supabase, studioRecord) => {
  // First, check if studio already exists
  const { data: existingStudio, error: checkError } = await supabase
    .from("studios")
    .select("id, status")
    .eq("id", studioRecord.id)
    .single();

  // If check fails for reasons other than "not found", throw error
  if (checkError && checkError.code !== "PGRST116") {
    console.error("Database check error:", checkError);
    throw new Error("DATABASE_CHECK_ERROR");
  }

  if (existingStudio) {
    // Studio exists - check status
    if (existingStudio.status === "PAYMENT_PENDING") {
      // Allow retry - UPDATE the existing record with ALL fields
      const { error: updateError } = await supabase
        .from("studios")
        .update({
          name: studioRecord.name,
          datasets_object_key: studioRecord.datasets_object_key,
          style_pairs: studioRecord.style_pairs,
          user_attributes: studioRecord.user_attributes,
          plan: studioRecord.plan,
          organization_id: studioRecord.organization_id,
          weights: studioRecord.weights,
          updated_at: new Date().toISOString(),
        })
        .eq("id", studioRecord.id);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error("DATABASE_UPDATE_ERROR");
      }

      return { isUpdate: true, status: existingStudio.status };
    } else {
      // Studio already processing/completed - return existing status
      return { alreadyExists: true, status: existingStudio.status };
    }
  } else {
    // New studio - INSERT with ALL fields
    const { error: insertError } = await supabase
      .from("studios")
      .insert(studioRecord);

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("DATABASE_INSERT_ERROR");
    }

    return { isNew: true };
  }
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
      console.error("Validation error:", error);
      return createErrorResponse("Invalid studio data");
    }

    // Build studio record
    const studioRecord = buildPendingStudioRecord(studioFormData, user);

    // Create or update pending studio with UPSERT logic
    try {
      const result = await createOrUpdatePendingStudio(supabase, studioRecord);

      // Handle different scenarios
      if (result.alreadyExists) {
        // Studio already exists and is not PAYMENT_PENDING
        return createSuccessResponse({
          studioId: studioFormData.studioID,
          alreadyExists: true,
          status: result.status,
          message: `Studio already exists with status: ${result.status}`,
        });
      }

      if (result.isUpdate) {
        // Studio was updated (retry scenario)
        return createSuccessResponse({
          studioId: studioFormData.studioID,
          isUpdate: true,
          message: "Studio created.",
        });
      }

      // New studio created
      return createSuccessResponse({
        studioId: studioFormData.studioID,
        message: "Studio created.",
      });
    } catch (error) {
      console.error("Studio creation error:", error);
      return createErrorResponse("Unable to create studio. Please try again.", 500);
    }
  } catch (error) {
    console.error("Create pending studio error:", error);
    return createErrorResponse("Unable to process your request. Please try again.", 500);
  }
}

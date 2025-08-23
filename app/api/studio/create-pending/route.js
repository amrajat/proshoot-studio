import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  const { gender, age, ethnicity, eyeColor, hairColor, hairStyle } =
    studioFormData;

  return {
    gender: gender || "",
    age: age || "",
    ethnicity: ethnicity || "",
    eye_color: eyeColor || "",
    hair_color: hairColor || "",
    hair_style: hairStyle || "",
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
    datasets_object_key,
    style_pairs,
    user_attributes,
    plan: plan.toUpperCase(),
    metadata: {},
  };
};

// Database operations
const createPendingStudio = async (supabase, studioRecord) => {
  const { error: studioError } = await supabase
    .from("studios")
    .insert(studioRecord);

  if (studioError) {
    throw new Error(`Failed to create pending studio: ${studioError.message}`);
  }
};

// Main handler
export async function POST(request) {
  try {
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

    // Build studio record
    const studioRecord = buildPendingStudioRecord(studioFormData, user);

    // Create pending studio
    try {
      await createPendingStudio(supabase, studioRecord);
    } catch (error) {
      console.error("Studio creation error:", error);
      return createErrorResponse(error.message, 500);
    }

    return createSuccessResponse({
      studioId: studioFormData.studioID,
      message: "Studio created with PAYMENT_PENDING status.",
    });
  } catch (error) {
    console.error("Create pending studio error:", error);
    return createErrorResponse(
      "An unexpected error occurred while creating studio",
      500
    );
  }
}

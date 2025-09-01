import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";
import { env, publicEnv } from "@/lib/env";

// Constants
const MODAL_TIMEOUT_MS = 45000;

// Response helpers
const createErrorResponse = (message, status = 400) => {
  return NextResponse.json({ success: false, error: message }, { status });
};

const createSuccessResponse = (data) => {
  return NextResponse.json({ success: true, ...data });
};

// Security helpers
const verifyWebhookSignature = (rawBody, signature) => {
  if (!signature || !env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error("Missing signature or webhook secret");
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET);
    hmac.update(rawBody, "utf8");
    const expectedSignature = hmac.digest("hex");

    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace(/^sha256=/, "");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(cleanSignature, "hex")
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// Validation helpers
const validateRequestBody = (body) => {
  const { studioId, user_id } = body;

  if (!studioId || !user_id) {
    throw new Error("Studio ID and user ID are required");
  }

  return { studioId, user_id };
};

// Database operations
const fetchPendingStudio = async (supabase, studioId, user_id) => {
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select("*")
    .eq("id", studioId)
    .eq("creator_user_id", user_id)
    .eq("status", "PAYMENT_PENDING")
    .single();

  if (studioError || !studio) {
    throw new Error(
      `Studio not found or not in PAYMENT_PENDING status: ${
        studioError?.message || "Not found"
      }`
    );
  }

  return studio;
};

const updateStudioStatus = async (supabase, studioId, status) => {
  const { error: updateError } = await supabase
    .from("studios")
    .update({ status })
    .eq("id", studioId);

  if (updateError) {
    throw new Error(`Failed to update studio status: ${updateError.message}`);
  }
};

const deductStudioCredits = async (supabase, studio, user_id, studioId) => {
  const { data: creditResult, error: creditError } = await supabase.rpc(
    "deduct_credits",
    {
      p_user_id: user_id,
      p_plan: studio.plan.toLowerCase(),
      p_credits_to_deduct: 1,
      p_context: studio.organization_id ? "ORGANIZATION" : "PERSONAL",
      p_studio_id: studioId,
      p_description: `Studio creation - ${studio.plan} plan (${studio.name}) - Postpaid`,
    }
  );

  if (creditError) {
    throw new Error(`Failed to deduct credits: ${creditError.message}`);
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
  const payload = {
    datasets_object_key,
    gender,
    user_id,
    plan,
    studioID,
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    redirect: "follow",
    signal: AbortSignal.timeout(MODAL_TIMEOUT_MS),
  };

  // const ModalResponse = await fetch(
  //   env.MODAL_TRAINING_ENDPOINT,
  //   requestOptions
  // );

  // if (!ModalResponse.ok) {
  //   throw new Error(`Modal API failed with status: ${ModalResponse.status}`);
  // }

  console.log("modal api called via api/studio/process");
};

// Main handler
export async function POST(request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("❌ Invalid webhook signature");
      return createErrorResponse("Unauthorized", 401);
    }

    // Parse and validate request body
    let studioId, user_id;
    try {
      const body = JSON.parse(rawBody);
      ({ studioId, user_id } = validateRequestBody(body));
    } catch (error) {
      return createErrorResponse(error.message);
    }

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

    // Fetch pending studio
    let studio;
    try {
      studio = await fetchPendingStudio(supabase, studioId, user_id);
    } catch (error) {
      console.error("Studio fetch error:", error);
      return createErrorResponse(error.message, 404);
    }

    // Update studio status to PROCESSING
    try {
      await updateStudioStatus(supabase, studioId, "PROCESSING");
    } catch (error) {
      console.error("Status update error:", error);
      return createErrorResponse(error.message, 500);
    }

    // Deduct credits for the studio
    try {
      await deductStudioCredits(supabase, studio, user_id, studioId);
      console.log("✅ Credits deducted successfully");
    } catch (error) {
      console.error("Credit deduction failed:", error);

      // Revert studio status to failed
      await updateStudioStatus(supabase, studioId, "FAILED").catch(
        console.error
      );

      return createErrorResponse(error.message, 500);
    }

    // Trigger Modal training
    try {
      await triggerModalTraining({
        datasets_object_key: studio.datasets_object_key,
        gender: studio.user_attributes.gender,
        user_id,
        plan: studio.plan.toLowerCase(),
        studioID: studioId,
      });

      console.log("✅ Modal training initiated successfully");
    } catch (error) {
      console.error("Modal training failed:", error);

      // Update studio status to failed
      await updateStudioStatus(supabase, studioId, "FAILED").catch(
        console.error
      );

      return createErrorResponse(
        `Modal training failed: ${error.message}`,
        500
      );
    }

    return createSuccessResponse({
      studioId,
      message: "Studio processed successfully and training initiated",
    });
  } catch (error) {
    console.error("Process studio error:", error);
    return createErrorResponse(
      "An unexpected error occurred while processing studio",
      500
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";
import { env, publicEnv } from "@/lib/env";
import * as Sentry from "@sentry/nextjs";

// Constants
const MODAL_TIMEOUT_MS = 45000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Response helpers
const createErrorResponse = (message, status = 400, context = {}) => {
  const errorMessage = typeof message === 'string' ? message : message.message || 'Unknown error';
  
  // Log to Sentry with context
  Sentry.captureException(new Error(errorMessage), {
    tags: {
      route: 'studio-process',
      status: status.toString()
    },
    extra: {
      ...context,
      timestamp: new Date().toISOString()
    }
  });
  
  console.error(`❌ Studio Process Error (${status}):`, errorMessage, context);
  return NextResponse.json({ success: false, error: errorMessage }, { status });
};

const createSuccessResponse = (data) => {
  console.log('✅ Studio Process Success:', data);
  
  // Track successful studio processing in Sentry
  Sentry.addBreadcrumb({
    message: 'Studio processed successfully',
    category: 'studio',
    level: 'info',
    data
  });
  
  return NextResponse.json({ success: true, ...data });
};

// Security helpers
const verifyInternalWebhookSecret = (request) => {
  const webhookSecret = request.headers.get("x-webhook-secret");
  
  if (!webhookSecret || !env.WEBHOOK_SECRET) {
    console.error("Missing webhook secret in internal call");
    return false;
  }
  
  return webhookSecret === env.WEBHOOK_SECRET;
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

const updateStudioStatus = async (supabase, studioId, status, context = '') => {
  console.log(`📝 Updating studio ${studioId} status to ${status}${context ? ` (${context})` : ''}`);
  
  const { error: updateError } = await supabase
    .from("studios")
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", studioId);

  if (updateError) {
    console.error(`❌ Failed to update studio ${studioId} status to ${status}:`, updateError);
    throw new Error(`Failed to update studio status: ${updateError.message}`);
  }
  
  console.log(`✅ Studio ${studioId} status updated to ${status}`);
  
  Sentry.addBreadcrumb({
    message: `Studio status updated to ${status}`,
    category: 'database',
    level: 'info',
    data: { studioId, status, context }
  });
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

// Retry utility with exponential backoff
const retryWithBackoff = async (fn, maxRetries = MAX_RETRIES, baseDelay = RETRY_DELAY_MS) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// External API operations
const triggerModalTraining = async ({
  datasets_object_key,
  gender,
  user_id,
  plan,
  studioID,
  trigger_word = "ohwx",
  steps = 3000,
  webhook_url = ""
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
    trigger_word,
    steps,
    webhook_url
  };

  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    redirect: "follow",
    signal: AbortSignal.timeout(MODAL_TIMEOUT_MS),
  };

  if (!env.MODAL_TRAINING_ENDPOINT_V2) {
    throw new Error("Modal training endpoint not configured");
  }

  const response = await retryWithBackoff(async () => {
    const res = await fetch(env.MODAL_TRAINING_ENDPOINT_V2, requestOptions);
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      const error = new Error(`Modal API Error: ${res.status} - ${errorText}`);
      error.status = res.status;
      error.response = errorText;
      throw error;
    }
    
    return res;
  });

  const result = await response.json().catch(() => ({}));
  
  // Log successful training initiation
  Sentry.addBreadcrumb({
    message: 'Modal training initiated',
    category: 'modal',
    level: 'info',
    data: { studioID, steps, plan }
  });
  
  console.log(`🚀 Modal training started for studio ${studioID} with ${steps} steps`);
  return result;
};

// Main handler
export async function POST(request) {
  return await Sentry.withScope(async (scope) => {
    scope.setTag('route', 'studio-process');
    scope.setContext('request', {
      method: 'POST',
      url: request.url,
      timestamp: new Date().toISOString()
    });

    return await Sentry.startSpan(
      {
        name: 'POST /api/studio/process',
        op: 'http.server'
      },
      async () => {
        try {
          // Verify internal webhook secret
          if (!verifyInternalWebhookSecret(request)) {
            console.error("❌ Invalid internal webhook secret");
            return createErrorResponse("Unauthorized", 401, {
              hasSecret: !!env.WEBHOOK_SECRET
            });
          }
          
          Sentry.addBreadcrumb({
            message: 'Internal webhook secret verified',
            category: 'security',
            level: 'info'
          });

          // Parse and validate request body
          let studioId, user_id;
          try {
            const body = await request.json();
            ({ studioId, user_id } = validateRequestBody(body));
      
      // Set user context for Sentry
      Sentry.setUser({ id: user_id });
      
    } catch (error) {
      console.error("Request validation error:", error);
      return createErrorResponse("Invalid request data", 400, {
        parseError: error.message
      });
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
      
      Sentry.addBreadcrumb({
        message: 'Pending studio fetched',
        category: 'database',
        level: 'info',
        data: { studioId, plan: studio.plan }
      });
    } catch (error) {
      console.error("Studio fetch error:", error);
      return createErrorResponse("Studio not found or invalid", 404, {
        studioId,
        user_id,
        error: error.message
      });
    }

    // Update studio status to PROCESSING
    try {
      await updateStudioStatus(supabase, studioId, "PROCESSING", 'payment-processed');
    } catch (error) {
      console.error("Status update error:", error);
      return createErrorResponse("Failed to process studio", 500, {
        studioId,
        operation: 'status-update-processing',
        error: error.message
      });
    }

    // Deduct credits for the studio
    try {
      const creditResult = await deductStudioCredits(supabase, studio, user_id, studioId);
      
      Sentry.addBreadcrumb({
        message: 'Credits deducted successfully',
        category: 'credits',
        level: 'info',
        data: { 
          studioId,
          plan: studio.plan,
          success: creditResult.success
        }
      });
    } catch (error) {
      // Revert studio status to failed with proper error handling
      try {
        await updateStudioStatus(supabase, studioId, "FAILED", 'credit-deduction-failed');
      } catch (rollbackError) {
        Sentry.captureException(rollbackError, {
          tags: { operation: 'rollback-studio-status' },
          extra: { studioId }
        });
      }

      return createErrorResponse("Failed to process studio", 500, {
        studioId,
        operation: 'credit-deduction',
        error: error.message
      });
    }

    // Trigger Modal training
    try {
      const modalResult = await triggerModalTraining({
        datasets_object_key: studio.datasets_object_key,
        gender: studio.user_attributes?.gender || 'person',
        user_id,
        plan: studio.plan.toLowerCase(),
        studioID: studioId,
        trigger_word: studio.user_attributes?.trigger_word || "ohwx",
        steps: 3000,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/generate`
      });

      return createSuccessResponse({
        studioId,
        message: "Studio processed successfully and training initiated",
      });
    } catch (error) {
      // Update studio status to failed with comprehensive error handling
      try {
        await updateStudioStatus(supabase, studioId, "FAILED", 'modal-training-failed');
        
        Sentry.addBreadcrumb({
          message: 'Studio status updated to FAILED after training error',
          category: 'database',
          level: 'warning',
          data: { studioId }
        });
      } catch (updateError) {
        Sentry.captureException(updateError, {
          tags: { operation: 'update-studio-status-failed' },
          extra: { studioId }
        });
      }

      return createErrorResponse("Failed to start training. Please try again later.", 500, {
        studioId,
        operation: 'modal-training',
        modalError: error.message,
        modalStatus: error.status
      });
    }
        } catch (error) {
          // Capture unexpected errors
          Sentry.captureException(error, {
            tags: {
              route: 'studio-process',
              operation: 'unexpected-error'
            },
            extra: {
              timestamp: new Date().toISOString()
            }
          });
          
          console.error("Process studio error:", error);
          return createErrorResponse(
            "An unexpected error occurred while processing studio",
            500,
            { error: error.message }
          );
        }
      }
    );
  });
}

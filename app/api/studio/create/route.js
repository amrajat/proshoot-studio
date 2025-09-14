import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { env, publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Constants
const VALID_PLANS = ["starter", "professional", "studio", "team"];
const MODAL_TIMEOUT_MS = 45000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Response helpers
const createErrorResponse = (error, status = 400, context = {}) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
  
  // Log to Sentry with context
  Sentry.captureException(new Error(errorMessage), {
    tags: {
      route: 'studio-create',
      status: status.toString()
    },
    extra: {
      ...context,
      timestamp: new Date().toISOString()
    }
  });
  
  console.error(`❌ Studio Create Error (${status}):`, errorMessage, context);
  return NextResponse.json({ success: false, error: errorMessage }, { status });
};

const createSuccessResponse = (data) => {
  console.log('✅ Studio Create Success:', data);
  
  // Track successful studio creation in Sentry
  Sentry.addBreadcrumb({
    message: 'Studio created successfully',
    category: 'studio',
    level: 'info',
    data
  });
  
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
    console.log(studioError)
    throw new Error("Failed to create studio. Please try again later.");
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
  webhook_url = `${publicEnv.NEXT_PUBLIC_APP_URL}/api/webhooks/generate`
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
    scope.setTag('route', 'studio-create');
    scope.setContext('request', {
      method: 'POST',
      url: request.url,
      timestamp: new Date().toISOString()
    });

    return await Sentry.startSpan(
      {
        name: 'POST /api/studio/create',
        op: 'http.server'
      },
      async () => {
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
            return createErrorResponse("Authentication required", 401, {
              authError: authError?.message,
              hasUser: !!user
            });
          }
          
          // Set user context for Sentry
          Sentry.setUser({
            id: user.id,
            email: user.email
          });

          // Parse and validate request body
          let body, studioFormData;
          try {
            body = await request.json();
            studioFormData = body.studioData;
            
            if (!studioFormData) {
              throw new Error('Studio data is required');
            }
          } catch (error) {
            return createErrorResponse("Invalid request body or missing studio data", 400, {
              parseError: error.message
            });
          }

          // Validate required fields and plan
          try {
            validateRequiredFields(studioFormData);
          } catch (error) {
            return createErrorResponse(error.message, 400, {
              studioFormData: {
                studioID: studioFormData?.studioID,
                plan: studioFormData?.plan,
                hasImages: !!studioFormData?.images,
                hasName: !!studioFormData?.studioName
              }
            });
          }

          // Fetch and validate user credits
          let creditsRecord;
          try {
            creditsRecord = await fetchUserCredits(supabase, user.id);
            validateCredits(creditsRecord, studioFormData.plan);
          } catch (error) {
            return createErrorResponse(error.message, 400, {
              userId: user.id,
              plan: studioFormData.plan,
              creditsRecord: creditsRecord ? {
                starter: creditsRecord.starter,
                professional: creditsRecord.professional,
                studio: creditsRecord.studio,
                team: creditsRecord.team
              } : null
            });
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
            
            Sentry.addBreadcrumb({
              message: 'Studio record created',
              category: 'database',
              level: 'info',
              data: { studioId: studioRecord.id, plan: studioRecord.plan }
            });
          } catch (error) {
            return createErrorResponse("Failed to create studio record", 500, {
              studioId: studioRecord.id,
              error: error.message
            });
          }

          // Deduct credits
          try {
            const creditResult = await deductCredits(supabase, user, studioFormData);
            
            Sentry.addBreadcrumb({
              message: 'Credits deducted successfully',
              category: 'credits',
              level: 'info',
              data: { 
                studioId: studioFormData.studioID,
                plan: studioFormData.plan,
                success: creditResult.success
              }
            });
          } catch (error) {
            // Rollback studio status
            try {
              await updateStudioStatus(supabase, studioFormData.studioID, "PAYMENT_PENDING");
            } catch (rollbackError) {
              Sentry.captureException(rollbackError, {
                tags: { operation: 'rollback-studio-status' },
                extra: { studioId: studioFormData.studioID }
              });
            }
            
            return createErrorResponse(error.message, 400, {
              studioId: studioFormData.studioID,
              operation: 'credit-deduction'
            });
          }

          // Trigger Modal training
          try {
            const modalResult = await triggerModalTraining({
              datasets_object_key: studioFormData.images,
              gender: user_attributes.gender || 'person',
              user_id: user.id,
              plan: studioFormData.plan.toLowerCase(),
              studioID: studioFormData.studioID,
              trigger_word: user_attributes.trigger_word || "ohwx",
              steps: 3000,
              webhook_url: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/webhooks/generate`
            });

          } catch (error) {
            // Update studio status to failed with comprehensive error handling
            try {
              await updateStudioStatus(supabase, studioFormData.studioID, "FAILED");
              
              Sentry.addBreadcrumb({
                message: 'Studio status updated to FAILED after training error',
                category: 'database',
                level: 'warning',
                data: { studioId: studioFormData.studioID }
              });
            } catch (updateError) {
              Sentry.captureException(updateError, {
                tags: { operation: 'update-studio-status-failed' },
                extra: { studioId: studioFormData.studioID }
              });
            }

            return createErrorResponse("Failed to start training. Please try again later.", 500, {
              studioId: studioFormData.studioID,
              operation: 'modal-training',
              modalError: error.message,
              modalStatus: error.status
            });
          }

          return createSuccessResponse({
            studioId: studioFormData.studioID,
            message: "Studio created successfully. Training started in background.",
          });
        } catch (error) {
          // Capture unexpected errors
          Sentry.captureException(error, {
            tags: {
              route: 'studio-create',
              operation: 'unexpected-error'
            },
            extra: {
              timestamp: new Date().toISOString()
            }
          });
          
          return createErrorResponse("An unexpected error occurred while creating studio", 500, {
            error: error.message
          });
        }
      }
    );
  });
}

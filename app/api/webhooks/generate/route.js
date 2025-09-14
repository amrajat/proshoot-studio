import { NextResponse } from "next/server";
import crypto from 'crypto';
import { createServerClient } from "@supabase/ssr";
import { env, publicEnv } from '@/lib/env';
import config from '@/config';
import { cookies } from "next/headers";

// Verify webhook signature for security
const verifyWebhookSignature = (payload, signature, secret) => {
  if (!signature || !secret) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
};

// Call secure prompts API
const callPromptsAPI = async (userCharacterInputs, stylePairs, stylesLimit) => {
  const response = await fetch(`${env.URL}/api/prompts/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.WEBHOOK_SECRET
    },
    body: JSON.stringify({
      userCharacterInputs,
      stylePairs,
      stylesLimit
    })
  });
  
  if (!response.ok) {
    throw new Error(`Prompts API failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.prompts;
};

// Call ComfyUI headshot generation API with retry mechanism
const callHeadshotAPI = async (studio_id, weights_url, user_id, prompt, sendemail, user_email, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Add small delay between attempts to avoid rate limiting
      if (attempt > 1) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(env.MODAL_COMFYUI_STANDARD_ENDPOINT_V2, {
        method: 'POST',
        headers: {
          'Modal-Key': env.MODAL_KEY,
          'Modal-Secret': env.MODAL_SECRET,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studio_id,
          weights_url,
          user_id,
          prompt,
          sendemail,
          user_email
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // Log error for debugging
        console.error(`ComfyUI API Error (attempt ${attempt}/${retries}) - Status: ${response.status}, Response: ${errorText}`);
        
        // Don't retry on 400 errors (client errors) - only retry on 5xx errors
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Headshot API failed: ${response.status} - ${errorText}`);
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw new Error(`Headshot API failed after ${retries} attempts: ${response.status} - ${errorText}`);
        }
        
        // Continue to next attempt for 5xx errors
        continue;
      }
      
      return await response.json();
      
    } catch (error) {
      // Log error for debugging
      console.error(`ComfyUI API call attempt ${attempt}/${retries} failed:`, error.message);
      
      // If this is the last attempt or it's a 4xx error, throw
      if (attempt === retries || error.message.includes('400')) {
        throw error;
      }
    }
  }
};


// Create error response helper
const createErrorResponse = (message, status = 400) => {
  return NextResponse.json({ error: message }, { status });
};

// Create success response helper
const createSuccessResponse = (data) => {
  return NextResponse.json({ success: true, ...data });
};

export async function POST(request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('X-Webhook-Signature');
    
    // Verify webhook signature
    if (env.WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature, env.WEBHOOK_SECRET)) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Parse the webhook payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      return createErrorResponse('Invalid JSON payload');
    }
    
    const { studio_id, user_id, status } = payload;
    
    // Validate required fields
    if (!studio_id || !user_id || !status) {
      return createErrorResponse('Missing required fields: studio_id, user_id, status');
    }
    
    // Only process completed training
    if (status !== 'completed') {
      return createSuccessResponse({ message: 'Webhook received but not processed (status not completed)' });
    }
        
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createServerClient(
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
    
    // Fetch studio data from database
    const { data: studio, error: studioError } = await supabase
      .from('studios')
      .select(`
        *,
        user_attributes,
        style_pairs
      `)
      .eq('id', studio_id)
      .eq('creator_user_id', user_id)
      .single();
    
    if (studioError || !studio) {
      return createErrorResponse('Studio not found');
    }
    
    
    
    // Get styles limit from config based on plan
    const planConfig = config.PLANS[studio.plan.toLowerCase()];
    if (!planConfig) {
      return createErrorResponse('Invalid studio plan');
    }
    
    const stylesLimit = planConfig.stylesLimit;
    
    // Generate prompts using secure API
    const generatedPrompts = await callPromptsAPI(
      studio.user_attributes,
      studio.style_pairs,
      stylesLimit
    );
    
    if (!generatedPrompts || generatedPrompts.length === 0) {
      return createErrorResponse('Failed to generate prompts');
    }
    
    // Get user email for notifications
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user_id)
      .single();
    
    const user_email = userProfile?.email || 'support@proshoot.co';
    
    // Process each prompt to generate headshots
    const allPromises = generatedPrompts.map((prompt, index) => {
      const isLastPrompt = index === generatedPrompts.length - 1;
      
      return callHeadshotAPI(
        studio_id,
        `${studio_id}/lora.safetensors`, // weights_url path in R2
        user_id,
        prompt.prompt,
        isLastPrompt, // sendemail only for last prompt
        user_email
      ).then(() => {
        return { success: true, index: index + 1 };
      }).catch((error) => {
        return { success: false, index: index + 1, error: error.message };
      });
    });
    
    const results = await Promise.allSettled(allPromises);
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;
    
    const processedCount = successful;
    
    // Studio status will be updated to COMPLETED by ComfyUI when sendemail=true (last prompt)
    // No need to update status here as it's handled in the ComfyUI function
    
    return createSuccessResponse({
      message: 'Headshot generation initiated for all prompts',
      studio_id,
      prompts_count: generatedPrompts.length,
      processed_count: processedCount,
      status: processedCount > 0 ? 'COMPLETED' : 'FAILED'
    });
    
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}

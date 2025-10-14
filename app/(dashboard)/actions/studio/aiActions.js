"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env, publicEnv } from "@/lib/env";

/**
 * Generate Similar Image Action - Handles credit deduction and ComfyUI API call
 * Costs 500 credits from the user's balance
 */
export async function generateSimilarImageAction(formData) {
  try {
    const headshotId = formData.get("headshotId");
    const studioId = formData.get("studioId");

    // Validate required parameters
    if (!headshotId || !studioId) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Get current user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Use service role client for database operations
    const cookieStore = cookies();
    const serviceSupabase = createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Check if user has sufficient credits (don't deduct yet)
    const CREDITS_COST = 500;
    const { data: userCredits, error: creditsCheckError } = await serviceSupabase
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (creditsCheckError) {
      console.error("Credits check error:", creditsCheckError);
      return {
        success: false,
        error: "Failed to check credits",
      };
    }

    if (!userCredits || userCredits.balance < CREDITS_COST) {
      return {
        success: false,
        error: "Insufficient credits",
        insufficientCredits: true,
        currentCredits: userCredits?.balance || 0,
        requiredCredits: CREDITS_COST,
      };
    }

    // Fetch headshot data and prompt
    const { data: headshot, error: headshotError } = await serviceSupabase
      .from("headshots")
      .select("prompt, studio_id")
      .eq("id", headshotId)
      .single();

    if (headshotError || !headshot) {
      console.error("Headshot fetch error:", headshotError);
      return {
        success: false,
        error: "Failed to fetch headshot data",
      };
    }

    // Fetch studio data for weights
    const { data: studio, error: studioError } = await serviceSupabase
      .from("studios")
      .select("weights")
      .eq("id", studioId)
      .single();

    if (studioError || !studio) {
      console.error("Studio fetch error:", studioError);
      return {
        success: false,
        error: "Failed to fetch studio data",
      };
    }

    // Use weights from database or default to studioId+lora.safetensors
    const weightsUrl = studio.weights || `${studioId}+lora.safetensors`;

    // Call ComfyUI API
    try {
      const response = await fetch(env.MODAL_COMFYUI_STANDARD_ENDPOINT_V2, {
        method: 'POST',
        headers: {
          'Modal-Key': env.MODAL_KEY,
          'Modal-Secret': env.MODAL_SECRET,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studio_id: studioId,
          weights_url: weightsUrl,
          user_id: user.id,
          prompt: headshot.prompt,
          sendemail: false,
          user_email: user.email,
          batch_size: 4
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ComfyUI API Error:', response.status, errorText);
        return {
          success: false,
          error: "Image generation failed",
        };
      }

      // Only deduct credits after successful API call
      const { data: creditResult, error: creditError } = await serviceSupabase.rpc(
        "deduct_credits",
        {
          p_user_id: user.id,
          p_plan: "balance",
          p_credits_to_deduct: CREDITS_COST,
          p_context: "PERSONAL",
          p_studio_id: studioId,
          p_description: `Generate Similar Images (${CREDITS_COST} credits)`,
        }
      );

      if (creditError || !creditResult.success) {
        console.error("Credit deduction error after successful generation:", creditError || creditResult);
        return {
          success: false,
          error: "Credit processing failed after successful generation",
        };
      }

      return {
        success: true,
        message: "Similar images are being generated. You will receive an email notification when ready.",
        creditsUsed: CREDITS_COST,
        remainingCredits: creditResult.remaining_credits,
      };

    } catch (apiError) {
      console.error("ComfyUI API error:", apiError);
      return {
        success: false,
        error: "Image generation service unavailable",
      };
    }

  } catch (error) {
    console.error("Generate Similar Action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
